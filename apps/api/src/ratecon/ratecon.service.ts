import { Injectable, Logger } from '@nestjs/common';

export interface RateConData {
  loadId: string;
  rateConNumber: string;
  carrierName: string;
  carrierMC: string;
  carrierDOT: string;
  carrierPhone: string;
  carrierEmail: string;
  carrierAddress: string;
  brokerName: string;
  brokerMC: string;
  brokerPhone: string;
  brokerEmail: string;
  brokerAddress: string;
  shipperName: string;
  shipperAddress: string;
  shipperPhone?: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone?: string;
  originCity: string;
  originState: string;
  originZip: string;
  destCity: string;
  destState: string;
  destZip: string;
  pickupDate: Date;
  pickupTimeWindow: string;
  deliveryDate: Date;
  deliveryTimeWindow: string;
  rate: number;
  ratePerMile: number;
  distance: number;
  equipmentType: string;
  weight: number;
  hazmat: boolean;
  tarpRequired: boolean;
  teamRequired: boolean;
  lumpersOk: boolean;
  detentionFreeHours: number;
  detentionRate: number;
  notes?: string;
  commodity?: string;
  referenceNumbers?: Array<{ label: string; value: string }>;
  generatedAt: Date;
  driverName?: string;
  driverPhone?: string;
  truckNumber?: string;
  trailerNumber?: string;
}

export interface RateConTemplate {
  id: string;
  carrierId: string;
  name: string;
  headerText?: string;
  footerText?: string;
  termsConditions: string[];
  showInsurance: boolean;
  logoUrl?: string;
}

@Injectable()
export class RateConService {
  private readonly logger = new Logger(RateConService.name);
  private templates: Map<string, RateConTemplate> = new Map();

  constructor() {
    this.seedDefaultTemplate();
  }

  async generateRateCon(data: RateConData, templateId?: string): Promise<{ html: string; pdfUrl: string }> {
    const template = templateId ? this.templates.get(templateId) : this.templates.get('default');
    const html = this.buildHtml(data, template);
    const pdfUrl = `/documents/ratecons/${data.rateConNumber}.pdf`;

    this.logger.log(`Rate con ${data.rateConNumber} generated for load ${data.loadId}`);

    return { html, pdfUrl };
  }

  async emailToBroker(data: RateConData, brokerEmail: string, templateId?: string): Promise<{ sent: boolean; messageId?: string }> {
    const { html } = await this.generateRateCon(data, templateId);

    this.logger.warn(`Email delivery not configured — rate con ${data.rateConNumber} for ${brokerEmail} logged only`);

    return { sent: false };
  }

  async createTemplate(template: Omit<RateConTemplate, 'id'>): Promise<RateConTemplate> {
    const id = `template_${Date.now()}`;
    const full: RateConTemplate = { ...template, id };
    this.templates.set(id, full);
    return full;
  }

  async getTemplates(carrierId: string): Promise<RateConTemplate[]> {
    return Array.from(this.templates.values()).filter(t => t.carrierId === carrierId);
  }

  private buildHtml(data: RateConData, template?: RateConTemplate | null): string {
    const terms = template?.termsConditions || [
      'Payment terms: Net 30 days from delivery date.',
      'Detention: Free for first 2 hours, $50/hour thereafter.',
      'Driver must call 2 hours before pickup and delivery.',
      'All accessorial charges must be approved in writing before service.',
      'Carrier is responsible for cargo from pickup until signed delivery receipt.',
    ];

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rate Confirmation - ${data.rateConNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #222; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #ff3d00; padding-bottom: 20px; margin-bottom: 20px; }
  .header h1 { font-size: 28px; color: #ff3d00; font-weight: 800; letter-spacing: -0.5px; }
  .rate-con-number { background: #ff3d00; color: white; padding: 8px 16px; border-radius: 6px; font-size: 16px; font-weight: 700; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #ff3d00; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 10px; }
  .grid { display: flex; gap: 30px; }
  .grid-col { flex: 1; }
  .field { margin-bottom: 6px; }
  .field-label { font-size: 10px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; }
  .field-value { font-size: 12px; font-weight: 600; color: #111; }
  .rate-box { background: #f8f8f8; border: 2px solid #ff3d00; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
  .rate-box .amount { font-size: 36px; font-weight: 800; color: #111; }
  .rate-box .label { font-size: 11px; color: #666; margin-top: 4px; }
  .route-bar { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 20px; background: #fafafa; border-radius: 8px; margin: 15px 0; }
  .route-origin, .route-dest { text-align: center; }
  .route-city { font-size: 16px; font-weight: 700; }
  .route-state { font-size: 12px; color: #666; }
  .route-arrow { font-size: 24px; color: #ff3d00; }
  .terms { font-size: 10px; color: #555; padding: 15px; background: #fafafa; border-radius: 6px; }
  .terms li { margin-bottom: 4px; margin-left: 16px; }
  .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #888; text-align: center; }
  .signature-row { display: flex; gap: 60px; margin-top: 30px; }
  .signature-line { border-top: 1px solid #333; padding-top: 4px; width: 250px; font-size: 11px; color: #555; }
  .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .badge-hazmat { background: #fff3e0; color: #e65100; }
  .badge-tarp { background: #e3f2fd; color: #1565c0; }
  .badge-team { background: #f3e5f5; color: #7b1fa2; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; color: #666; border-bottom: 2px solid #ddd; }
  td { padding: 8px; font-size: 11px; border-bottom: 1px solid #eee; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>INFAMOUS FREIGHT</h1>
      ${template?.headerText ? `<p style="color:#666;margin-top:4px;">${template.headerText}</p>` : ''}
    </div>
    <div class="rate-con-number">RATE CON: ${data.rateConNumber}</div>
  </div>

  <div class="grid">
    <div class="grid-col">
      <div class="section">
        <div class="section-title">Carrier</div>
        <div class="field"><div class="field-label">Company</div><div class="field-value">${data.carrierName}</div></div>
        <div class="field"><div class="field-label">MC #</div><div class="field-value">${data.carrierMC}</div></div>
        <div class="field"><div class="field-label">DOT #</div><div class="field-value">${data.carrierDOT}</div></div>
        <div class="field"><div class="field-label">Phone</div><div class="field-value">${data.carrierPhone}</div></div>
        <div class="field"><div class="field-label">Email</div><div class="field-value">${data.carrierEmail}</div></div>
        <div class="field"><div class="field-label">Address</div><div class="field-value">${data.carrierAddress}</div></div>
      </div>
    </div>
    <div class="grid-col">
      <div class="section">
        <div class="section-title">Broker</div>
        <div class="field"><div class="field-label">Company</div><div class="field-value">${data.brokerName}</div></div>
        <div class="field"><div class="field-label">MC #</div><div class="field-value">${data.brokerMC}</div></div>
        <div class="field"><div class="field-label">Phone</div><div class="field-value">${data.brokerPhone}</div></div>
        <div class="field"><div class="field-label">Email</div><div class="field-value">${data.brokerEmail}</div></div>
        <div class="field"><div class="field-label">Address</div><div class="field-value">${data.brokerAddress}</div></div>
      </div>
    </div>
  </div>

  <div class="route-bar">
    <div class="route-origin">
      <div class="route-city">${data.originCity}</div>
      <div class="route-state">${data.originState} ${data.originZip}</div>
    </div>
    <div class="route-arrow">→</div>
    <div class="route-dest">
      <div class="route-city">${data.destCity}</div>
      <div class="route-state">${data.destState} ${data.destZip}</div>
    </div>
    <div style="margin-left:30px;text-align:center;">
      <div style="font-size:20px;font-weight:700;">${data.distance} mi</div>
      <div style="font-size:10px;color:#666;">${data.equipmentType}</div>
    </div>
  </div>

  <div class="grid">
    <div class="grid-col">
      <div class="section">
        <div class="section-title">Pickup</div>
        <div class="field"><div class="field-label">Shipper</div><div class="field-value">${data.shipperName}</div></div>
        <div class="field"><div class="field-label">Address</div><div class="field-value">${data.shipperAddress}</div></div>
        <div class="field"><div class="field-label">Date</div><div class="field-value">${data.pickupDate.toLocaleDateString()}</div></div>
        <div class="field"><div class="field-label">Time</div><div class="field-value">${data.pickupTimeWindow}</div></div>
      </div>
    </div>
    <div class="grid-col">
      <div class="section">
        <div class="section-title">Delivery</div>
        <div class="field"><div class="field-label">Receiver</div><div class="field-value">${data.receiverName}</div></div>
        <div class="field"><div class="field-label">Address</div><div class="field-value">${data.receiverAddress}</div></div>
        <div class="field"><div class="field-label">Date</div><div class="field-value">${data.deliveryDate.toLocaleDateString()}</div></div>
        <div class="field"><div class="field-label">Time</div><div class="field-value">${data.deliveryTimeWindow}</div></div>
      </div>
    </div>
  </div>

  <div class="rate-box">
    <div class="amount">$${data.rate.toLocaleString()}</div>
    <div class="label">$${data.ratePerMile.toFixed(2)} / mile · ${data.distance} miles · ${data.weight.toLocaleString()} lbs</div>
  </div>

  <div class="grid">
    <div class="grid-col">
      <div class="section">
        <div class="section-title">Load Details</div>
        <table>
          <tr><td>Commodity</td><td><strong>${data.commodity || 'General Freight'}</strong></td></tr>
          <tr><td>Weight</td><td>${data.weight.toLocaleString()} lbs</td></tr>
          <tr><td>Hazmat</td><td>${data.hazmat ? '<span class="badge badge-hazmat">YES</span>' : 'No'}</td></tr>
          <tr><td>Tarp Required</td><td>${data.tarpRequired ? '<span class="badge badge-tarp">YES</span>' : 'No'}</td></tr>
          <tr><td>Team Required</td><td>${data.teamRequired ? '<span class="badge badge-team">YES</span>' : 'No'}</td></tr>
          <tr><td>Detention Free</td><td>${data.detentionFreeHours} hrs @ $${data.detentionRate}/hr</td></tr>
        </table>
      </div>
    </div>
    <div class="grid-col">
      <div class="section">
        <div class="section-title">Reference Numbers</div>
        <table>
          ${(data.referenceNumbers || []).map(ref => `<tr><td>${ref.label}</td><td><strong>${ref.value}</strong></td></tr>`).join('')}
          ${(!data.referenceNumbers?.length) ? '<tr><td colspan="2">No reference numbers provided</td></tr>' : ''}
        </table>
      </div>
      ${data.driverName ? `
      <div class="section" style="margin-top:15px;">
        <div class="section-title">Assigned Driver</div>
        <div class="field"><div class="field-value">${data.driverName} · ${data.driverPhone || ''}</div></div>
        ${data.truckNumber ? `<div class="field"><div class="field-label">Truck</div><div class="field-value">${data.truckNumber}</div></div>` : ''}
        ${data.trailerNumber ? `<div class="field"><div class="field-label">Trailer</div><div class="field-value">${data.trailerNumber}</div></div>` : ''}
      </div>` : ''}
    </div>
  </div>

  ${data.notes ? `
  <div class="section">
    <div class="section-title">Special Instructions</div>
    <div style="padding:12px;background:#fff8e1;border-radius:6px;font-size:11px;">${data.notes}</div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Terms & Conditions</div>
    <ol class="terms">
      ${terms.map(t => `<li>${t}</li>`).join('')}
    </ol>
  </div>

  <div class="signature-row">
    <div>
      <div class="signature-line">Carrier Signature & Date</div>
    </div>
    <div>
      <div class="signature-line">Broker Signature & Date</div>
    </div>
  </div>

  <div class="footer">
    Generated by Infamous Freight on ${data.generatedAt.toLocaleString()} · This rate confirmation constitutes a legally binding agreement between carrier and broker.
    ${template?.footerText ? `<br>${template.footerText}` : ''}
  </div>
</body>
</html>`;
  }

  private seedDefaultTemplate(): void {
    this.templates.set('default', {
      id: 'default',
      carrierId: 'default',
      name: 'Default Template',
      termsConditions: [
        'Payment terms: Net 30 days from delivery date.',
        'Detention: Free for first 2 hours, $50/hour thereafter.',
        'Driver must call 2 hours before pickup and delivery.',
        'All accessorial charges must be approved in writing before service.',
        'Carrier is responsible for cargo from pickup until signed delivery receipt.',
        'No double-brokering without written consent.',
        'Insurance requirements: Auto Liability $1M, Cargo $100K, General Liability $1M.',
      ],
      showInsurance: true,
    });
  }
}
