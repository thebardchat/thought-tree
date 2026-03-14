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
