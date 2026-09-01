/** @type {import('next').NextConfig} */
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const isUserOrOrgPagesRepo = repositoryName.endsWith(".github.io");

// Project Pages sites live at https://USER.github.io/REPOSITORY/.
// User/org Pages sites (USER.github.io) live at the domain root.
const basePath =
  isGitHubPagesBuild && repositoryName && !isUserOrOrgPagesRepo
    ? `/${repositoryName}`
    : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
