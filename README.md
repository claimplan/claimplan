# ClaimPlan

Offline validation of Stellar claimable-balance payout plans.

ClaimPlan is being developed as a command-line tool and TypeScript library. It will check whether a payout's claimant conditions match its intended beneficiary and recovery rules before the transaction is submitted.

## Status

Initial repository scaffold. The analyzer and CLI are not implemented yet. There is no published package or working installation command.

## Planned scope

- Read local transaction-envelope XDR and an explicit payout-policy file.
- Check all claimants in each supported claimable-balance operation together.
- Identify contradictory conditions, uncovered claim windows, unexpected overlap, and recovery-policy violations.
- Report exact findings in the terminal and deterministic JSON for CI.
- State creation-time assumptions whenever relative predicates are analyzed.

The product runs locally or in the user's CI. It requires no website, hosted API, database, or deployed smart contract.

## Limits

Predicate eligibility does not establish that an account can execute a claim. Keys, trustlines, issuer authorization, account state and actual ledger close times need separate consideration. Overlap and the absence of a recovery claimant can be intentional; findings must distinguish protocol facts from declared application policy.

ClaimPlan is not an audit or a guarantee of recovery. It will not sign or submit transactions.

## Prior art

Predicate evaluation already exists in [Stellar Expert's claimable-balance utilities](https://github.com/stellar-expert/claimable-balance-utils) and [stellar-resolve-claimant-predicates](https://github.com/hanseartic/stellar-resolve-claimant-predicates). ClaimPlan's proposed scope is whole-plan policy checking and a local CLI workflow.

Protocol behavior is grounded in [Stellar's claimable-balance guide](https://developers.stellar.org/docs/build/guides/transactions/claimable-balances), [CAP-23](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0023.md), and Stellar Core. Implementation must be tested against their exact semantics.

## Development sequence

1. Specify the policy schema and report format.
2. Build independent boundary and malformed-input fixtures.
3. Implement exact predicate interval analysis and whole-plan policy checks.
4. Add XDR parsing, CLI output and CI checks.
5. Validate the workflow with developers who create claimable balances.

## License

MIT. See [LICENSE](LICENSE).
