import { relative, resolve } from "node:path";
import { updateAgentsFile } from "../formatter";
import {
  getAgentSources,
  getPackageDirectory,
  getPackageJson,
} from "../resolver";

export default function generateCommand(): void {
  const mainAgentSources = getAgentSources(getPackageJson());
  const mainLocation = process.cwd();

  updateAgentsFile(
    Object.entries(mainAgentSources.imports ?? {}).flatMap(([packageName]) => {
      const dependencyAgentSources = getAgentSources(
        getPackageJson(packageName),
      );
      const dependencyLocation = getPackageDirectory(packageName);
      return Object.entries(dependencyAgentSources.exports ?? {}).map(
        ([exportName, { location, keywords }]) => {
          void exportName; // we will use the export name in the future when we implement import filters
          return {
            keywords,
            location: relative(
              mainLocation,
              resolve(dependencyLocation, location),
            ),
          };
        },
      );
    }),
  );
}
