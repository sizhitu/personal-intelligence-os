# Architecture

## Design goals
- One shared intelligence core; domain-specific context and workflows.
- Durable personal context and decision history; external knowledge fetched on demand.
- Explainable recommendations with provenance, uncertainty, and counterevidence.
- Privacy by design, least privilege, and user control.
- Replaceable model, search, and data providers.

## Logical layers
1. User interface: conversation / decision workspace, interactive relationship graph, concise proactive recommendations.
2. Shared core: context resolver, value alignment, first-principles reasoning, mental-model selection, evidence manager, trade-off evaluator, recommendation composer, feedback and methodology review.
3. Domain context: faith, family, business, life.
4. Persistence and adapters: personal/domain records, decision ledger, methods, evidence references, on-demand search and APIs.

## Data boundaries
- profile: confirmed values, goals, preferences, constraints
- domain_records: authorized facts and commitments by domain
- decisions: decision ledger and action history
- evidence: source references, retrieval dates, relevant excerpts or normalized facts
- mental_models: reusable models and application notes
- methodologies: versioned decision procedures
- feedback: outcomes, reviews, proposed changes
- permissions: ownership, consent, roles, retention, deletion metadata

## Relationship graph
A navigable map, not a dense dump. Node types: goal, domain, decision, principle, evidence, mental_model, action, outcome. Edges: supports, constrains, informed_by, depends_on, resulted_in.

## Suggested stack
Python + FastAPI, PostgreSQL, lightweight web frontend. Keep model and retrieval layers behind adapters.

## Security
Separate authentication, authorization, and domain permissions. Encrypt sensitive data in transit and at rest. Keep secrets out of source control. Audit access and support export, correction, retention, and deletion.

## Whole-system evaluation

The shared core includes a global optimization guard between option evaluation and recommendation composition. It resolves system boundaries, stakeholder/domain impacts, time horizons, dependencies, externalities, feedback delays, path dependence, and alternative action sequences. It prevents proxy/local metric gains from silently overriding whole-system goals. It is a review and robustness layer, not a promise of a mathematically unique global optimum.

## Learning and compounding engine

The feedback layer stores pre-action hypotheses and baselines, forecasts, actions, leading/lagging indicators, observed outcomes, counterfactual notes, attribution confidence, replications, evidence tiers, scale-up decisions, and rollback triggers. It extracts candidate mechanisms and playbooks, but methodology changes remain proposals until user-approved. A scale controller enforces evidence gates and whole-system guardrails at each expansion stage; reinforcing loops must be paired with balancing controls.
