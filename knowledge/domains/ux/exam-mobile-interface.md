---
domain: ux
topic: exam-mobile-interface
tags: [exam, mobile, connectivity, accessibility]
complexity: advanced
last_updated: 2026-03-12
confidence: 0.8
source_refs:
  - https://ctl.jhsph.edu/blog/posts/redesigned-countdown-timer/
  - https://www.digitala11y.com/addressing-timeout-modals-navigating-the-nuances-for-inclusive-web-design/
  - https://zuplo.com/learning-center/designing-rest-apis-for-mobile-applications-best-practices
  - https://touchlane.com/backend-first-mobile-development-best-practices-for-building-secure-and-robust-apps/
  - https://queue.acm.org/detail.cfm?id=3704628

status: draft
review_by: 2026-09-12
author: claude-opus-4-6
version: 1
---

# Exam Mobile Interface

> Decision frameworks for connectivity resilience, question navigation, and backend integrity on mobile exam platforms.

## TL;DR

- **Server-side timer is the single source of truth** — client timers are display-only; auto-submit on server expiry regardless of client state
- **Offline-queue every answer immediately** — IndexedDB backup + server-primary sync; never batch answers
- **Single-question-per-screen on mobile** — reduces cognitive load and enables swipe navigation; question palette in a collapsible bottom sheet
- **ARIA timer announcements follow a decay cadence** — every 60s normally, every 10s in final 2 min, `assertive` only in final 10s

## Decision Guide

| Scenario                                      | Approach                                                                                        | Why                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Question layout on phones (<768px)            | Single question per screen with swipe + prev/next buttons                                       | Scroll-based layouts lose the question palette context; single-screen keeps focus                |
| Question layout on tablets (768px+)           | Side panel question palette + single question in main area                                      | Tablet has room; persistent palette reduces tap count to navigate                                |
| Answer submission strategy                    | Optimistic: save locally first, sync to server async                                            | Pessimistic submission blocks UI on slow networks; optimistic keeps flow                         |
| Network drops mid-exam                        | Queue answers in IndexedDB; show "offline" badge; sync on reconnect                             | Users must never lose answers; visual indicator prevents false confidence                        |
| WiFi-to-cellular handoff                      | Detect `navigator.connection` change; force re-sync queued answers                              | Handoffs silently drop in-flight requests; explicit re-sync prevents data loss                   |
| Timer display on mobile                       | Compact badge in sticky header; tap to expand full time                                         | Full timer competes for limited screen space; badge balances info vs space                       |
| Timer for screen readers                      | `role="timer"` with `aria-live="polite"`; switch to `assertive` at T-10s                        | Constant announcements disrupt problem-solving; decay cadence balances awareness vs interruption |
| Burst traffic at exam start                   | Pre-warm serverless functions 5 min before scheduled start; use read replicas for question data | Cold starts + thousands of simultaneous connections = timeouts; pre-warming prevents this        |
| Answer conflict (edited offline, also synced) | Last-write-wins with client timestamp; server logs both versions                                | Exam answers are user-intent; latest action is authoritative, but audit trail matters            |
| Accidental tab close / browser crash          | Resume from server-side progress; restore last question position                                | IndexedDB may be cleared; server state is the recovery source                                    |

## Question Navigation Patterns

| Component         | Mobile (<768px)                                                                  | Tablet (768px+)                                     |
| ----------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| Question palette  | Collapsible bottom sheet (tap to expand)                                         | Persistent side panel                               |
| Navigation        | Swipe left/right + bottom prev/next buttons                                      | Prev/next buttons + palette click                   |
| Status indicators | Color-coded dots: filled (answered), outlined (not visited), flagged (amber dot) | Same, with text labels alongside dots               |
| Sticky header     | Question number + timer badge + flag button                                      | Question number + full timer + flag + section label |
| Sticky footer     | Prev / Next buttons + palette toggle                                             | Prev / Next buttons                                 |
| Answer area       | Scrollable between header and footer                                             | Fixed panel, scrolls internally if needed           |

### Answer Input Sizing

| Input Type     | Pattern                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| MCQ (single)   | Full-width tappable cards (not radio circles); entire card is the tap target        |
| MCQ (multiple) | Full-width cards with checkbox indicator; "Select all that apply" instruction above |
| Numeric input  | `inputmode="decimal"` to trigger numeric keyboard; large input field                |
| Text response  | Auto-expanding `textarea`; minimum 3 lines visible                                  |

## Connectivity Resilience

### Sync Architecture

```
Answer selected
  → Save to IndexedDB immediately (with timestamp)
  → POST to server async
    → Success: mark local entry as synced; show subtle checkmark
    → Failure: queue for retry (exponential backoff: 1s, 2s, 4s, 8s, max 30s)
  → On reconnect: flush entire queue in order
  → On exam submit: verify all local answers are server-synced before confirming
```

### Visual Indicators

| Network State   | UI Treatment                                            |
| --------------- | ------------------------------------------------------- |
| Online, synced  | No indicator (clean state)                              |
| Online, syncing | Subtle spinner near answer                              |
| Offline         | Amber "Offline" badge in header; answers still saveable |
| Reconnecting    | "Reconnecting..." badge; auto-flush queue               |
| Sync conflict   | Silent resolution (last-write-wins); log for audit      |

## Server-Side Exam Integrity

| Concern                | Pattern                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Timer authority        | Server calculates remaining time; client syncs every 30s; auto-submit triggered server-side                           |
| Idempotent submission  | Each answer POST includes `(session_id, question_id, client_timestamp)`; server upserts, never duplicates             |
| Session management     | Unique session ID per attempt; all submissions validated against active session; expired sessions reject writes       |
| Question randomization | Seed generated server-side per session; order + option shuffle stored with session; consistent on resume              |
| Burst scaling          | Pre-warm 5 min before start; connection pooling; read replicas for question retrieval; queue-based result computation |
| Anti-replay            | Reject answer submissions with timestamps older than last accepted timestamp for that question                        |

## ARIA Timer Accessibility

| Time Remaining | `aria-live` Value | Announcement Frequency      | Rationale                                      |
| -------------- | ----------------- | --------------------------- | ---------------------------------------------- |
| > 15 min       | `off`             | None (user checks manually) | Constant announcements disrupt problem-solving |
| 5-15 min       | `polite`          | Every 5 minutes             | Low-frequency awareness without interruption   |
| 2-5 min        | `polite`          | Every 60 seconds            | Increasing urgency, still non-disruptive       |
| 10s-2 min      | `polite`          | Every 10 seconds            | Preparation for final push                     |
| < 10s          | `assertive`       | Every second                | Critical: user must know time is expiring      |

## Common Mistakes

| Mistake                                               | Fix                                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Trusting client-side timer for auto-submit            | Server-side timer is authority; client timer is display-only                                |
| Batching answers on submit instead of per-answer save | Save each answer immediately; batch submission risks total data loss on crash               |
| No offline indicator (user thinks answers are saving) | Show clear "Offline" badge; prevent false confidence                                        |
| Question palette as a full-page overlay on mobile     | Use collapsible bottom sheet; overlay breaks flow and hides the current question            |
| Same layout for phone and tablet                      | Phone needs single-question view; tablet can show persistent palette                        |
| Retry without backoff on network failure              | Exponential backoff (1s to 30s max); aggressive retry floods recovering network             |
| Computing results synchronously at exam end           | Queue result computation; thousands submitting simultaneously will overload sync processing |
| No pre-warming before scheduled exam                  | Cold-start latency + burst traffic = mass timeouts at exam start                            |

## Checklist

Connectivity:

- [ ] Answers save to IndexedDB before server POST
- [ ] Offline badge appears within 2s of connection loss
- [ ] All queued answers sync on reconnect (in order)
- [ ] Final submit verifies all answers are server-synced
- [ ] Exponential backoff on failed POSTs (1s-30s)

Navigation:

- [ ] Single-question view on phones (<768px)
- [ ] Question palette accessible via bottom sheet toggle
- [ ] Swipe navigation works between questions
- [ ] Status indicators distinguish answered/unanswered/flagged/not-visited
- [ ] All tap targets >= 48px with >= 8px spacing

Timer and Accessibility:

- [ ] Timer element has `role="timer"`
- [ ] ARIA live region follows decay cadence (off > polite > assertive)
- [ ] Timer is hideable/minimizable (see exam-anxiety-ux.md)
- [ ] Full exam flow completable via keyboard alone

Backend:

- [ ] Server-side timer is single source of truth
- [ ] Answer submissions are idempotent (session + question + timestamp)
- [ ] Serverless functions pre-warmed before scheduled exam start
- [ ] Result computation is queued, not synchronous

## Related

- [Exam Anxiety UX](./exam-anxiety-ux.md) — Timer anxiety patterns, framing, pre-exam flows
- [Loading States](./loading-states.md) — Offline/sync state feedback patterns

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-03-12 | Initial version |
