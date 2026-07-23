// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require("expo/metro-config");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { realpathSync } = require("node:fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path");

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, "../..");
const workspaceNodeModules = path.join(workspaceRoot, "node_modules");
const resolvedWorkspaceNodeModules = realpathSync(workspaceNodeModules);

config.resolver.nodeModulesPaths = [workspaceNodeModules, resolvedWorkspaceNodeModules];
config.resolver.unstable_enableSymlinks = true;
config.watchFolders = [workspaceRoot, resolvedWorkspaceNodeModules];

module.exports = config;
