import { PackageJson } from "pkg-types";
import { getPackageJson } from "./resolver";

export const failWithHelpfulError = (packageName: string): void => {
  let message = `Package "${packageName}" doesn't have agent documentation configured.\n\n`;
  message += `The maintainer hasn't added the 'agentsources' field to their package.json.\n`;
  message += `\n`;
  message += `Note for package maintainers: If you're publishing agent docs, remember to:\n`;
  message += `1. Add the 'agentsources' field to package.json with exports configuration\n`;
  message += `2. Ensure the documentation files are included in your NPM package\n`;
  message += `   (via the 'files' field in package.json or by not ignoring them in .npmignore)\n`;
  message += `\n`;

  const packageJson = getPackageJson(packageName);
  // Try to extract repository URL
  const repoUrl = extractRepositoryUrl(packageJson.repository);

  if (repoUrl)
    message += `You can request this by opening an issue at:\n${repoUrl}\n`;
  else {
    // Try to get author information
    const author = extractAuthor(packageJson.author);

    if (author) message += `You can contact the maintainer: ${author}\n`;
    else
      message += `You can contact the package maintainer to request agent documentation.\n`;
  }

  console.error(message);
  process.exit(1);
};

const extractRepositoryUrl = (
  repository: PackageJson["repository"],
): string | null => {
  if (!repository) return null;

  if (typeof repository === "string") {
    // Handle shorthand like "user/repo" or full URLs
    if (repository.includes("://")) return normalizeRepoUrl(repository);
    if (repository.includes("/") && !repository.includes(" "))
      return `https://github.com/${repository}`;
    return null;
  }

  if (typeof repository === "object" && repository.url)
    return normalizeRepoUrl(repository.url);

  return null;
};

const normalizeRepoUrl = (url: string): string => {
  // Remove git+ prefix if present
  let normalized = url.replace(/^git\+/, "");

  // Remove .git suffix if present
  normalized = normalized.replace(/\.git$/, "");

  // Convert git:// to https://
  normalized = normalized.replace(/^git:\/\//, "https://");

  return normalized;
};

const extractAuthor = (author: PackageJson["author"]): string | null => {
  if (!author) return null;

  if (typeof author === "string") return author;

  if (typeof author === "object") {
    if (author.name && author.email) return `${author.name} <${author.email}>`;
    if (author.name) return author.name;
    if (author.email) return author.email;
  }

  return null;
};
