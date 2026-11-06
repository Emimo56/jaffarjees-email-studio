---
paths:
  - "campaigns/**/emails/*.md"
---

# Rules for email files

Every email file in any campaign's `emails/` folder must follow these rules:

- The file must start with a line `Subject: ...` that is 50 characters or fewer, followed by a line `Preview: ...` that is 90 characters or fewer.
- The email must greet the reader using `{{first_name}}`.
- The email must have exactly one main link, written as `[Button text](https://jafferjees.example/steep-club)`.
- The email must end with our sign-off from `brand/voice.md`, followed by this two-line footer written as plain text (not inside a code block):

  You're getting this because you're on the Jafferjees mailing list.
  Jafferjees, {{company_address}} · Unsubscribe: {{unsubscribe_url}}
