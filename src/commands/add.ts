import { existsSync } from "node:fs";
import { installPackage, isPackageInstalled } from "../installer";
import { getPackageJson, hasAgentSources } from "../resolver";
import { failWithHelpfulError } from "../helpful-error";
import generateCommand from "./generate";
import { addPackageToPackageJsonAgentSources } from "../formatter";

export async function addCommand(packageName: string): Promise<void> {
  console.log(`Processing package: ${packageName}`);

  const isInstalled =
    existsSync("package.json") && isPackageInstalled(packageName);

  if (!isInstalled) {
    console.log(`Package not found. Installing ${packageName}...`);
    await installPackage(packageName);
    console.log(`Successfully installed ${packageName}`);
  } else {
    console.log(`Package ${packageName} is already installed`);
  }

  const dependencyPackageJson = getPackageJson(packageName);

  if (!hasAgentSources(dependencyPackageJson))
    return failWithHelpfulError(packageName);

  addPackageToPackageJsonAgentSources(packageName);

  generateCommand();
}
