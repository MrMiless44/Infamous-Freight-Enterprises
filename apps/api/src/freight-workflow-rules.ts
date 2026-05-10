export type QuoteLike = {
  status?: unknown;
} & Record<string, unknown>;

export type StatusLike = {
  status?: unknown;
} & Record<string, unknown>;

export class FreightWorkflowRuleError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const LOAD_ASSIGNMENT_TERMINAL: ReadonlySet<string> = new Set(['accepted', 'rejected']);

const DISPATCH_TERMINAL: ReadonlySet<string> = new Set(['confirmed', 'cancelled']);

const TRACKING_TERMINAL: ReadonlySet<string> = new Set(['delivered']);

const CARRIER_PAYMENT_TERMINAL: ReadonlySet<string> = new Set(['paid', 'refunded']);

const LOAD_BOARD_POST_TERMINAL: ReadonlySet<string> = new Set(['expired', 'closed', 'awarded']);

export function assertQuoteCanConvertToLoad(quoteRequest: QuoteLike): void {
  if (quoteRequest.status !== 'approved') {
    throw new FreightWorkflowRuleError(
      'quote_request_not_approved',
      'Quote request must be approved before it can be converted into a load.',
    );
  }
}

export function assertAssignmentCanTransition(assignment: StatusLike, decision: string): void {
  const current = typeof assignment.status === 'string' ? assignment.status : '';
  if (LOAD_ASSIGNMENT_TERMINAL.has(current)) {
    throw new FreightWorkflowRuleError(
      'assignment_already_resolved',
      `Load assignment is already ${current} and cannot be changed to ${decision}.`,
    );
  }
}

export function assertDispatchCanConfirm(dispatch: StatusLike): void {
  const current = typeof dispatch.status === 'string' ? dispatch.status : '';
  if (DISPATCH_TERMINAL.has(current)) {
    throw new FreightWorkflowRuleError(
      'dispatch_already_terminal',
      `Dispatch is already ${current} and cannot be confirmed again.`,
    );
  }
}

export function assertLoadCanReceiveTracking(latestTracking: StatusLike | null): void {
  if (!latestTracking) return;
  const current = typeof latestTracking.status === 'string' ? latestTracking.status : '';
  if (TRACKING_TERMINAL.has(current)) {
    throw new FreightWorkflowRuleError(
      'load_already_delivered',
      'Cannot add tracking updates after delivery has been recorded.',
    );
  }
}

export function assertPaymentCanTransition(payment: StatusLike): void {
  const current = typeof payment.status === 'string' ? payment.status : '';
  if (CARRIER_PAYMENT_TERMINAL.has(current)) {
    throw new FreightWorkflowRuleError(
      'payment_already_terminal',
      `Carrier payment is already ${current} and cannot be updated.`,
    );
  }
}

export function assertLoadBoardPostCanTransition(post: StatusLike): void {
  const current = typeof post.status === 'string' ? post.status : '';
  if (LOAD_BOARD_POST_TERMINAL.has(current)) {
    throw new FreightWorkflowRuleError(
      'post_already_terminal',
      `Load board post is already ${current} and cannot be updated.`,
    );
  }
}
