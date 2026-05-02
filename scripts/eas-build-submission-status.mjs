#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";

const buildId = process.argv[2];

if (!buildId) {
  console.error("Usage: node scripts/eas-build-submission-status.mjs <eas-build-id>");
  process.exit(1);
}

function findEasCliRoot() {
  const easBin = execFileSync("which", ["eas"], { encoding: "utf8" }).trim();
  const realEasBin = realpathSync(easBin);
  let current = dirname(realEasBin);

  for (let i = 0; i < 6; i += 1) {
    const packageJson = join(current, "package.json");

    if (existsSync(packageJson)) {
      const pkg = JSON.parse(readFileSync(packageJson, "utf8"));

      if (pkg.name === "eas-cli") {
        return current;
      }
    }

    current = dirname(current);
  }

  throw new Error(`Could not locate eas-cli package root from ${realEasBin}`);
}

const easCliRoot = findEasCliRoot();
const requireFromEas = createRequire(join(easCliRoot, "package.json"));
const { createGraphqlClient } = requireFromEas("./build/commandUtils/context/contextUtils/createGraphqlClient");
const { BuildQuery } = requireFromEas("./build/graphql/queries/BuildQuery");

const statePath = resolve(process.env.HOME ?? "", ".expo/state.json");
const state = JSON.parse(readFileSync(statePath, "utf8"));
const sessionSecret = state.auth?.sessionSecret;

if (!sessionSecret) {
  console.error("Expo session is missing. Run `eas login` first.");
  process.exit(1);
}

const client = createGraphqlClient({ sessionSecret });
const build = await BuildQuery.withSubmissionsByIdAsync(client, buildId, { useCache: false });

if (!build) {
  console.log(JSON.stringify({ found: false, buildId }, null, 2));
  process.exit(0);
}

console.log(
  JSON.stringify(
    {
      found: true,
      id: build.id,
      status: build.status,
      platform: build.platform,
      appVersion: build.appVersion,
      appBuildVersion: build.appBuildVersion,
      gitCommitHash: build.gitCommitHash,
      submissions: (build.submissions ?? []).map((submission) => ({
        id: submission.id,
        status: submission.status,
        platform: submission.platform,
        error: submission.error ?? null
      }))
    },
    null,
    2
  )
);
