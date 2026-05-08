import { Injectable, Logger } from '@nestjs/common';

export type FactoringCompany = 'rts' | 'otr' | 'apex' | 'bluevine' | 'eCapital';

export interface FactoringSetup {
  carrierId: string;
  factoringCompany: FactoringCompany;
  accountNumber: string;
  advanceRate: number; // e.g., 95% = 0.95
  feePercent: number; // e.g., 2% = 0.02
  recourse: boolean;
  maxInvoiceAmount: number;
  notificationMethod: 'email' | 'api' | 'upload';
  apiKey?: string;
  notificationEmail?: string;
  isActive: boolean;
}

export interface FactoredInvoice {
  invoiceId: string;
  loadId: string;
  brokerName: string;
  invoiceAmount: number;
  advanceAmount: number; // invoiceAmount * advanceRate
  feeAmount: number; // invoiceAmount * feePercent
  reserveAmount: number; // held back
  status: 'pending' | 'submitted' | 'funded' | 'paid' | 'charged_back';
  submittedAt?: Date;
  fundedAt?: Date;
  paidAt?: Date;
  reserveReleasedAt?: Date;
  factoringReference?: string;
}

@Injectable()
export class FactoringService {
  private readonly logger = new Logger(FactoringService.name);
  private setups: Map<string, FactoringSetup> = new Map();
  private factoredInvoices: Map<string, FactoredInvoice> = new Map();

  async setupFactoring(setup: FactoringSetup): Promise<FactoringSetup> {
    this.setups.set(setup.carrierId, setup);
    this.logger.log(`Factoring setup: ${setup.carrierId} → ${setup.factoringCompany} @ ${setup.feePercent}%`);
    return setup;
  }

  async getSetup(carrierId: string): Promise<FactoringSetup | null> {
    return this.setups.get(carrierId) || null;
  }

  async factorInvoice(carrierId: string, invoiceData: {
    invoiceId: string;
    loadId: string;
    brokerName: string;
    invoiceAmount: number;
  }): Promise<FactoredInvoice> {
    const setup = await this.getSetup(carrierId);
    if (!setup || !setup.isActive) {
      throw new Error('No active factoring setup found');
    }

    const advanceAmount = invoiceData.invoiceAmount * setup.advanceRate;
    const feeAmount = invoiceData.invoiceAmount * setup.feePercent;
    const reserveAmount = invoiceData.invoiceAmount - advanceAmount - feeAmount;

    const factored: FactoredInvoice = {
      invoiceId: invoiceData.invoiceId,
      loadId: invoiceData.loadId,
      brokerName: invoiceData.brokerName,
      invoiceAmount: invoiceData.invoiceAmount,
      advanceAmount: Math.round(advanceAmount * 100) / 100,
      feeAmount: Math.round(feeAmount * 100) / 100,
      reserveAmount: Math.round(reserveAmount * 100) / 100,
      status: 'pending',
    };

    this.factoredInvoices.set(invoiceData.invoiceId, factored);

    // Auto-submit if configured
    if (setup.notificationMethod === 'api' && setup.apiKey) {
      await this.submitToFactor(factored, setup);
    }

    this.logger.log(`Invoice ${invoiceData.invoiceId} factored: $${advanceAmount} advance, $${feeAmount} fee`);
    return factored;
  }

  async submitToFactor(invoice: FactoredInvoice, setup: FactoringSetup): Promise<void> {
    switch (setup.factoringCompany) {
      case 'rts':
        await this.submitToRTS(invoice, setup);
        break;
      case 'otr':
        await this.submitToOTR(invoice, setup);
        break;
      case 'apex':
        await this.submitToApex(invoice, setup);
        break;
      case 'bluevine':
        await this.submitToBluevine(invoice, setup);
        break;
      case 'eCapital':
        await this.submitToECapital(invoice, setup);
        break;
    }

    invoice.status = 'submitted';
    invoice.submittedAt = new Date();
  }

  async markAsFunded(invoiceId: string, reference: string): Promise<void> {
    const invoice = this.factoredInvoices.get(invoiceId);
    if (!invoice) return;
    invoice.status = 'funded';
    invoice.fundedAt = new Date();
    invoice.factoringReference = reference;
    this.logger.log(`Invoice ${invoiceId} funded: ${reference}`);
  }

  async markAsPaid(invoiceId: string): Promise<void> {
    const invoice = this.factoredInvoices.get(invoiceId);
    if (!invoice) return;
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    this.logger.log(`Invoice ${invoiceId} paid by broker`);
  }

  async releaseReserve(invoiceId: string): Promise<void> {
    const invoice = this.factoredInvoices.get(invoiceId);
    if (!invoice) return;
    invoice.reserveReleasedAt = new Date();
    this.logger.log(`Reserve released for invoice ${invoiceId}: $${invoice.reserveAmount}`);
  }

  async getFactoredInvoices(carrierId: string): Promise<FactoredInvoice[]> {
    // In production: query by carrierId from database
    return Array.from(this.factoredInvoices.values());
  }

  async getFactoredInvoice(invoiceId: string): Promise<FactoredInvoice | null> {
    return this.factoredInvoices.get(invoiceId) || null;
  }

  // Cost comparison across factors
  async compareFactors(invoiceAmount: number): Promise<Array<{
    company: FactoringCompany;
    name: string;
    advance: number;
    fee: number;
    reserve: number;
    speed: string;
  }>> {
    return [
      { company: 'rts', name: 'RTS Financial', advance: invoiceAmount * 0.97, fee: invoiceAmount * 0.03, reserve: invoiceAmount * 0.00, speed: 'Same day' },
      { company: 'otr', name: 'OTR Capital', advance: invoiceAmount * 0.95, fee: invoiceAmount * 0.02, reserve: invoiceAmount * 0.03, speed: '24 hours' },
      { company: 'apex', name: 'Apex Capital', advance: invoiceAmount * 0.98, fee: invoiceAmount * 0.025, reserve: invoiceAmount * 0.00, speed: 'Same day' },
      { company: 'bluevine', name: 'Bluevine', advance: invoiceAmount * 0.90, fee: invoiceAmount * 0.01, reserve: invoiceAmount * 0.09, speed: '24 hours' },
      { company: 'eCapital', name: 'eCapital', advance: invoiceAmount * 0.96, fee: invoiceAmount * 0.035, reserve: invoiceAmount * 0.005, speed: 'Same day' },
    ];
  }

  private async submitToRTS(invoice: FactoredInvoice, setup: FactoringSetup): Promise<void> {
    this.logger.warn(`RTS Financial API not configured — invoice ${invoice.invoiceId} (account: ${setup.accountNumber}) logged only`);
    throw new Error('RTS Financial integration is not yet configured. Contact support to enable factoring.');
  }

  private async submitToOTR(invoice: FactoredInvoice, setup: FactoringSetup): Promise<void> {
    this.logger.warn(`OTR Capital API not configured — invoice ${invoice.invoiceId} (account: ${setup.accountNumber}) logged only`);
    throw new Error('OTR Capital integration is not yet configured. Contact support to enable factoring.');
  }

  private async submitToApex(invoice: FactoredInvoice, setup: FactoringSetup): Promise<void> {
    this.logger.warn(`Apex Capital API not configured — invoice ${invoice.invoiceId} (account: ${setup.accountNumber}) logged only`);
    throw new Error('Apex Capital integration is not yet configured. Contact support to enable factoring.');
  }

  private async submitToBluevine(invoice: FactoredInvoice, setup: FactoringSetup): Promise<void> {
    this.logger.warn(`Bluevine API not configured — invoice ${invoice.invoiceId} (account: ${setup.accountNumber}) logged only`);
    throw new Error('Bluevine integration is not yet configured. Contact support to enable factoring.');
  }

  private async submitToECapital(invoice: FactoredInvoice, setup: FactoringSetup): Promise<void> {
    this.logger.warn(`eCapital API not configured — invoice ${invoice.invoiceId} (account: ${setup.accountNumber}) logged only`);
    throw new Error('eCapital integration is not yet configured. Contact support to enable factoring.');
  }
}
