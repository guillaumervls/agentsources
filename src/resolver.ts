import { readFileSync } from "node:fs";
import { findPackageJSON } from "node:module";
import { dirname, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { PackageJson } from "pkg-types";
import z from "zod";

const getPackageJsonLocation = (packageName: string): string => {
  const result = findPackageJSON(
    packageName,
    pathToFileURL(process.cwd() + sep),
  );
  if (!result)
    throw new Error(
      `Could not find package.json for "${packageName}". Make sure the package is installed.`,
    );
  return relative(process.cwd(), result);
};

export const getPackageDirectory = (packageName: string): string => {
  return dirname(getPackageJsonLocation(packageName));
};

export const getPackageJson = (packageName?: string): PackageJson => {
  return JSON.parse(
    readFileSync(
      packageName ? getPackageJsonLocation(packageName) : "package.json",
      "utf-8",
    ),
  ) as PackageJson;
};

export const hasAgentSources = (packageJson: PackageJson): boolean => {
  return "agentsources" in packageJson;
};

export const AgentSourcesSchema = z.object({
  imports: z.record(z.string(), z.object({})).optional(),
  exports: z
    .record(
      z.string(),
      z.object({ keywords: z.string(), location: z.string() }),
    )
    .optional(),
});

export type AgentSources = z.infer<typeof AgentSourcesSchema>;

export const getAgentSources = (packageJson: PackageJson): AgentSources => {
  return AgentSourcesSchema.parse(packageJson.agentsources);
};
