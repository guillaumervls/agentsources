import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { getPackageJson } from "./resolver";

const getInstallCommand = (packageName: string): [string, ...string[]] => {
  // Check for lockfiles in priority order
  if (existsSync("bun.lockb")) return ["bun", "add", "--dev", packageName];
  if (existsSync("pnpm-lock.yaml"))
    return ["pnpm", "add", "--save-dev", packageName];
  if (existsSync("yarn.lock")) return ["yarn", "add", "--dev", packageName];
  return ["npm", "install", "--save-dev", packageName];
};

export const isPackageInstalled = (packageName: string): boolean => {
  try {
    const packageJson = getPackageJson();

    const dependencies = packageJson.dependencies ?? {};
    const devDependencies = packageJson.devDependencies ?? {};

    return packageName in dependencies || packageName in devDependencies;
  } catch {
    return false;
  }
};

export async function installPackage(packageName: string): Promise<void> {
  const installCommand = getInstallCommand(packageName);
  const [cmd, ...args] = installCommand;

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      env: process.env,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Installation failed with exit code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(new Error(`Failed to spawn ${cmd}: ${error.message}`));
    });
  });
}
