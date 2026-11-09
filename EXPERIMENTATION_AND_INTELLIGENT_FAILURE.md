# Experimentation & Intelligent Failure

## Purpose

Build a system that learns quickly through disciplined experiments. Failure is not automatically bad and success is not automatically evidence of a good decision. A failed test can be a valuable result when it was designed to test a meaningful hypothesis, its downside was bounded, safety and ethical constraints were respected, and the information changes what we do next.

**Principle:** celebrate learning, not damage; reward honest early signals, not concealment; make uncertainty visible before committing resources.

## 1. Three classes of failure

### A. Intelligent / informative failure
- A clear hypothesis and expected observable result were recorded before action.
- Plausible failure modes were anticipated and the test was designed to distinguish among them.
- Exposure was bounded, proportionate to the stakes, and reversible where possible.
- Hard constraints, safety, law, consent, and stakeholder protections were maintained.
- The result produced decision-relevant information, including evidence that disproved the hypothesis.
- The team/user captured the lesson and changed the next experiment or decision.

Response: acknowledge and celebrate the learning quality, document the evidence, and decide whether to iterate, pivot, pause, or stop.

### B. Avoidable / preventable failure
- Known risks were ignored, basic checks omitted, or a previously identified defect repeated.
- The failure arose from poor preparation, unclear ownership, weak controls, or failure to act on available evidence.
- The same lesson was not incorporated after earlier reviews.

Response: no blame theatre, but clear accountability and corrective action. Repair the process, controls, training, or ownership; do not relabel preventable harm as experimentation.

### C. Uninformative / poorly designed failure
- The hypothesis was vague, success criteria absent, or too many variables changed at once.
- The outcome cannot distinguish between competing explanations.
- The experiment was too small, too noisy, or poorly measured to guide a decision.

Response: improve experimental design and measurement before repeating. Do not spend more merely because resources were already used.

## 2. Pre-mortem and anticipated failure map

Before a material experiment, record:
- hypothesis, objective, and why the test matters;
- expected result and measurable success/failure criteria;
- assumptions and competing explanations;
- likely failure modes, early warning signals, and detection method;
- probability/range estimates where meaningful, with confidence and evidence basis;
- maximum acceptable loss, exposure, duration, and scope;
- safety, legal, ethical, consent, and other hard constraints;
- containment, isolation, recovery, and rollback plan;
- what we expect to learn under each possible result;
- stop conditions, decision owner, and review date.

A predicted failure is not permission to cause it. If the potential harm is unacceptable, test with simulation, sandboxing, staged rollout, surrogate measures, or a safer alternative. Some risks must not be experimentally imposed on people or critical systems.

## 3. Failure as information

After the test, compare predicted and observed outcomes:
- Which anticipated failure occurred? Which did not?
- What unexpected failure appeared?
- Was the signal detected early enough?
- Which assumption was falsified or strengthened?
- Did the result distinguish among hypotheses?
- What is the information value: which future decision changes because of this result?
- Was the loss within the pre-agreed boundary?
- Did any harm, externality, or hard-constraint breach occur?

Update probability estimates carefully; one experiment rarely establishes a universal rule. Record uncertainty, sample limitations, and contrary evidence.

## 4. Experiment portfolio and staged commitment

Prefer a portfolio of small, informative, low-cost tests before large irreversible commitments. Sequence experiments to maximize useful information per unit of risk, time, and resource. Use staged investment, prototypes, pilots, canaries, simulation, independent checks, and explicit go/no-go gates when appropriate.

Scale only when evidence justifies it. A test that fails safely may justify a better next test; it does not automatically justify a larger test. If uncertainty remains high and downside is severe, reduce exposure or stop.

## 5. Learning metrics, not failure quotas

Do not set a target number of failures. Track instead:
- hypothesis quality and forecast calibration;
- time from signal to detection;
- cost and exposure per useful learning;
- proportion of experiments with pre-defined stop conditions;
- repeat-failure rate after corrective action;
- time to incorporate lessons;
- replication rate and transferability;
- safety, quality, trust, and whole-system guardrails;
- decisions improved or avoided because of new information.

Never reward teams for producing failures, hiding near misses, or gaming experiment counts. Reward transparent reporting, sound design, fast detection, bounded downside, and evidence-based adaptation.

## 6. Review without hindsight distortion

Preserve the information available at the time of the decision. Evaluate the decision using the ex-ante hypothesis and controls, then separately review what the outcome revealed. Distinguish a reasonable experiment with an unlucky outcome from a careless decision with a lucky outcome. Record near misses and successful tests that disprove a hypothesis, not only spectacular failures.

## 7. Whole-system and domain safeguards

This framework is subordinate to the [Global Optimization Guard](GLOBAL_OPTIMIZATION_GUARD.md) and the [Learning & Compounding Loop](LEARNING_AND_COMPOUNDING_LOOP.md).
- Faith commitments and user-defined non-negotiables are not test variables.
- Family safety, consent, and wellbeing cannot be sacrificed to generate learning.
- Business experiments must protect customers, employees, legal compliance, security, and trust.
- Life experiments must respect health and physical safety; high-stakes medical decisions require qualified professional guidance.
- In critical infrastructure or safety-critical contexts, use controlled simulations, staged tests, independent verification, and fail-safe design; do not treat real-world catastrophic failure as an acceptable learning method.

## 8. Required experiment review record

Store experiment ID, hypothesis, context, baseline, success/failure criteria, forecast, risk register, anticipated failures, safeguards, exposure cap, result, deviations, near misses, information gained, attribution confidence, lessons, corrective actions, next experiment, and approval status. Link it to the originating decision and later outcomes.
