# Model-Driven Adaptive Decision Weighting

## Core principle

Decision factors and their weights should be generated dynamically from the problem context and the selected multidisciplinary mental models. The system must not apply one universal fixed weight vector to every decision.

The process is **model-driven, context-aware, explainable, and user-correctable**.

## Pipeline

1. **Parse the decision**: identify domain, desired outcome, stakeholders, time horizon, constraints, uncertainty, reversibility, and stakes.
2. **Select mental models**: the Model Router selects a small set of relevant models from the library and explains why each is applicable.
3. **Extract decision factors**: each selected model contributes factors, diagnostic questions, and potential failure modes.
4. **Merge and deduplicate**: unify synonyms and overlapping factors while retaining links to the models that contributed them.
5. **Apply hard constraints first**: faith commitments, legal constraints, safety requirements, and explicit user non-negotiables are not ordinary weighted criteria. They are gates or veto conditions.
6. **Propose relative weights**: derive an initial importance profile from the decision context, user-confirmed priorities, model relevance, evidence, and downside severity.
7. **Explain and normalize**: show raw rationale and normalized percentages. Weights sum to 100% only among criteria that are legitimately tradeable.
8. **Evaluate options separately**: score each option against each factor on a declared scale, with evidence and confidence. Do not confuse importance weight with option performance or evidence confidence.
9. **Sensitivity analysis**: vary plausible weights and assumptions; show whether the preferred option changes.
10. **User review and decision**: users can adjust, lock, remove, or add factors. Material changes require confirmation.
11. **Record and learn**: preserve the generated factor set, model provenance, user edits, and eventual outcome for calibration. Do not silently change stable user values.

## Mental model families and factor contributions

### Cognitive psychology
Contributes: bias exposure, emotional pressure, anchoring, loss aversion, overconfidence, planning fallacy, base-rate neglect, sunk-cost risk.
Typical role: challenge the reliability of the decision process, not automatically add a large numeric weight to every bias.

### Munger / multidisciplinary reasoning
Contributes: incentives, opportunity cost, circle of competence, margin of safety, second-order effects, compounding, comparative advantage.
Typical role: broaden alternatives and expose hidden costs or incentive conflicts.

### Scientific method and Bayesian reasoning
Contributes: evidence quality, base rates, uncertainty, falsifiability, counterevidence, measurement quality, causal confidence.
Typical role: determine how much confidence the system should place in claims and forecasts. Evidence confidence should remain separate from criterion importance.

### Cybernetics and systems thinking
Contributes: feedback delay, controllability, observability, stability, adaptation, resilience, leverage points, unintended consequences, system boundary.
Typical role: assess whether an intervention can be monitored and corrected, and whether local optimization harms the wider system.

### Risk and decision theory
Contributes: downside severity, ruin/survival, tail risk, reversibility, optionality, liquidity, scenario sensitivity, margin of safety.
Typical role: protect against catastrophic or irreversible downside; some risks should be hard constraints rather than merely weighted factors.

### Economics, strategy, and organization
Contributes: incentives, agency costs, transaction costs, competitive advantage, switching costs, network effects, capital efficiency, strategic fit.
Typical role: evaluate economic sustainability and long-term advantage.

### Historical case reasoning
Contributes: contextual similarity, mechanism similarity, precedent outcomes, counterexamples, base rates, and boundary conditions.
Typical role: challenge or refine factors and assumptions. A famous anecdote must not mechanically raise a factor's weight.

## Weight derivation: explainable proposal, not fake precision

The system may use a structured heuristic to propose relative weights. Inputs can include:
- relevance to the user's stated objective;
- explicit user priority and non-negotiable constraints;
- decision-specific model relevance;
- potential severity and irreversibility of downside;
- strength and quality of available evidence;
- time horizon and ability to reverse or stage the decision.

Do not claim these produce scientifically objective percentages. Treat the output as a transparent starting proposal, not a discovered truth. If the context is too weak, ask one clarifying question or show provisional weights with low confidence.

A recommended explanation for each factor:
- Why this factor exists;
- Which model(s) introduced it;
- Why it matters in this decision;
- Proposed weight and rationale;
- Evidence/confidence;
- What would increase or decrease its weight.

## Three distinct visual layers

1. **Importance radar**: normalized factor weights.
2. **Option performance profile**: each candidate's score on the same factors, shown as separate series or an aligned table.
3. **Evidence/confidence layer**: source quality and uncertainty, shown separately (e.g. confidence markers or ranges).

Never let the radar polygon imply that the option with the largest shape is automatically best. The importance radar represents the structure of the decision, not option quality.

## Sensitivity and robustness

- Test whether reasonable weight changes reverse the recommendation.
- Identify dominant factors that drive the conclusion.
- Show close calls and trade-offs.
- Include a non-weighted narrative for qualitative or incomparable values.
- For high stakes, run downside scenarios and robust-choice analysis.
- If a recommendation depends on a narrow or arbitrary weight setting, state that clearly.

## Special governance

- User-confirmed Faith commitments and other explicit non-negotiables are constraints, not tradeable percentages.
- Family responsibilities and wellbeing must be represented explicitly where relevant; they must not disappear behind business optimization.
- Never infer sensitive values or priorities from behavior without confirmation.
- The model router must explain why models were selected and allow correction.
- A model may contribute a factor, but it cannot dictate its weight without context.
- Historical cases may challenge assumptions but cannot establish universal weights.
- Save generated weights only as part of a specific decision record; do not silently overwrite the user's general preferences.
- The user has final authority over the criteria and trade-offs.

## Output contract

Every substantial decision report should include:
- selected models and selection rationale;
- factors extracted from each model;
- merged factor list and model provenance;
- proposed normalized weights with explanations;
- hard constraints / veto conditions;
- option scores and evidence confidence, separately;
- sensitivity and robustness findings;
- relevant historical cases and their limits;
- final conclusion and user-editable assumptions.

## Global optimization guard (before final scoring)

Dynamic factor weights alone cannot prevent suboptimization. Before applying the weighted score, define the system boundary, affected stakeholders/domains, dependencies, and time horizon. Apply hard gates first, then inspect whole-system outcomes, long-term trust/resilience/capability, and only then tradeable weighted criteria. Check local metrics against the true objective, cost transfers, externalities, Goodhart risk, feedback delays, path dependence, bottlenecks, and second-/third-order effects. For coupled decisions, compare pathways or bundles of actions rather than isolated steps. Add a do-nothing/wait baseline where relevant. Report sensitivity to boundary, horizon, assumptions, and weights. See [Global Optimization Guard](GLOBAL_OPTIMIZATION_GUARD.md).
