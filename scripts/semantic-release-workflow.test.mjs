import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL(
  "../.github/workflows/semantic-release.yml",
  import.meta.url,
);
const ciWorkflowUrl = new URL("../.github/workflows/ci.yml", import.meta.url);
const backendWorkflowUrl = new URL(
  "../.github/workflows/backend-test.yml",
  import.meta.url,
);
const packageUrl = new URL("../package.json", import.meta.url);

test("semantic release has the repository permissions required to tag and report failures", async () => {
  const source = await readFile(workflowUrl, "utf8");

  assert.match(
    source,
    /^permissions:\s*\n\s+contents: write\s*\n\s+issues: write\s*\n\s+pull-requests: write/m,
  );
  assert.match(
    source,
    /workflow_run:\s*\n\s+workflows:\s*\["CI Quality Gate"\]/,
  );
  assert.match(source, /github\.event\.workflow_run\.conclusion == 'success'/);
  assert.match(
    source,
    /ref: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/,
  );
  assert.match(source, /persist-credentials: false/);
  assert.match(source, /pnpm install --frozen-lockfile --ignore-scripts/);
  assert.doesNotMatch(source, /^\s+push:/m);
  assert.match(source, /pnpm exec semantic-release/);
  assert.doesNotMatch(source, /\bnpx semantic-release\b/);
  assert.match(
    source,
    /^concurrency:\s*\n\s+group: semantic-release-main\s*\n\s+cancel-in-progress: false/m,
  );

  const manifest = JSON.parse(await readFile(packageUrl, "utf8"));
  assert.match(
    manifest.scripts["test:ops-safety"],
    /scripts\/semantic-release-workflow\.test\.mjs/,
  );
});

test("release-unlocking CI fails closed on staging and high-severity image findings", async () => {
  const source = await readFile(ciWorkflowUrl, "utf8");

  assert.match(source, /uses: aquasecurity\/trivy-action@[0-9a-f]{40}/);
  assert.match(source, /exit-code: ["']1["']/);
  assert.match(source, /severity: ["']CRITICAL,HIGH["']/);
  assert.match(
    source,
    /: "\$\{COOLIFY_WEBHOOK:\?COOLIFY_STAGING_WEBHOOK is required\}"/,
  );
  assert.doesNotMatch(source, /Skipping staging deploy/);
  assert.doesNotMatch(source, /Webhook failed[^\n]*\|\|\s*echo/);
  assert.match(
    source,
    /^  deploy-staging:\s*\n(?:.*\n)*?    needs: \[[^\]]*\bsecurity\b[^\]]*\]/m,
  );
  assert.match(source, /pnpm --filter @aluplan\/backend lint/);
  assert.match(source, /pnpm --filter @aluplan\/frontend test:unit:cov/);
  assert.match(source, /pnpm --filter @aluplan\/frontend lint/);
  assert.match(source, /^  customer-security-rehearsal:\s*$/m);
  assert.match(
    source,
    /pnpm --filter @aluplan\/backend exec jest --config \.\/test\/jest-security-rehearsal\.json/,
  );
  assert.match(
    source,
    /^  deploy-staging:\s*\n(?:.*\n)*?    needs: \[[^\]]*\bcustomer-security-rehearsal\b[^\]]*\]/m,
  );
});

test("backend CI uses disposable authentication credentials and honest coverage labels", async () => {
  const source = await readFile(backendWorkflowUrl, "utf8");

  assert.match(source, /Generate disposable test credentials/);
  assert.doesNotMatch(source, /secrets\.JWT_SECRET/);
  assert.doesNotMatch(source, /secrets\.JWT_REFRESH_SECRET/);
  assert.doesNotMatch(source, /≥80%/);
});
