# Explainable Decision Engine v0.3

## Runtime pipeline

1. Parse the question, selected domain, goal, stakeholders, horizon, and reversibility.
2. Route a small set of mental-model families using transparent keyword/context rules.
3. Generate a decision-specific factor set and normalized provisional weights. Store factor provenance and explanations. Weights are heuristic suggestions, never objective truth.
4. Present hard constraints as non-compensatory gates. The engine lists checks but does not infer whether a real-world constraint is satisfied.
5. Apply the global optimization checklist across system boundaries, stakeholders, time horizons, externalities, feedback delays, lock-in, and no-action baseline.
6. Retrieve candidate public cases from local JSON research seeds. Current matching uses domain and keyword overlap, not semantic embeddings or causal proof. Each case includes a source link and caveat/red-team field where available.
7. Ask the user to rate each option on the same factors and separately declare gate status. Missing ratings remain incomplete. Failed gates are excluded from ranking.
8. Compute weighted option scores and one-factor-at-a-time ±20% sensitivity checks. Report whether the lead changes; do not imply statistical confidence.
9. Send a selected action to the existing decision/experiment ledger manually; later releases will provide one-click linkage and versioned methodology proposals.

## What it is / is not

This is a deterministic, client-side explainable heuristic. It works without an API key and does not transmit data. It is not a language model, a validated forecasting model, a legal/medical/financial adviser, or an autonomous decision maker. It does not claim live research. The built-in case library is a research seed with mixed domains and limited coverage; citations must be checked before high-stakes use.

## Weight governance

- Hard constraints never enter the compensatory weight vector.
- Factor importance, option performance, and evidence confidence are separate concepts.
- The initial vector is contextual and heuristic; users can edit it through the existing radar controls.
- Sensitivity uses a simple one-factor perturbation, not a probabilistic Monte Carlo model.
- No single case can dictate a universal weight.

## Privacy and persistence

The engine runs in the browser. Decision text and ratings remain local unless the user exports the ledger. Public case JSON is static site content. No customer or family sensitive data should be entered into this prototype.

## Next increments

- Persist the engine report and provenance as a decision snapshot.
- Add curated model records with diagnostic prompts and boundary conditions.
- Add source verification timestamps and more failure/counterexample cases.
- Replace keyword case ranking with embeddings or a controlled retrieval service.
- Add an optional LLM adapter with explicit user-provided key, provider isolation, redaction, and source citations.
- Add automated unit tests for routing, gate precedence, score calculations, and sensitivity.
