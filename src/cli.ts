#!/usr/bin/env node

import { Command } from "commander";
import { addCommand } from "./commands/add";
import { PackageJson } from "pkg-types";
import * as rawPackageJson from "../package.json";
import generateCommand from "./commands/generate";

const packageJson = rawPackageJson as PackageJson;

const program = new Command();

program
  .name("agentsources")
  .description("Manage agent documentation dependencies for AGENTS.md")
  .version(packageJson.version ?? "0.0.0");

program
  .command("add")
  .description("Add a package and link its agent documentation to AGENTS.md")
  .argument("<package>", "Package name to add")
  .action(async (packageName: string) => {
    await addCommand(packageName);
  });

program
  .command("generate", { isDefault: true })
  .description(
    "Apply all agent documentation listed in package.json to AGENTS.md file",
  )
  .action(() => {
    generateCommand();
  });

program.parse();
