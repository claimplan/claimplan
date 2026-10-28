# Contributor backlog

These tasks are published as GitHub issues [#1](https://github.com/claimplan/claimplan/issues/1), [#2](https://github.com/claimplan/claimplan/issues/2) and [#3](https://github.com/claimplan/claimplan/issues/3). They are not Wave nominations. No points, rewards or assignments are promised.

## Independent review of interval semantics and policy distinction — issue #1

Problem: the current implementation has self-verification and finite Core evidence, but no independent semantic review.

Scope: review the supported predicate operators, half-open boundaries, relative saturation, beneficiary/recovery windows, and the difference between protocol eligibility and policy choices. Compare against pinned Core/CAP-23 sources. Do not add signing or submission to the product.

Acceptance:
- Record reviewed source versions, functions and each rule-to-implementation mapping.
- Independently check before/at/after examples for every supported operator and handover role.
- For discrepancies provide synthetic unsigned input, expected/actual intervals and a regression check; report no findings honestly when appropriate.
- State unreviewed areas and avoid calling the exercise a formal audit.

Dependencies: `docs/SPEC.md`, `docs/CORE-VERIFICATION.md`, current passing CI. Effort: substantial protocol knowledge; scope review before assignment. This does not replace the two developer usefulness sessions.

## Exercise maximum-size plans and malformed XDR resource behavior — issue #2

Local implementation and observations are now in [RESOURCE-VERIFICATION.md](RESOURCE-VERIFICATION.md): 55 fixtures/123 bounded checks passed on each local Node 22/24 runtime. CI runs this corpus on Ubuntu/Node 22 and 24; consult the linked issue/run for the actual remote result. No analyzer defect was found in this finite corpus.

Problem: structural limits exist, but there is no recorded benchmark/corpus for a maximum 100-operation, 10-claimant plan or adversarial recursive envelope input.

Scope: create deterministic synthetic fixtures/corpus within and beyond declared limits; measure local time and memory with runtime/host details, including malformed XDR nesting. Preserve the 1 MiB file boundary and fail-closed behavior. Do not claim universal performance bounds from one machine.

Acceptance:
- Supported maximum-size plans produce located, deterministic reports without skipped operations.
- Oversized/depth-invalid/trailing/noncanonical inputs return controlled errors; measure representative behavior in an isolated subprocess with a timeout.
- If resource limits are bypassed, provide one reproducible finding, a targeted fix and regression coverage.
- Record commands, seeds, observed limits and remaining SDK parser risk.

Dependencies: independent review of intended supported limits in `docs/COMPATIBILITY.md`; no new service/backend. Effort: medium to substantial, depending on findings.

## Reproduce source installation on macOS and Windows — issue #3

Problem: current local/CI evidence is Linux/Ubuntu; documentation explicitly leaves other native platforms unverified.

Scope: run the documented source quick start, offline suite, demo and installed-package checks on each target with Node 22/24. Inspect FIFO test skipping and npm executable handling. Fix reproducible portability defects only; do not infer success from CI configuration alone.

Acceptance:
- Supply actual OS/Node/npm versions and command results for each tested environment.
- Validate installed command and ESM import; preserve exits 0/1/2 and deterministic output.
- Add CI coverage only after reproducing the platform setup and documenting supported exceptions.
- Update compatibility docs with evidence and any failures, leaving untested environments explicit.

Dependencies: registry access for package installation (or a deliberately warmed cache for optional offline mode), and maintainers with access to the target platforms. Effort: medium. No device purchases or paid runner usage authorized by this draft.
