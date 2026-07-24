---
name: create-project-issue
description: Draft and file GitHub issues for the As-Salam-Mosque/divine-display (frontend) and As-Salam-Mosque/divine-display-backend (FastAPI backend) repos, following this org's actual issue conventions (Problem/Fix direction/Acceptance Criteria/Reference structure, Priority field, cross-repo linking). Use whenever asked to create, file, draft, or write a GitHub issue, bug report, or feature request for either project.
---

# Creating Divine Display issues

Both repos live under the `As-Salam-Mosque` org:

- `As-Salam-Mosque/divine-display` — React/TS frontend
- `As-Salam-Mosque/divine-display-backend` — FastAPI backend

## Workflow

1. **Pick the repo(s).** Decide if the request is frontend-only, backend-only, or genuinely split across both (e.g. a feature needs a new API endpoint *and* a UI change). Don't cram unrelated frontend+backend work into one issue — split it and cross-link (see Gotchas).
2. **Search before creating.** Use `search_issues` scoped with `repo:` to check nothing already covers this (this org keeps issues tightly scoped to one concern — duplicates are easy to create by accident).
3. **Draft the issue** using the template below and show it to the user for confirmation before calling `issue_write`, unless they've explicitly said to just create it.
4. **Set the Priority field** via `issue_fields` on `issue_write` (org-level single-select: `Urgent` / `High` / `Medium` / `Low`). Ask the user if it's unclear; default to `Medium` rather than guessing `High`/`Urgent`.
5. **Labels: don't invent them.** Only `ui` is confirmed to exist on `divine-display`. Before applying any other label, check it exists with `get_label`. If it doesn't exist and the user hasn't asked you to create one, leave the issue unlabeled rather than fabricating a label name.
6. **After creating**, if the work is really a multi-step epic, offer `sub_issue_write` to break it into sub-issues, or point the user at the `breakdown-plan` skill instead of stuffing everything into one issue.

## Title convention

Real examples from this org's history:

- `Landing page: verify/improve contrast of muted text against WCAG 2.2 AA`
- `Dashboard: upload images to backend instead of embedding base64 data URLs`
- `Add image upload endpoint backed by Backblaze B2 + Cloudflare CDN`

Pattern: `<Area/Component>: <imperative description>` when the issue is scoped to one page/component; a plain imperative sentence for broader backend/infra work. No trailing period, no priority/label prefixes in the title (that's what the Priority field and labels are for).

## Body template

Every real issue in this org follows this shape — use it as-is, dropping sections that genuinely don't apply:

```markdown
## Problem

[What's wrong or missing, with concrete file paths / current behavior]

## Fix direction

[Concrete approach — not required to be prescriptive, but should point at
specific files/functions/patterns to reuse. Use "## Proposal" instead of
"## Fix direction" for net-new features rather than fixes.]

## Acceptance Criteria

- [ ] Specific, checkable outcome
- [ ] Specific, checkable outcome

## Reference

- `path/to/file.tsx` — what's relevant there
- As-Salam-Mosque/other-repo#N — only if this is one half of a split issue
```

Acceptance criteria must be genuinely checkable — never leave them as vague prose like "improve the UX."

## Gotchas

- **Cross-repo split issues are a real, established pattern here** (see divine-display#22 ↔ divine-display-backend#5). When one feature needs work in both repos, create both issues, then reference each in the other's `## Reference` section using the full `As-Salam-Mosque/<repo>#<number>` form, plus a one-line note like "This is the frontend half of a split issue; backend counterpart tracked in As-Salam-Mosque/divine-display-backend#5." Create whichever issue exists first, get its real number, then create the second one linking back.
- **Custom fields are org-level**, not labels: `Priority` (Urgent/High/Medium/Low), `Effort` (High/Medium/Low), `Start date`, `Target date`. Set them through `issue_fields` in `issue_write`/`list_issue_fields`, never as a label or title prefix.
- `list_issue_types` returns a 403 for this org with the current token — don't rely on GitHub "issue type"; use labels/fields instead.
- If the fix touches user-facing copy in `divine-display`, add an AC line for updating **both** `src/translations/en.ts` and `src/translations/fr.ts`.
- If the fix touches colors/spacing/typography in `divine-display`, add an AC line requiring dark **and** light theme parity and reuse of existing tokens (no new colors) unless the issue is explicitly a design change.
- If the fix touches `MosqueConfig`/`SponsorAsset` in `divine-display-backend`, add an AC line that field names stay camelCase and that legacy `adSlots` must remain rejected (`MosqueConfig.reject_legacy_adslots`).
- If the fix touches auth in `divine-display-backend`, add an AC line that only the SHA-256 session token hash is persisted — the plaintext token must never be logged or returned outside the initial issue/response.
- Always cite concrete file paths in `## Reference`, the way every existing issue does — never describe the location as just "the frontend" or "the backend."
