/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app lives in a subfolder of a repo that has its own lockfile at the root;
  // pin the build root here so Next doesn't pick the parent folder.
  turbopack: {root: __dirname},
}

module.exports = nextConfig
