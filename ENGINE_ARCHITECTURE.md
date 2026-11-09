# Explainable Decision Engine v0.4

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
- Add a secured server-side provider proxy with rate limits, budget controls, secret management, redaction, and stronger provider-specific adapters; the current browser adapter is optional and user-key based.
- Add automated unit tests for routing, gate precedence, score calculations, and sensitivity.


## AI adapter v0.4

- `web/data/model-library.json` contains 19 curated mental-model records with diagnostic questions, boundary conditions, failure modes, and source lineage. `web/ai-adapter.js` implements an optional OpenAI-compatible Chat Completions adapter. It is isolated from the deterministic router and can be replaced by another provider adapter without changing the decision ledger.
- The user supplies an HTTPS endpoint, model ID, and API key. No key is committed, stored in localStorage, or included in exported records; the password input is cleared after each request. Browser CORS and provider-specific request compatibility are explicit limitations; a server-side proxy is a later, separately secured option.
- The user must explicitly consent before current decision context is transmitted. Recent decision and review summaries are a separate, unchecked-by-default opt-in (up to five records). The context includes problem, goals, constraints, options, deterministic engine output, curated model metadata, and a small set of public case seeds. Sensitive information should not be entered.
- AI output is untrusted analysis, not a verdict. It must distinguish facts, assumptions, unknowns, evidence confidence, factor importance, and option performance; use only supplied case IDs and source URLs; identify counterevidence and uncertainty.
- AI snapshots attach to a user-selected decision record and are included in manual JSON exports. They do not automatically alter values, weights, or methodology.
- Bounded learning failures: celebrate only pre-registered, foreseeable, controlled, lawful, safe, ethical experiments with capped exposure and genuine information value. Preventable failures, repeated avoidable errors, concealed risks, and harm beyond guardrails are not celebrated.


## Validation status

Static checks completed for the deterministic engine, AI adapter, inline workbench script, and all three JSON data files. These checks confirm syntax and data parseability, not a live API request, browser rendering, provider CORS behavior, or factual accuracy of AI outputs. The first real provider call requires the user's own endpoint, model ID, API key, and explicit data-sharing consent.


## Local-first architecture correction

The deterministic decision engine and the local decision ledger are the system's operational core. They must not depend on an LLM, API key, external network, or provider uptime. The AI adapter is an optional extension with a separate navigation view and explicit data-sharing consent; it cannot own system state, enforce values, or block local workflows. The relationship graph and decision history are sibling top-level views. Keep view sections structurally balanced and test their DOM hierarchy whenever the workbench markup changes.
