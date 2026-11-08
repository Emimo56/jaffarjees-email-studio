#!/usr/bin/env node
// PreToolUse guard for mcp__resend__.* tools: blocks sending to anyone but
// Resend's own test addresses and the user's own address.

const BLOCKED_TOOLS = new Set([
  "mcp__resend__send-broadcast",
  "mcp__resend__create-automation",
  "mcp__resend__send-inbox-draft",
  "mcp__resend__send-new-inbox-email",
]);

const SEND_TOOLS = new Set([
  "mcp__resend__send-email",
  "mcp__resend__send-batch-emails",
]);

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function isAllowed(address, myEmail) {
  const match = /<([^>]+)>/.exec(address);
  const email = (match ? match[1] : address).trim().toLowerCase();
  if (email.endsWith("@resend.dev")) return true;
  if (myEmail && email === myEmail.trim().toLowerCase()) return true;
  return false;
}

function collectAddresses(toolInput) {
  const addresses = [];
  for (const field of ["to", "cc", "bcc"]) {
    const value = toolInput?.[field];
    if (!value) continue;
    const list = Array.isArray(value) ? value : [value];
    for (const entry of list) {
      if (typeof entry === "string") addresses.push(entry);
      else if (entry && typeof entry === "object" && typeof entry.email === "string") {
        addresses.push(entry.email);
      }
    }
  }
  return addresses;
}

async function main() {
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    // Can't parse the call; fail closed.
    console.error("send-guard: could not parse tool call input, blocking.");
    process.exit(2);
  }

  const toolName = input?.tool_name;
  const toolInput = input?.tool_input ?? {};

  if (BLOCKED_TOOLS.has(toolName)) {
    console.error(
      `send-guard: ${toolName} can reach whole lists of people and is always blocked.`
    );
    process.exit(2);
  }

  if (SEND_TOOLS.has(toolName)) {
    const myEmail = process.env.MY_EMAIL;
    const addresses = collectAddresses(toolInput);
    for (const address of addresses) {
      if (!isAllowed(address, myEmail)) {
        console.error(
          `send-guard: address "${address}" is not a @resend.dev test address or your own email, blocking ${toolName}.`
        );
        process.exit(2);
      }
    }
    process.exit(0);
  }

  process.exit(0);
}

main();
