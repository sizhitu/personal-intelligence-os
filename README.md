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

## Status
Foundation, product charter, and v0.1 historical case benchmark. See [ROADMAP.md](ROADMAP.md).
