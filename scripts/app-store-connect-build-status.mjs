#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { join } from "node:path";

const root = process.cwd();
const envPath = join(root, ".env.local");

function parseArgs(argv) {
  const parsed = {
    appId: "6763630299",
    version: "1.0.0",
    build: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const name = token.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${name}`);
    }

    parsed[name] = value;
    index += 1;
  }

  if (!parsed.build) {
    throw new Error("Missing --build");
  }

  return parsed;
}

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        const key = line.slice(0, separator);
        let value = line.slice(separator + 1);

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        return [key, value.replaceAll("\\n", "\n")];
      })
  );
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function createJwt({ issuerId, keyId, privateKey }) {
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 20 * 60,
    aud: "appstoreconnect-v1"
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = createSign("sha256").update(signingInput).sign(privateKey);

  return `${signingInput}.${base64url(signature)}`;
}

function requiredSecret(env, name) {
  const value = process.env[name] || env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function summarizeBuild(payload) {
  const build = payload.data?.[0];
  const included = Array.isArray(payload.included) ? payload.included : [];
  const betaGroups = included
    .filter((item) => item.type === "betaGroups")
    .map((item) => item.attributes?.name)
    .filter(Boolean);

  if (!build) {
    return { found: false, betaGroups };
  }

  return {
    found: true,
    id: build.id,
    appVersion: build.attributes?.version,
    buildVersion: build.attributes?.buildVersion,
    processingState: build.attributes?.processingState,
    uploadedDate: build.attributes?.uploadedDate,
    expirationDate: build.attributes?.expirationDate,
    expired: build.attributes?.expired,
    usesNonExemptEncryption: build.attributes?.usesNonExemptEncryption,
    betaGroups
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnvFile(envPath);
  const token = createJwt({
    issuerId: requiredSecret(env, "APPLE_APP_STORE_ISSUER_ID"),
    keyId: requiredSecret(env, "APPLE_APP_STORE_KEY_ID"),
    privateKey: requiredSecret(env, "APPLE_APP_STORE_PRIVATE_KEY")
  });
  const url = new URL("https://api.appstoreconnect.apple.com/v1/builds");
  url.searchParams.set("filter[app]", args.appId);
  url.searchParams.set("filter[version]", args.version);
  url.searchParams.set("filter[buildVersion]", args.build);
  url.searchParams.set("include", "betaGroups");
  url.searchParams.set("fields[builds]", "version,buildVersion,processingState,uploadedDate,expirationDate,expired,usesNonExemptEncryption,betaGroups");
  url.searchParams.set("fields[betaGroups]", "name");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("APP STORE CONNECT BUILD STATUS RESULT");
    console.error("- Status: fail");
    console.error(`- HTTP: ${response.status}`);
    console.error(`- Error: ${body.errors?.[0]?.detail || body.errors?.[0]?.title || "unknown"}`);
    process.exit(1);
  }

  console.log(JSON.stringify(summarizeBuild(body), null, 2));
}

main().catch((error) => {
  console.error("APP STORE CONNECT BUILD STATUS RESULT");
  console.error("- Status: fail");
  console.error(`- ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(1);
});
