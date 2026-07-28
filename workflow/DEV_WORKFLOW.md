# Dev Workflow

Lightweight by design — this is a solo-founder project. Add process only when
it starts paying for itself (a collaborator joins, or a change carries real
deploy risk).

## Commits

- Commit directly to `master` for docs, config, and scaffolding changes.
- Conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`: keeps
  history usable as reusable knowledge later.

## Branching

- Once product code (`index.html`, `js/`, `css/`, `server.js`, or any future
  app code) is actively changing, switch to feature branches + PRs for that
  code. Docs/config can stay on direct commits.

## Standing Rule

- Update `CURRENT_STATE.md` after every meaningful milestone — this is
  already a rule in `START_HERE.md` and `CLAUDE.md`; repeated here so it's
  visible alongside the rest of the workflow.
