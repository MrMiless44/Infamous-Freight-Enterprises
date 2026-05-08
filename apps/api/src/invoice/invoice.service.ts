import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export type InvoiceStatus = 'draft' | 'sent' | 'overdue' | 'paid' | 'disputed' | 'void';

export interface CreateInvoiceDto {
  loadId: string;
  carrierId: string;
  brokerName: string;
  brokerEmail: string;
  brokerAddress: string;
  loadAmount: number;
  fuelSurcharge?: number;
  lumperFee?: number;
  detentionFee?: number;
  tollFee?: number;
  accessorials?: Array<{ description: string; amount: number }>;
  notes?: string;
  dueDays?: number;
  terms?: string;
}

export interface Invoice {
  id: string;
  loadId: string;
  carrierId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  brokerName: string;
  brokerEmail: string;
  brokerAddress: string;
  lineItems: Array<{ description: string; quantity: number; rate: number; amount: number }>;
  subtotal: number;
  fuelSurcharge: number;
  accessorialsTotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes: string;
  terms: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  remindersSent: number;
  lastReminderDate?: Date;
  bolUrl?: string;
  podUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private invoices: Map<string, Invoice> = new Map(); // Replace with Prisma in production

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const invoiceNumber = this.generateInvoiceNumber(dto.carrierId);

    const accessorialsTotal = (dto.accessorials || []).reduce((sum, a) => sum + a.amount, 0);
    const fuelSurcharge = dto.fuelSurcharge || 0;
    const subtotal = dto.loadAmount;
    const total = subtotal + fuelSurcharge + accessorialsTotal + (dto.lumperFee || 0) + (dto.detentionFee || 0) + (dto.tollFee || 0);

    const dueDays = dto.dueDays || 30;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);

    const lineItems = [
      { description: 'Line Haul', quantity: 1, rate: dto.loadAmount, amount: dto.loadAmount },
    ];
    if (dto.lumperFee) lineItems.push({ description: 'Lumper Fee', quantity: 1, rate: dto.lumperFee, amount: dto.lumperFee });
    if (dto.detentionFee) lineItems.push({ description: 'Detention', quantity: 1, rate: dto.detentionFee, amount: dto.detentionFee });
    if (dto.tollFee) lineItems.push({ description: 'Tolls', quantity: 1, rate: dto.tollFee, amount: dto.tollFee });
    if (dto.accessorials) {
      dto.accessorials.forEach(a => lineItems.push({ description: a.description, quantity: 1, rate: a.amount, amount: a.amount }));
    }

    const invoice: Invoice = {
      id,
      loadId: dto.loadId,
      carrierId: dto.carrierId,
      invoiceNumber,
      status: 'draft',
      brokerName: dto.brokerName,
      brokerEmail: dto.brokerEmail,
      brokerAddress: dto.brokerAddress,
      lineItems,
      subtotal,
      fuelSurcharge,
      accessorialsTotal,
      total,
      amountPaid: 0,
      balanceDue: total,
      notes: dto.notes || '',
      terms: dto.terms || `Net ${dueDays}`,
      issueDate: new Date(),
      dueDate,
      remindersSent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invoices.set(id, invoice);
    this.logger.log(`Invoice ${invoiceNumber} created for load ${dto.loadId}`);

    // Auto-transition to 'sent' if configured
    // await this.markAsSent(id);

    return invoice;
  }

  async listInvoices(carrierId: string, status?: InvoiceStatus): Promise<Invoice[]> {
    const all = Array.from(this.invoices.values()).filter(inv => inv.carrierId === carrierId);
    return status ? all.filter(inv => inv.status === status) : all;
  }

  async getInvoice(id: string): Promise<Invoice> {
    const inv = this.invoices.get(id);
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async markAsSent(id: string): Promise<Invoice> {
    const inv = await this.getInvoice(id);
    inv.status = 'sent';
    inv.issueDate = new Date();
    inv.updatedAt = new Date();

    this.logger.warn(`Email delivery not configured — invoice ${inv.invoiceNumber} marked sent but not emailed to ${inv.brokerEmail}`);

    return inv;
  }

  async markAsPaid(id: string): Promise<Invoice> {
    const inv = await this.getInvoice(id);
    inv.status = 'paid';
    inv.paidDate = new Date();
    inv.amountPaid = inv.total;
    inv.balanceDue = 0;
    inv.updatedAt = new Date();

    this.logger.log(`Invoice ${inv.invoiceNumber} marked as paid`);
    return inv;
  }

  async sendReminder(id: string): Promise<Invoice> {
    const inv = await this.getInvoice(id);
    if (inv.status === 'paid') return inv;

    inv.remindersSent += 1;
    inv.lastReminderDate = new Date();

    // Auto-mark overdue if past due date
    if (new Date() > inv.dueDate && inv.status !== 'overdue') {
      inv.status = 'overdue';
    }

    this.logger.warn(`Email delivery not configured — reminder #${inv.remindersSent} for invoice ${inv.invoiceNumber} logged only`);

    return inv;
  }

  async generatePdf(id: string): Promise<{ url: string }> {
    const inv = await this.getInvoice(id);
    // In production: generate actual PDF with pdf-lib or puppeteer
    const mockUrl = `/invoices/${id}/download.pdf`;
    this.logger.log(`PDF generated for invoice ${inv.invoiceNumber}`);
    return { url: mockUrl };
  }

  // Auto-generate invoice when POD is uploaded
  async autoGenerateFromDelivery(loadId: string, carrierId: string, loadData: {
    brokerName: string;
    brokerEmail: string;
    brokerAddress: string;
    rate: number;
    fuelSurcharge?: number;
  }): Promise<Invoice> {
    const invoice = await this.createInvoice({
      loadId,
      carrierId,
      ...loadData,
      loadAmount: loadData.rate,
    });

    // Mark as sent immediately upon POD upload
    await this.markAsSent(invoice.id);

    this.logger.log(`Auto-invoice generated for delivered load ${loadId}`);
    return invoice;
  }

  // Aging report: how much is outstanding and for how long
  async getAgingReport(carrierId: string): Promise<{
    current: number;
    days1to30: number;
    days31to60: number;
    days61to90: number;
    over90: number;
    totalOutstanding: number;
  }> {
    const invoices = await this.listInvoices(carrierId);
    const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
    const now = Date.now();

    const report = { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, totalOutstanding: 0 };

    for (const inv of outstanding) {
      const daysOverdue = Math.floor((now - inv.dueDate.getTime()) / 86400000);
      if (daysOverdue <= 0) report.current += inv.balanceDue;
      else if (daysOverdue <= 30) report.days1to30 += inv.balanceDue;
      else if (daysOverdue <= 60) report.days31to60 += inv.balanceDue;
      else if (daysOverdue <= 90) report.days61to90 += inv.balanceDue;
      else report.over90 += inv.balanceDue;
      report.totalOutstanding += inv.balanceDue;
    }

    return report;
  }

  async syncToQuickBooks(invoiceId: string): Promise<{ quickBooksId: string }> {
    this.logger.warn(`QuickBooks sync not configured — invoice ${invoiceId} not synced`);
    throw new Error('QuickBooks integration is not yet configured. Set QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET to enable.');
  }

  private generateInvoiceNumber(carrierId: string): string {
    const prefix = 'INF';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${prefix}-${date}-${seq}`;
  }
}
