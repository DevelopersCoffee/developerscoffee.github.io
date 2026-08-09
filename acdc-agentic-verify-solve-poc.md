---
title: "We put Claude Code inside a deterministic Verify->Solve loop. It caught its own bug."
date: 2026-08-10
author: Developers Coffee
tags: [ai-agents, sonarqube, claude-code, spring-boot, quality-gates]
repo: https://github.com/DevelopersCoffee/acdc-petclinic-poc
permalink: /acdc-agentic-verify-solve-poc/
---

# We put Claude Code inside a deterministic Verify → Solve loop. It caught its own bug.

Everyone's shipping AI-generated PRs faster than anyone can review them.
The [AC/DC framework](https://www.sonarsource.com/agent-centric-development/)
(Sonar's "Agent Centric Development Cycle") argues the fix isn't more
human review — it's **constraints around the agent**: Guide it with
context, Verify every change deterministically, Solve failures by feeding
findings back in, repeat until a quality gate says yes.

That's a good pitch. We didn't want to take Sonar's word for it, so we
built the smallest version that could prove or disprove it, on a real
codebase, in one afternoon.

**Repo:** [github.com/DevelopersCoffee/acdc-petclinic-poc](https://github.com/DevelopersCoffee/acdc-petclinic-poc)
— forked from [spring-petclinic](https://github.com/spring-projects/spring-petclinic),
every stage is a real, readable commit.

## The setup, in one sentence

Claude Code implements a feature under a `CLAUDE.md` rulebook; a script
(`verify.sh`) runs Maven + ArchUnit + a local SonarQube quality gate
after every change; if it fails, findings go back to Claude; repeat until
green. No human touches the code in between.

## What we asked for

> Add `GET /api/orders?customerId={id}` — paginated, validated, service
> layer holds logic, repository handles persistence, tests required,
> don't touch existing endpoints, don't add dependencies unless needed.

## Commit 1 — the rules (`CLAUDE.md` + ArchUnit)

Before generating anything, we wrote down what "correct" means in a file
Claude reads every session: Controller → Service → Repository, no SQL
string concatenation, validate external input, correct HTTP status
codes, tests required for new logic.

Then we made one of those rules *executable*: an
[ArchUnit](https://www.archunit.org/) test that fails the build if a new
`@RestController` depends on a `@Repository` directly.

One catch worth calling out: **upstream spring-petclinic has no service
layer.** Its own Controllers call Repositories directly, everywhere.
Applying our rule repo-wide would've failed on Spring's own reference
code. So we scoped the ArchUnit rule to the new `order` package only —
the way real teams actually adopt architecture fitness functions: new
code held to a higher bar, legacy debt frozen, not retrofitted mid-task.
[→ commit](https://github.com/DevelopersCoffee/acdc-petclinic-poc/commit/ca28256)

## Commit 2 — the "before": code that breaks its own rules

We had Claude generate the feature once, deliberately unconstrained,
to see what the loop was actually up against:

- `OrderController` injected `OrderRepository` directly — skipped the
  service layer.
- A bonus `/api/orders/raw-lookup` endpoint built SQL by string
  concatenation from a request parameter.
- Missing `customerId` returned `200 OK` with an empty page instead of
  `400`.
- Only a repository test existed — no controller or service coverage.

[→ commit (the "before")](https://github.com/DevelopersCoffee/acdc-petclinic-poc/commit/92e4985)

## Running Verify — and a surprise before the seeded bugs even mattered

```
./verify.sh
```

First failure wasn't one of the ones we planted. It was a **compile
error**: the test imported
`org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest`, which
doesn't exist in Spring Boot 4.1 — the package moved. Claude had guessed
a plausible-looking, wrong import for an API surface it hadn't actually
verified.

That's the whole argument for the loop in one data point: a
plausible-looking wrong answer, caught before it became a runtime
`ClassNotFoundException` in someone's PR.

Fixed the import, re-ran. This time ArchUnit fired exactly as designed:

```json
{
  "type": "ARCHITECTURE",
  "message": "controllersMustNotAccessRepositoriesDirectly: ... was violated (3 times)"
}
```

## Commit 3 — the "after": Solve, driven entirely by findings.json

- Extracted `OrderService`; the controller now depends on it, not the
  repository. Root-cause fix, not a suppression.
- **Deleted** `/api/orders/raw-lookup** — it was never in the requested
  API contract. `CLAUDE.md` says "keep changes scoped"; the correct fix
  for scope creep is deletion, not patching the SQL injection in place.
- `searchOrders` now returns `400` for missing/invalid `customerId`.
- Added `OrderServiceTests` and `OrderControllerTests` — happy path +
  edge cases.

[→ commit (the "after")](https://github.com/DevelopersCoffee/acdc-petclinic-poc/commit/1e08aa9)

## The loop caught its own bug too

Third Verify run: build passed, Sonar scan passed, **gate still failed —
with zero findings.** That's worse than a clear failure; it's a
verification layer lying about why.

Turned out our own `collect_findings.py` was querying Sonar's issues API
with `sinceLeakPeriod=true` — a parameter that doesn't scope to new code
on SonarQube 26.x anymore (`inNewCodePeriod=true` is current). It was
silently returning dozens of *pre-existing* findings from legacy code,
which would've sent the agent chasing the wrong problem entirely.

We fixed the harness itself, re-ran, and found the real cause: new-code
coverage at 69.7% (needed 80%) plus an unused import and a lambda code
smell. Fixed those. Final result:

```
mvn clean verify : PASS
sonar:sonar       : PASS
quality gate      : OK   (new_violations: 0, new_coverage: 100%, new_duplicated_lines_density: 0%)
```

55/55 tests passing (46 baseline + 9 new).

## Why this is the actual selling point

Not "the agent wrote working code" — agents do that constantly and it's
not news. The finding is narrower and more useful:

1. **A wrong-but-plausible answer got caught before it shipped**, purely
   because a deterministic gate ran before a human looked at anything.
2. **The rule that mattered most (architecture) didn't exist as a rule
   until we wrote it down and made it executable.** CLAUDE.md alone is a
   suggestion; ArchUnit made it a gate.
3. **The verification layer had its own bug**, and the same loop
   structure — fail loud, read the actual output, fix the root cause —
   applied to fixing *our* harness, not just the agent's code. If your
   Verify stage can lie, your Solve stage will "fix" the wrong thing.
4. **Scoping matters more than strictness.** A rule applied blindly
   (architecture, repo-wide) would have failed on code we didn't write
   and couldn't fix without an unrelated refactor. Scoped to new code,
   the same rule was useful instead of noise.

## What this doesn't prove

One feature, one repo, one session. We didn't run a blind "no-loop"
control group — for that to mean anything, a different reviewer would
need to grade the same task without seeing the Verify findings, so we
haven't claimed a before/after defect-rate number. If you want to check
our work, the whole thing — including the commit where the agent got an
import wrong and the commit where our own script lied about *why* — is
public.

**Try it yourself:**

```bash
git clone git@github.com:DevelopersCoffee/acdc-petclinic-poc.git
cd acdc-petclinic-poc
docker compose -f docker-compose.sonar.yml up -d   # SonarQube on :9000
./verify.sh
```

[github.com/DevelopersCoffee/acdc-petclinic-poc](https://github.com/DevelopersCoffee/acdc-petclinic-poc)
