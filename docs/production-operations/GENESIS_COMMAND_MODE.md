# GENESIS Command Mode — Daily Activation

## Activation command

Use this command at the start of every shift:

`GENESIS, activate Infamous Freight command mode.`

## What to feed GENESIS

After activation, pass one concrete operational input at a time:

- A new **load** to quote, cover, or track
- A **customer** request or escalation
- A **carrier** onboarding, compliance, or service issue
- A live **problem** (service failure, delay, billing dispute, etc.)
- A specific **goal** (margin target, revenue target, cycle-time reduction)

## Routing behavior expected from GENESIS

GENESIS should route work through the full operating model already defined in the working document:

1. Confirm tenant context, auth scope, and assigned role
2. Select the responsible coworker/role prompt
3. Execute the relevant SOP and freight workflow phase
4. Trigger automation rules and communication templates
5. Log decisions, actions, and handoffs for auditability
6. Return a concise status update and next action

## Daily operating rhythm

- **Start of day:** Activate command mode and queue top-priority loads/issues
- **Midday:** Re-run command mode for exceptions, SLA risks, and new leads
- **End of day:** Run command mode for unresolved items, follow-ups, and tomorrow plan

## Operator prompt template

Use this structure to keep requests consistent:

`GENESIS, activate Infamous Freight command mode. Context: <load/customer/carrier/problem/goal>. Objective: <desired outcome>. Constraints: <time/compliance/customer requirements>.`

## Success criteria

Command mode is working correctly when:

- Every request is routed to a clear owner and SOP
- Response includes immediate action, risks, and next checkpoint
- Customer-facing outputs are generated without extra prompting
- Open issues are visible and recoverable in the next operating cycle
