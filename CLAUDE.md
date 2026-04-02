# CLAUDE.md — thought-tree

> Claude Code configuration for the `thebardchat/thought-tree` repository.

---

## Project Overview

ThoughtTree is a **React-based mind-mapping and brain-dump application** with an interactive visual canvas. It provides node-based mind mapping with drag-and-move, inline editing, branching, and deletion — all rendered on a dark-themed full-screen canvas.

This project operates under the [ShaneTheBrain Constitution](https://github.com/thebardchat/constitution/blob/main/CONSTITUTION.md).

---

## Infrastructure

All `thebardchat` repositories run on the following local-first infrastructure:

| Component | Detail |
|-----------|--------|
| **Compute** | Raspberry Pi 5 (16 GB RAM) |
| **Chassis** | Pironman 5-MAX by Sunfounder (NVMe RAID) |
| **Storage** | 2x WD Blue SN5000 2 TB NVMe — RAID 1 via mdadm |
| **Core path** | `/mnt/shanebrain-raid/shanebrain-core/` |
| **Networking** | Tailscale VPN across all nodes |
| **Dev environment** | Claude Code on Pi 5 |

> Pi before cloud. Privacy before convenience. — Pillar 4

---

## Repository Structure

```
thought-tree/
  .jsx              # ThoughtTree React component (main application)
  README.md         # Public-facing summary
  CLAUDE.md         # This file — Claude Code project context
```

---

## Tech Stack

- **React** (useState, useRef, useCallback hooks)
- **Inline styles** (CSS-in-JS, no external dependencies)
- **SVG connectors** for parent-child node relationships

---

## Key Interactions

- **DBL-CLICK CANVAS** → New node
- **+ button** → Branch (create child)
- **DRAG** → Move node
- **DBL-CLICK NODE** → Edit text
- **× button** → Delete node (cascades to descendants)
- **CLEAR** → Reset to initial "BRAIN DUMP" state

---

## Credits

Built with Claude (Anthropic) · Runs on Raspberry Pi 5 + Pironman 5-MAX

| Partner | Role |
|---------|------|
| **Claude by Anthropic** · [claude.ai](https://claude.ai) | Co-built this entire ecosystem |
| **Raspberry Pi 5** · [raspberrypi.com](https://www.raspberrypi.com) | Local compute backbone |
| **Pironman 5-MAX** · [pironman.com](https://www.pironman.com) | NVMe RAID 1 chassis that made it real |

---

*[@thebardchat](https://github.com/thebardchat) · Hazel Green, Alabama*

## Claude Code Rules
- Commit and push directly to `main`. Do NOT create branches.
- Run build/test commands before committing.
- Update CLAUDE.md session log before final commit.


## Networking / Deployment
- When working with Tailscale Funnel, remember it strips URL path prefixes. Always use hardcoded base paths rather than server-side form action prefixing for routing.

## Creative Writing
- Never overwrite or rewrite the user's creative voice, prose style, or intentional structural choices (e.g., missing notes, dialogue rhythm). Ask before making stylistic changes to creative writing files.

## General Workflow Rules
- Before setting up repos, SSH keys, or services, check what's already configured on the current machine. Run `ls ~/.ssh/`, `git remote -v`, `tailscale status`, etc. before assuming fresh setup is needed.
- Let's focus on one thing at a time. Don't suggest other improvements until the current goal is fully verified working.
- Before applying changes to all files, show the result on one file first so Shane can verify the approach.

## Git
- For git conflicts, always verify --theirs vs --ours semantics before applying. State which version you're keeping and why before running the command.

## Raspberry Pi Environment
- This user runs services on Raspberry Pi. Be aware: Python 3.13 removed the `cgi` module, Piper TTS needs careful noise_scale tuning to avoid clipping, and aplay conflicts with PipeWire. Prefer `pw-play` or `paplay` for audio playback.
