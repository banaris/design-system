#!/usr/bin/env node
/* Names why a trusted-publishing `publish` failed. Runs only after it did.
 *
 * pnpm treats a rejected OIDC token exchange as "no credentials" and carries
 * on, so an expired or mismatched trusted publisher on npmjs.com surfaces as a
 * bare `404 Not Found` from the upload. This repeats the exchange pnpm
 * attempts and reports what npm answered. It never publishes and never prints
 * a token. */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { name } = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const { ACTIONS_ID_TOKEN_REQUEST_URL, ACTIONS_ID_TOKEN_REQUEST_TOKEN } =
  process.env;

const fail = (message) => {
  console.log(`::error title=npm OIDC diagnosis::${message}`);
  process.exit(1);
};

if (!ACTIONS_ID_TOKEN_REQUEST_URL || !ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
  fail(
    "No OIDC request credentials: the job needs `permissions: id-token: write`.",
  );
}

const idUrl = new URL(ACTIONS_ID_TOKEN_REQUEST_URL);
idUrl.searchParams.set("audience", "npm:registry.npmjs.org");
const idResponse = await fetch(idUrl, {
  headers: { Authorization: `Bearer ${ACTIONS_ID_TOKEN_REQUEST_TOKEN}` },
  signal: AbortSignal.timeout(20_000),
});
if (!idResponse.ok) {
  fail(`GitHub refused to issue an OIDC token (HTTP ${idResponse.status}).`);
}
const { value: idToken } = await idResponse.json();

const exchange = await fetch(
  `https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(name)}`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}`, Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  },
);

if (exchange.ok) {
  console.log(
    `npm accepted the OIDC exchange for ${name}; the publish failed for another reason.`,
  );
} else {
  const body = (await exchange.text()).slice(0, 300);
  fail(
    `npm rejected the OIDC exchange for ${name} (HTTP ${exchange.status}: ${body}). ` +
      "Open the package's Settings > Trusted Publisher on npmjs.com: an `Expired` or " +
      "missing connection, or one whose repository / workflow filename differs from " +
      "this run's, is deleted and recreated there (it needs `Allow npm publish`).",
  );
}
