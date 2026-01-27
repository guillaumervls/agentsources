import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AgentSources, getPackageJson } from "./resolver";

const MANAGED_SECTION_DELIMITER =
  "<!-- AGENTSOURCES MANAGED SECTION - DO NOT EDIT FROM THIS LINE -->";

interface Entry {
  keywords: string;
  location: string;
}

export const updateAgentsFile = (entries: Entry[]): void => {
  const agentsFilePath = join("AGENTS.md");
  let existingContent = "";
  if (existsSync(agentsFilePath)) {
    existingContent = readFileSync(agentsFilePath, "utf-8");
  }
  const userContent =
    (existingContent.split(MANAGED_SECTION_DELIMITER)[0] ?? "").trimEnd() +
    "\n";
  const managedSection = generateManagedSection(entries);

  writeFileSync(agentsFilePath, userContent + managedSection, "utf-8");
};

const generateManagedSection = (entries: Entry[]): string => {
  const lines: string[] = [];

  lines.push(MANAGED_SECTION_DELIMITER);
  lines.push("");
  lines.push("# Documentation Index");
  lines.push("");
  lines.push(
    "When the user asks about these topics, consult the corresponding files for reference:",
  );
  lines.push("");

  // Add all imported documentation entries
  for (const entry of entries) {
    lines.push(`- **${entry.keywords}** → ${entry.location}`);
  }

  if (entries.length > 0) {
    lines.push("");
  }

  return lines.join("\n") + "\n";
};

export const addPackageToPackageJsonAgentSources = (
  packageName: string,
): void => {
  const packageJson = getPackageJson();
  packageJson.agentsources ??= {};
  const agentSources = packageJson.agentsources as AgentSources;
  agentSources.imports ??= {};
  agentSources.imports[packageName] = {};
  writeFileSync("package.json", JSON.stringify(packageJson, null, 2), "utf-8");
};
