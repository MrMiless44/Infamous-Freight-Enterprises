import { Injectable, Logger } from '@nestjs/common';

export type DocumentType =
  | 'auto_liability_insurance'
  | 'cargo_insurance'
  | 'general_liability_insurance'
  | 'physical_damage_insurance'
  | 'workers_compensation'
  | 'mc_authority'
  | 'dot_physical'
  | 'cdl_license'
  | 'hazmat_endorsement'
  | 'twic_card'
  | 'vehicle_registration'
  | 'ifta_license'
  | 'uirp_permit'
  | 'new_mexico_permit'
  | 'oregon_permit'
  | 'kentucky_permit'
  | 'ny_hut_permit'
  | 'ifta_decals'
  | 'ssrs_permit';

export interface ComplianceDocument {
  id: string;
  carrierId?: string;
  driverId?: string;
  vehicleId?: string;
  type: DocumentType;
  typeLabel: string;
  documentNumber: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending_renewal';
  documentUrl?: string;
  notes?: string;
  daysUntilExpiry: number;
}

export interface ExpiryAlert {
  document: ComplianceDocument;
  alertLevel: 'info' | 'warning' | 'critical';
  daysRemaining: number;
  message: string;
  actionRequired: string;
  blocksDispatch: boolean;
}

@Injectable()
export class ComplianceExpiryService {
  private readonly logger = new Logger(ComplianceExpiryService.name);
  private documents: Map<string, ComplianceDocument> = new Map();

  async addDocument(doc: Omit<ComplianceDocument, 'id' | 'daysUntilExpiry' | 'status'>): Promise<ComplianceDocument> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const daysUntilExpiry = Math.ceil((doc.expiryDate.getTime() - Date.now()) / 86400000);

    let status: ComplianceDocument['status'] = 'active';
    if (daysUntilExpiry <= 0) status = 'expired';
    else if (daysUntilExpiry <= 30) status = 'expiring_soon';

    const fullDoc: ComplianceDocument = { ...doc, id, daysUntilExpiry, status };
    this.documents.set(id, fullDoc);
    this.logger.log(`Document added: ${doc.typeLabel} expires in ${daysUntilExpiry} days`);
    return fullDoc;
  }

  async getDocuments(carrierId: string): Promise<ComplianceDocument[]> {
    return Array.from(this.documents.values())
      .filter(d => d.carrierId === carrierId)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  async getExpiringDocuments(carrierId: string, days: number = 30): Promise<ComplianceDocument[]> {
    return (await this.getDocuments(carrierId)).filter(d => d.daysUntilExpiry <= days);
  }

  async checkAllAlerts(carrierId: string): Promise<ExpiryAlert[]> {
    const docs = await this.getDocuments(carrierId);
    const alerts: ExpiryAlert[] = [];

    for (const doc of docs) {
      if (doc.daysUntilExpiry <= 0) {
        alerts.push({
          document: doc,
          alertLevel: 'critical',
          daysRemaining: doc.daysUntilExpiry,
          message: `${doc.typeLabel} has EXPIRED (${doc.documentNumber})`,
          actionRequired: 'Renew immediately. Dispatch may be blocked.',
          blocksDispatch: this.blocksDispatch(doc.type),
        });
      } else if (doc.daysUntilExpiry <= 7) {
        alerts.push({
          document: doc,
          alertLevel: 'critical',
          daysRemaining: doc.daysUntilExpiry,
          message: `${doc.typeLabel} expires in ${doc.daysUntilExpiry} days`,
          actionRequired: 'Renew within 48 hours.',
          blocksDispatch: false,
        });
      } else if (doc.daysUntilExpiry <= 15) {
        alerts.push({
          document: doc,
          alertLevel: 'warning',
          daysRemaining: doc.daysUntilExpiry,
          message: `${doc.typeLabel} expires in ${doc.daysUntilExpiry} days`,
          actionRequired: 'Schedule renewal appointment.',
          blocksDispatch: false,
        });
      } else if (doc.daysUntilExpiry <= 30) {
        alerts.push({
          document: doc,
          alertLevel: 'info',
          daysRemaining: doc.daysUntilExpiry,
          message: `${doc.typeLabel} expires in ${doc.daysUntilExpiry} days`,
          actionRequired: 'Begin renewal process.',
          blocksDispatch: false,
        });
      }
    }

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  async canDispatch(carrierId: string): Promise<{
    canDispatch: boolean;
    blockingReasons: string[];
  }> {
    const alerts = await this.checkAllAlerts(carrierId);
    const blocking = alerts.filter(a => a.blocksDispatch);

    return {
      canDispatch: blocking.length === 0,
      blockingReasons: blocking.map(a => a.message),
    };
  }

  async getBrokerVerificationLink(carrierId: string): Promise<{
    url: string;
    insuranceStatus: 'active' | 'expired' | 'expiring_soon';
    coverages: Array<{ type: string; amount: number; expiryDate: Date }>;
  }> {
    const docs = await this.getDocuments(carrierId);
    const insuranceDocs = docs.filter(d =>
      d.type.includes('insurance') || d.type === 'cargo_insurance',
    );

    let insuranceStatus: 'active' | 'expired' | 'expiring_soon' = 'active';
    const expired = insuranceDocs.filter(d => d.status === 'expired');
    const expiring = insuranceDocs.filter(d => d.status === 'expiring_soon');

    if (expired.length > 0) insuranceStatus = 'expired';
    else if (expiring.length > 0) insuranceStatus = 'expiring_soon';

    const coverages = insuranceDocs.map(d => ({
      type: d.typeLabel,
      amount: 1000000, // Parse from notes in production
      expiryDate: d.expiryDate,
    }));

    return {
      url: `https://infamousfreight.com/verify/${carrierId}`,
      insuranceStatus,
      coverages,
    };
  }

  async getComplianceDashboard(carrierId: string): Promise<{
    totalDocuments: number;
    active: number;
    expiringSoon: number;
    expired: number;
    criticalAlerts: number;
    canDispatch: boolean;
    upcomingRenewals: ComplianceDocument[];
    alertTimeline: Array<{ date: Date; alerts: number }>;
  }> {
    const docs = await this.getDocuments(carrierId);
    const alerts = await this.checkAllAlerts(carrierId);
    const dispatchCheck = await this.canDispatch(carrierId);

    // Build alert timeline for next 90 days
    const timeline: Array<{ date: Date; alerts: number }> = [];
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toDateString();
      const count = docs.filter(d => {
        const expiry = new Date(d.expiryDate);
        return expiry.toDateString() === dateStr;
      }).length;
      if (count > 0) {
        timeline.push({ date, alerts: count });
      }
    }

    return {
      totalDocuments: docs.length,
      active: docs.filter(d => d.status === 'active').length,
      expiringSoon: docs.filter(d => d.status === 'expiring_soon').length,
      expired: docs.filter(d => d.status === 'expired').length,
      criticalAlerts: alerts.filter(a => a.alertLevel === 'critical').length,
      canDispatch: dispatchCheck.canDispatch,
      upcomingRenewals: docs.filter(d => d.daysUntilExpiry <= 30 && d.daysUntilExpiry > 0).slice(0, 10),
      alertTimeline: timeline,
    };
  }

  // Auto-sync with insurance providers
  async syncInsurance(carrierId: string, provider: 'progressive' | 'northland' | 'sentry'): Promise<void> {
    this.logger.warn(`Insurance provider API (${provider}) not configured — sync for ${carrierId} skipped`);
  }

  private blocksDispatch(type: DocumentType): boolean {
    const blockingTypes: DocumentType[] = [
      'auto_liability_insurance',
      'cargo_insurance',
      'mc_authority',
      'cdl_license',
      'dot_physical',
    ];
    return blockingTypes.includes(type);
  }
}
