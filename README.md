# Jaffarjees Email Studio

A studio for planning and writing email campaigns for Jaffarjees. See
`CLAUDE.md` for the studio rules and `brand/voice.md` for the brand voice.

## Setup

This repo enables the `marketing` plugin for the project (see
`.claude/settings.json`), but cloning the repo only declares the plugin —
it doesn't install it on your machine. After cloning, run this once:

```
claude plugin install marketing@knowledge-work-plugins --scope project
```

Until you run that, `claude plugin list` will show the plugin as enabled
but not installed, and its skills/commands won't work yet.
