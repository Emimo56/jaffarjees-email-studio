#!/usr/bin/env node
// Runs a headless Claude Code review of a campaign folder against the brand
// voice and email rules, saving structured findings to review/findings.json.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const folder = process.argv[2];
if (!folder) {
  console.error("Usage: node scripts/review.mjs <campaign-folder>");
  process.exit(2);
}

const schemaPath = join(repoRoot, "review", "findings.schema.json");
// Minified (no embedded newlines) so shell quoting below stays reliable.
const schemaText = JSON.stringify(JSON.parse(readFileSync(schemaPath, "utf8")));

const findingsPath = join(repoRoot, "review", "findings.json");
let previousFindings = null;
try {
  const previous = JSON.parse(readFileSync(findingsPath, "utf8"));
  if (previous.folder === folder && Array.isArray(previous.findings)) {
    previousFindings = previous.findings;
  }
} catch {
  // No previous findings file, or it's unreadable/invalid — treat as a first review.
}

let prompt = `Review every email in ${folder} against brand/voice.md and .claude/rules/emails.md. Report only real problems.`;
if (previousFindings) {
  prompt +=
    ` These are findings from the last review: ${JSON.stringify(previousFindings)}. ` +
    "Report only problems that are new or still not fixed. Don't repeat ones that have been fixed.";
}

// Quote an argument for the platform's default shell (spawnSync with
// shell:true on Windows uses cmd.exe, which needs different escaping than
// the POSIX shell used elsewhere).
function quoteArg(value) {
  if (process.platform === "win32") {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return `'${value.replace(/'/g, "'\\''")}'`;
}

const command = [
  "claude",
  "-p",
  quoteArg(prompt),
  "--output-format",
  "json",
  "--json-schema",
  quoteArg(schemaText),
  "--allowedTools",
  "Read,Glob,Grep",
].join(" ");

const result = spawnSync(command, {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
  maxBuffer: 1024 * 1024 * 50,
});

if (result.error) {
  console.error("Failed to run claude:", result.error.message);
  process.exit(2);
}

if (result.status !== 0 && !result.stdout?.trim()) {
  console.error("claude exited with no output.");
  console.error(result.stderr);
  process.exit(2);
}

let parsed;
try {
  parsed = JSON.parse(result.stdout);
} catch (err) {
  console.error("Could not parse claude output as JSON:", err.message);
  console.error(result.stdout);
  process.exit(2);
}

// Output may be a single JSON object, or a list of messages whose last item
// is the result.
const resultObject = Array.isArray(parsed) ? parsed[parsed.length - 1] : parsed;

const structuredOutput = resultObject.structured_output;
if (!structuredOutput || !Array.isArray(structuredOutput.findings)) {
  console.error("No structured_output.findings in claude's result:");
  console.error(JSON.stringify(resultObject, null, 2));
  process.exit(2);
}

const findings = structuredOutput.findings;

mkdirSync(join(repoRoot, "review"), { recursive: true });
writeFileSync(
  findingsPath,
  JSON.stringify({ folder, ...structuredOutput }, null, 2) + "\n"
);

const counts = { high: 0, medium: 0, low: 0 };
for (const finding of findings) {
  if (counts[finding.severity] !== undefined) counts[finding.severity]++;
}

console.log(
  `Reviewed ${folder}: ${findings.length} finding(s) ` +
    `(${counts.high} high, ${counts.medium} medium, ${counts.low} low).`
);

process.exit(counts.high > 0 ? 1 : 0);
