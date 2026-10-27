# Local Stellar Core verification

This development harness creates an ephemeral synthetic network. The shipped CLI and library remain offline and never sign or submit transactions.

## Reproduce

Requires the documented Node runtime, npm, a running Docker daemon, and enough capacity for a container capped at 1,536 MiB. The first image download can take several minutes.

```sh
npm ci
npm run check
npm run test:core
```

The integration command builds the product, starts the digest-pinned official Quickstart image in [network.json](../integration/network.json), bootstraps its history checkpoint, and waits for RPC ingestion. It binds Core and RPC to dynamically assigned ports on `127.0.0.1`. It accepts no user-supplied endpoint, secret or asset. Network identity and ledger protocol are checked before signing synthetic transactions. Only the container created by that invocation is removed in normal completion or failure. A hard process kill can require manual removal of that invocation's `claimplan-core-<UUID>` container; never prune unrelated containers or volumes.

## What is compared

Thirty independent balances cover ten cases at deadline offsets −1, 0 and +1 seconds: unconditional, absolute before, relative before, NOT, an AND window, an OR gap, complementary OR, contradiction, and both sides of a two-claimant handover. Every probe has funded accounts and a separate balance, so an earlier successful claim cannot consume a later probe's balance.

The harness checks an independently declared truth table against ClaimPlan's public report, then against Core's actual operation result. Claims are queued in three real-time manually closed ledgers. Every recorded transaction must have the exact expected ledger close time; missing the timing window fails the run. RPC ingestion is checked after all three closes to preserve one-second spacing. On a heavily loaded host, rerun after resolving the timing contention; never widen the expected boundary to make a test pass.

Five execution controls distinguish `cannotClaim` from missing trustlines, insufficient trustline capacity, missing issuer authorization, source underfunding and low reserves. An unconditional issued-asset report can pass its predicate policy while execution fails. That is the product's documented scope, not a payment guarantee.

The test writes `integration/core-results.json` only after every comparison and control passes. It includes the image digest, observed Core build, selected protocol, unsigned creation envelope, policy, exact intervals, balance IDs, transaction hashes, ledger numbers and actual result codes. Runtime-generated account secrets and signed envelopes are not saved. This is local test evidence; hashes have no public explorer links.

## Environment decisions

Quickstart's `--local` uses the standalone network passphrase but does not set Core's `RUN_STANDALONE=true`. Core v30's virtual-clock mode advanced while external RPC was waiting and produced clock assertions during the first experiment. The harness uses the default real-time clock and parameterless manual closes instead. It does not modify Core binaries or protocol predicate behavior. A first history checkpoint is needed before the RPC database becomes usable.

## Limits

The image, SDK and ledger protocol are pinned. Updating them requires inspecting current official documentation and rerunning the harness. A successful run covers the finite cases above on that version only. Extreme integer/saturation cases remain in the offline bigint tests; no attempt is made to schedule ledgers near `INT64_MAX`. This is not an external audit, customer validation, or evidence of mainnet execution.

Sources: [official Quickstart](https://github.com/stellar/quickstart), [Core manual-close implementation](https://github.com/stellar/stellar-core/blob/v30.0.0/src/main/ApplicationImpl.cpp), [RPC transaction results](https://developers.stellar.org/docs/data/rpc/api-reference/methods/getTransaction).
