import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Source contracts only: image UID, mounted-volume permissions, Prisma and
// Chromium still need a separate, isolated runtime rehearsal.
const dockerfile = readFileSync(
  new URL("../apps/backend/Dockerfile", import.meta.url),
  "utf8",
);
const runner = dockerfile
  .split(/^FROM\s+/im)
  .at(-1)
  .replace(/^\s*#.*$/gm, "")
  .replace(/\\\r?\n\s*/g, " ");

test("backend final stage defaults to the unprivileged node user", () => {
  const users = [...runner.matchAll(/^USER\s+([^\r\n]+)/gim)];
  assert.match(users.at(-1)?.[1]?.trim() ?? "", /^node(?::node)?$/);
});

test("backend provisions only explicit application write locations for node", () => {
  const commands = runner.split(/&&|;|\n/).map((command) => command.trim());
  const owns = (target) => commands.some((command) =>
    /\bchown\s+(?:-R\s+)?node:node\s/.test(command) &&
    command.split(/\s+/).includes(target));
  assert.ok(commands.some((command) => /\bmkdir\s+-p\s/.test(command) &&
    command.split(/\s+/).includes("/app/uploads")), "create /app/uploads");
  assert.ok(owns("/app/uploads"), "node must own /app/uploads");
  assert.ok(commands.some((command) => /\btouch\s+\/app\/openapi\.json$/.test(command)),
    "precreate the OpenAPI file without making /app writable");
  assert.ok(owns("/app/openapi.json"), "node must own the OpenAPI output file");
  assert.match(runner, /^ENV\s+[^\n]*\bHOME=\/home\/node(?:\s|$)/m);
});

test("backend makes screens writable only under existing template bases", () => {
  const loop = runner.match(/for template_base in\s+([^;]+);\s*do\s+(.+?)\s*done/);
  assert.ok(loop, "provision each existing template layout without shadowing fallback");
  assert.deepEqual(loop[1].trim().split(/\s+/), [
    "/app/apps/backend/dist/email/templates/mjml",
    "/app/apps/backend/dist/src/email/templates/mjml",
    "/app/apps/backend/src/email/templates/mjml",
  ]);
  assert.match(loop[2], /^if \[ -d "\$template_base" \]; then\s+mkdir -p "\$template_base\/screens"\s+&&\s+chown -R node:node "\$template_base\/screens"\s+\|\| exit 1;\s+fi;$/);
});

test("backend does not recursively transfer the whole application to node", () => {
  const ownershipCommands = runner.match(/\bchown\b[^;&\n]*/g) ?? [];
  for (const command of ownershipCommands) {
    if (!/(?:\s-[A-Za-z]*R|--recursive)\b/.test(command)) continue;
    assert.doesNotMatch(command, /(?:^|\s)["']?(?:\/app\/?|\.\/?)['"]?(?=\s|$)/);
  }
  assert.doesNotMatch(
    runner,
    /^COPY\s+[^\n]*--chown(?:=|\s+)node(?::node)?\s+[^\n]*\s(?:\/app\/?|\.\/?)\s*$/im,
  );
});

test("backend keeps the fail-closed migration entrypoint before API startup", () => {
  const command = runner.match(/^CMD\s+(.+)$/im)?.[1];
  assert.deepEqual(JSON.parse(command ?? "null"), ["./apps/backend/scripts/deploy.sh"]);
  const deploy = readFileSync(
    new URL("../apps/backend/scripts/deploy.sh", import.meta.url),
    "utf8",
  );
  const migrationGate = deploy.indexOf("if ! ./apps/backend/scripts/migrate-once.sh; then");
  assert.ok(migrationGate >= 0, "migration failure must stop startup");
  assert.match(deploy.slice(migrationGate, deploy.indexOf("fi", migrationGate)), /exit 1/);
  assert.ok(migrationGate < deploy.indexOf("exec node"));
});
