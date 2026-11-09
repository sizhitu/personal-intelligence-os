# Decision Factor Weighting & Radar Polygon

## Purpose
Decision analysis should expose the factors that shape a recommendation and their relative importance. The UI uses a radar chart (spider chart) to display the factor profile as a polygon.

## Distinguish three concepts
- **Factor importance weight**: how much a criterion matters to this decision.
- **Option performance / score**: how well a candidate performs on that criterion.
- **Evidence confidence**: how reliable the information or estimate is.

Do not collapse these into one number. A high weight means the criterion matters more; it does not mean the option scores highly or that the conclusion is more certain.

## Decision-specific weighting
Weights should vary by decision domain and user-confirmed objectives:
- Faith/value alignment: non-negotiable values should generally be treated as constraints or veto conditions, not merely low-weight criteria that can be traded away.
- Family: wellbeing, relationship impact, time, stability, and responsibilities.
- Business: customer value, strategic fit, growth, cash flow, execution, team and downside.
- Investing: expected return, valuation, business quality, downside/ruin risk, time horizon, liquidity, and uncertainty.
- Life/health: safety, quality of life, evidence quality, sustainability, and reversibility.

These are examples, not a universal default. The system may propose weights based on the user's context, but must show why and ask for confirmation when the choice materially affects the recommendation.

## Normalization
For ordinary weighted scoring, positive criterion weights can be normalized:

normalized_weight_i = raw_weight_i / sum(raw_weights)

Displayed percentages sum to 100%.

If criteria are scored for each option, use a separately defined scale (e.g. 0–5 or 0–10), clearly label the scale and scoring evidence, and calculate a weighted score only when appropriate.

## Radar polygon
- One axis per criterion.
- Axis labels remain readable on mobile.
- The polygon represents the normalized weight profile.
- Tooltips/details should show exact criterion, raw weight, normalized weight, and explanation.
- Provide accessible textual/table representation; the chart is not the only output.
- User can adjust factors and see the polygon update.

## Decision governance and limitations
- The chart is an explanation aid, not an objective truth machine.
- Avoid false precision: do not present unsupported percentages as scientific measurements.
- User-confirmed weights and AI-proposed weights must be distinguishable.
- Do not let a weighted average override non-negotiable values, legal/safety constraints, or severe tail risks.
- Include sensitivity analysis: if reasonable weights change, does the recommendation change?
- For high-stakes choices, show uncertainty, downside scenarios, and non-quantifiable considerations instead of hiding them inside a score.
- Preserve weight changes with decision records only when the user explicitly saves or confirms them.
- Each decision report should show: factors, normalized weights, rationale, source/owner of weights, score scale if used, and sensitivity of the conclusion.
