<p align="center">
  <a href="https://infamousfreight.com" target="_blank" rel="noopener noreferrer">
    <img src="/docs/screenshots/infamousfreight-header.svg" alt="Infamous Freight" width="100%">
  </a>
</p>

# Production Operations Package

This package is GitHub-native and excludes Wix.

It contains operations, compliance, dispatch, carrier, sales, launch readiness, and repository execution documentation for Infamous Freight.

## Core Documents

- [Operating Model](OPERATING_MODEL.md)
- [Launch Checklist](LAUNCH_CHECKLIST.md)
- [Compliance Checklist](COMPLIANCE_CHECKLIST.md)
- [Carrier Vetting SOP](CARRIER_VETTING_SOP.md)
- [Dispatch Workflow](DISPATCH_WORKFLOW.md)
- [Daily Operations SOP](DAILY_OPERATIONS_SOP.md)
- [Shipper Sales Script](SHIPPER_SALES_SCRIPT.md)
- [GitHub Execution Backlog](GITHUB_EXECUTION_BACKLOG.md)
- [GitHub-Native MVP Build Plan](GITHUB_NATIVE_MVP_BUILD_PLAN.md)
- [MVP Technical Implementation Spec](MVP_TECHNICAL_IMPLEMENTATION_SPEC.md)
- [MVP Existing Architecture Alignment](MVP_EXISTING_ARCHITECTURE_ALIGNMENT.md)
- [Production Readiness Evidence](PRODUCTION_READINESS_EVIDENCE.md)

## Build Priority

Build the MVP operating loop first:

```text
Quote Request -> Quote Review -> Load Creation -> Carrier Assignment -> Dispatch -> Tracking -> POD Upload -> Invoice
```

Do not prioritize advanced automation until the core freight lifecycle works end to end.

## Architecture Rule

Extend the existing Express API and Prisma models before creating new backend patterns. Use the MVP architecture alignment document to avoid duplicate domain models and conflicting workflows.

## Launch Rule

Production readiness remains blocked until the evidence log is completed and the related launch-readiness issues are verified.
