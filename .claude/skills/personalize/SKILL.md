---
name: personalize
description: Write a version of each campaign email for every lead group in leads/leads.csv. Use when a campaign's emails are final and you want one copy per group.
argument-hint: "[campaign folder]"
context: fork
allowed-tools: Read, Glob, Grep, Write
---

Write a personalized copy of each email in a campaign for every lead group.

## 1. Get the campaign folder

The campaign folder is given as `$ARGUMENTS`.

If no argument was given: list the folders under `campaigns/` (top-level directories only,
not loose files), tell the user a campaign folder is required, and stop. Do not guess which
campaign was meant.

If the given folder doesn't exist under `campaigns/`, say so and list the folders that do
exist, then stop.

## 2. Get the groups

Read `leads/leads.csv`. Collect the distinct values in the `group` column (e.g. `mens`,
`womens`, `gifting`) — these are this run's lead groups, not a hardcoded list.

## 3. Find the source emails

Find the email files directly inside the campaign folder (not inside any `groups/`
subfolder already there from a prior run — skip that subfolder entirely when looking for
sources). Each one is a final, approved email to personalize.

## 4. Write one version per group per email

For each group, for each source email file:

- Keep the same structure, subject line, link/CTA, and footer/sign-off exactly as written.
- Change only the opening line and one example (a product, detail, or line that illustrates
  the point) so it fits that group naturally.
- Stay in brand voice — see `brand/voice.md` (plain English, warm and specific, only claims
  already in the source email; don't invent new products, prices, or claims when picking a
  group-fitting example).
- These are drafts only, same as every other file in `campaigns/` — do not send anything.

Save each version to `<campaign folder>/groups/<group>/emails/<same file name>` (same file
name as the source, under that group's `emails/` folder). Create the folders as needed.

## 5. Commit

Commit the new files.

## 6. Reply

Reply with a short summary only — no other commentary:

- How many files were written.
- One example opening line per group (one line each, quoting the opening you wrote for that
  group).
