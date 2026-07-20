#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.cwd();
const loginScreenshotPath = process.env.INVITEHUB_LOGIN_SCREENSHOT ?? "/tmp/invitehub-login-success.png";
const acceptedLoginScreenshotSizes = [
  { label: "iPhone 6.3 portrait", width: 1206, height: 2622 },
  { label: "iPhone 17 Pro Max portrait", width: 1320, height: 2868 }
];

const sourceChecks = [
  {
    file: "apps/mobile/hooks/useAuth.ts",
    snippets: [
      "await import(\"expo-apple-authentication\")",
      "await import(\"expo-crypto\")",
      "createAppleNoncePair",
      "const rawNonce = Array.from(nonceBytes",
      "Crypto.digestStringAsync(\"SHA-256\" as CryptoDigestAlgorithm, rawNonce)",
      "nonce: hashedNonce",
      "supabase.auth.signInWithIdToken",
      "provider: \"apple\"",
      "token: credential.identityToken",
      "nonce: rawNonce",
      "if (!result.error && result.data.session)",
      "applyAuthSession(result.data.session)",
      "shouldUpgradeAnonymousAccount",
      "supabase.auth.updateUser(",
      "const emailRedirectTo = getAuthRedirectUrl(\"auth/callback\")"
    ],
    forbidden: [
      "import * as AppleAuthentication from \"expo-apple-authentication\"",
      "import * as Crypto from \"expo-crypto\"",
      "nonce: hashedNonce\n        });\n      }"
    ],
    label: "Apple login nonce and Supabase id-token flow"
  },
  {
    file: "apps/mobile/app/login.tsx",
    snippets: [
      "useRouter",
      "shouldLeaveLoginScreen",
      "hasSession: Boolean(session)",
      "router.replace(POST_LOGIN_ROUTE)",
      "signInWithApple",
      "Apple 로그인을 처리했습니다. 내 초대장 화면으로 이동합니다.",
      "provider=\"apple\"",
      "Apple로 계속하기"
    ],
    label: "Apple login UI path"
  },
  {
    file: "apps/mobile/app.json",
    snippets: ["\"usesAppleSignIn\": true"],
    label: "Expo Apple Sign In capability"
  },
  {
    file: "apps/mobile/ios/InviteHub/InviteHub.entitlements",
    snippets: ["com.apple.developer.applesignin"],
    label: "iOS Apple Sign In entitlement"
  },
];

const failures = [];

function read(relativePath) {
  const path = join(root, relativePath);
  if (!existsSync(path)) {
    failures.push(`${relativePath}: missing file for login evidence check`);
    return "";
  }

  return readFileSync(path, "utf8");
}

function readPngDimensions(path) {
  const buffer = readFileSync(path);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("not a PNG file");
  }

  return {
    height: buffer.readUInt32BE(20),
    width: buffer.readUInt32BE(16)
  };
}

for (const check of sourceChecks) {
  const source = read(check.file);
  for (const snippet of check.snippets) {
    if (!source.includes(snippet)) {
      failures.push(`${check.file}: missing ${check.label} snippet: ${snippet}`);
    }
  }

  for (const forbidden of check.forbidden ?? []) {
    if (source.includes(forbidden)) {
      failures.push(`${check.file}: forbidden login implementation pattern: ${forbidden}`);
    }
  }
}

const absoluteScreenshotPath = resolve(loginScreenshotPath);
if (!existsSync(absoluteScreenshotPath)) {
  failures.push(`Login success screenshot missing at ${absoluteScreenshotPath}`);
} else {
  const size = statSync(absoluteScreenshotPath).size;
  if (size < 100_000) {
    failures.push(`Login success screenshot is unexpectedly small (${size} bytes)`);
  }

  try {
    const dimensions = readPngDimensions(absoluteScreenshotPath);
    const acceptedSize = acceptedLoginScreenshotSizes.find(
      (size) => size.width === dimensions.width && size.height === dimensions.height
    );
    if (!acceptedSize) {
      const acceptedDimensions = acceptedLoginScreenshotSizes.map((size) => `${size.width}x${size.height}`).join(" or ");
      failures.push(
        `Login success screenshot dimensions must be ${acceptedDimensions}, got ${dimensions.width}x${dimensions.height}`
      );
    }
  } catch (error) {
    failures.push(`Login success screenshot is invalid: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

if (failures.length > 0) {
  console.error("LOGIN EVIDENCE RESULT");
  console.error("- Status: fail");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("LOGIN EVIDENCE RESULT");
console.log("- Status: pass");
console.log("- Apple login uses SHA-256 nonce for Apple and raw nonce for Supabase");
console.log("- Apple Sign In capability and entitlement are present");
const dimensions = readPngDimensions(absoluteScreenshotPath);
const acceptedSize = acceptedLoginScreenshotSizes.find(
  (size) => size.width === dimensions.width && size.height === dimensions.height
);
console.log(`- Login success screenshot: ${absoluteScreenshotPath} (${dimensions.width}x${dimensions.height}, ${acceptedSize.label})`);
