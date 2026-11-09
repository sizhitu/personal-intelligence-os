# Personal Intelligence OS

**A Personal Decision & Intelligence System**

A private, evolving system for better decisions across faith, family, business, and life. It preserves personal context, decisions, methods, and outcomes while retrieving external knowledge on demand with provenance.

## Product principles
1. **Faith first:** user-defined faith commitments are the highest-level constraints. The system must not define or reinterpret them.
2. **Family second:** relationships, responsibilities, and long-term family wellbeing matter in decisions.
3. **Business / career third:** create sustainable value within faith commitments and family responsibilities.
4. **Life sustains the whole:** health, learning, growth, interests, time, and rest are foundations, not disposable leftovers.

These are ordered principles, not numeric weights. Surface conflicts and alternatives; never silently trade away a higher-priority commitment.

## Decision loop
Clarify the goal and constraints → decompose from first principles → select relevant mental models → gather evidence → compare options and trade-offs → decide → act → review outcomes → distinguish judgment, execution, and luck → propose methodology improvements for user approval.

## What it remembers
Confirmed values, goals, constraints, authorized domain context, decisions, assumptions, evidence references, actions, outcomes, reusable mental models, and versioned methods. External facts are normally fetched when needed rather than bulk-copied.

## Architecture
- `core/`: shared reasoning and decision capabilities
- `domains/`: faith, family, business, and life context
- `data/`: schemas and governance
- `frontend/`: conversation, decision workspace, and relationship graph
- `tests/`: behavior and privacy requirements

## Initial implementation direction
Python + FastAPI, PostgreSQL, and a lightweight web frontend. Keep model, search, and data providers behind replaceable adapters.

## Build strategy
Start with the smallest complete vertical slice: capture a goal, reason through a decision, record the user's choice, create an action, and review the outcome. Runtime services follow after the product charter and data boundaries are validated.

## Historical stress-test case library

The initial case set contains 12 U.S. equity / semiconductor drawdown events from the recent three-year window. Each record includes an event fact pattern, source link, holder and potential-beneficiary perspectives, model families, and illustrative adaptive factor weights. See [case library](cases/README.md), [event dataset](cases/events.json), [case template](cases/CASE_TEMPLATE.md), and [validation protocol](cases/VALIDATION_PROTOCOL.md).

**Important:** the current weights are retrospective research starting points, not actual historical actor weights or statistically calibrated parameters. Blind, as-known-at-the-time validation and sensitivity testing remain required before claiming the engine is validated.



## Cross-domain historical case library

The repository now includes a 16-case research seed across **faith, family, business, and life** (four cases per domain), with two stakeholder perspectives per case, model families, adaptive factor weights, conclusions, red-team counterarguments, and applicability limits. See [cross-domain case library](cross-domain/README.md), [structured dataset](cross-domain/events.json), [case template](cross-domain/CASE_TEMPLATE.md), and [validation protocol](cross-domain/VALIDATION_PROTOCOL.md).

These are structured research hypotheses, not completed blind tests or validated AI outputs. Faith commitments remain user-defined hard constraints; family safety and child welfare, business safety/legal/ethical constraints, and life safety are not ordinary weighted factors that can be traded away.

## Status\nFoundation, product charter, historical case benchmark, and a **local-first runnable decision workbench (v0.2)** are available. The workbench supports decision registration, adaptive factor-weight capture, experiment pre-registration, failure classification, review records, browser-local persistence, and JSON export/import. It is not yet a hosted multi-device database or AI reasoning backend. See [live prototype](https://sizhitu.github.io/personal-intelligence-os/) and [ROADMAP.md](ROADMAP.md).

## Whole-system optimization

The decision engine must guard against local suboptimization: a sequence of individually attractive steps can damage the whole system. Material decisions are checked across system boundaries, stakeholders, domains, time horizons, dependencies, externalities, feedback delays, path dependence, and second-order effects. Interdependent actions are compared as complete pathways, not merely isolated steps. Hard constraints precede weighted trade-offs. The aim is a robust, sustainable, value-aligned path—not a false claim that complex human decisions have one provable global optimum. See [Global Optimization Guard](GLOBAL_OPTIMIZATION_GUARD.md).


## Learning, positive feedback, and compounding

The system is designed to amplify verified mechanisms, not lucky outcomes. It records pre-action hypotheses and baselines, reviews actual whole-system results, separates judgment/execution/environment/luck, extracts mechanisms and boundary conditions, tests replication, and scales in reversible stages only after evidence gates. Reinforcing loops must have balancing controls, saturation checks, and rollback triggers. See [Learning & Compounding Loop](LEARNING_AND_COMPOUNDING_LOOP.md).


## Disciplined experimentation and intelligent failure

A failed experiment can be progress when it tests a clear hypothesis, stays within a bounded risk envelope, respects hard constraints, and changes what we know or do next. The system distinguishes informative failure from preventable and poorly designed failure. It celebrates honest learning and early detection—not damage or failure counts. See [Experimentation & Intelligent Failure](EXPERIMENTATION_AND_INTELLIGENT_FAILURE.md).
