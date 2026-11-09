---
paths:
  - "campaigns/**/emails/*.md"
---

# Rules for campaign email files

Every file matching this path is a finished marketing email, and must follow
all of the rules below.

- The file must start with a line beginning "Subject: " that is 50 characters
  or fewer (counting the whole line, including "Subject: "), followed
  immediately by a line beginning "Preview: " that is 90 characters or fewer
  (counting the whole line, including "Preview: ").
- The email must greet the reader using the placeholder `{{first_name}}`.
- The email must contain exactly one main link, formatted as a markdown link
  with the text "Button text" replaced by real call-to-action copy, pointing
  to `https://usa.jafferjees.com/collections/new-arrivals`:
  `[Button text](https://usa.jafferjees.com/collections/new-arrivals)`.
  Don't include any other links in the email body.
- The email must end with our sign-off, per `brand/voice.md`: "The Jafferjees
  Family" for newsletters and campaign emails, or "Jafferjees Customer Care"
  for one-to-one service emails (order issues, questions, complaints).
- After the sign-off, the email must end with this exact two-line footer,
  written as plain text (not inside a code block):

You’re getting this because you’re on the Jafferjees mailing list.
Jafferjees, {{company_address}} · Unsubscribe: {{unsubscribe_url}}
