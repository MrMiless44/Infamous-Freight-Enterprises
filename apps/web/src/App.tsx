import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import PublicLayout from '@/layouts/PublicLayout';
import SeoManager from '@/components/SeoManager';
import { AppErrorBoundary } from '@/components/SentryErrorBoundary';
import { BRAND } from '@/lib/brand';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LoadsPage = lazy(() => import('@/pages/LoadsPage'));
const DispatchBoardPage = lazy(() => import('@/pages/DispatchBoardPage'));
const DriversPage = lazy(() => import('@/pages/DriversPage'));
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage'));
const CompliancePage = lazy(() => import('@/pages/CompliancePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const BillingRequiredPage = lazy(() => import('@/pages/BillingRequiredPage'));
const RateComparisonTool = lazy(() => import('@/components/RateComparisonTool'));
const OnboardingWizard = lazy(() => import('@/components/onboarding/OnboardingWizard'));
const MetricsDashboard = lazy(() => import('@/pages/MetricsDashboard'));
const CaseStudies = lazy(() => import('@/pages/CaseStudies'));
const ProductHunt = lazy(() => import('@/pages/ProductHunt'));
const GDPR = lazy(() => import('@/pages/GDPR'));
const LaunchValidationPage = lazy(() => import('@/pages/LaunchValidationPage'));
const PayPerLoadPricing = lazy(() =>
  import('@/components/PayPerLoadPricing').then((m) => ({ default: m.PayPerLoadPricing }))
);
const ReferralProgram = lazy(() =>
  import('@/components/ReferralProgram').then((m) => ({ default: m.ReferralProgram }))
);
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const CarriersPage = lazy(() => import('@/pages/CarriersPage'));
const AccountingDashboardPage = lazy(() => import('@/pages/AccountingDashboardPage'));
const QuoteRequestsPage = lazy(() => import('@/pages/QuoteRequestsPage'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const PublicQuoteRequestPage = lazy(() => import('@/pages/PublicQuoteRequestPage'));
const ShipmentTrackingPage = lazy(() => import('@/pages/ShipmentTrackingPage'));
const CustomerPortalPage = lazy(() => import('@/pages/CustomerPortalPage'));
const CarrierPortalPage = lazy(() => import('@/pages/CarrierPortalPage'));
const PublicLoadBoardPage = lazy(() => import('@/pages/PublicLoadBoardPage'));
const FreightAssistantPage = lazy(() => import('@/pages/FreightAssistantPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const PartnersPage = lazy(() => import('@/pages/PartnersPage'));
const DriversApplyPage = lazy(() => import('@/pages/DriversApplyPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'));
const ResourceArticlePage = lazy(() => import('@/pages/ResourceArticlePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const RouteFallback = () => (
  <main
    className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0a0a0a] text-slate-100"
    style={{
      background:
        'radial-gradient(circle at top left, rgba(255, 106, 0, 0.2), transparent 32rem), #0a0a0a',
    }}
    aria-live="polite"
    aria-busy="true"
  >
    <section className="max-w-xl text-center">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-infamous-orange">
        {BRAND.displayName}
      </p>
      <h1 className="mt-3 mb-4 text-4xl sm:text-5xl font-bold leading-tight">
        Loading freight command center...
      </h1>
      <p className="text-base leading-relaxed text-slate-300">
        Dispatch, visibility, rate tools, and carrier operations are loading.
      </p>
      <div
        className="mx-auto mt-6 w-8 h-8 border-2 border-infamous-orange border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
    </section>
  </main>
);

function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <SeoManager />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />

          <Route element={<PublicLayout />}>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceSlug" element={<ServiceDetailPage />} />
            <Route path="/request-quote" element={<PublicQuoteRequestPage />} />
            <Route path="/track-shipment" element={<ShipmentTrackingPage />} />
            <Route path="/customer-portal" element={<CustomerPortalPage />} />
            <Route path="/carrier-portal" element={<CarrierPortalPage />} />
            <Route path="/load-board" element={<PublicLoadBoardPage />} />
            <Route path="/freight-assistant" element={<FreightAssistantPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/drive" element={<DriversApplyPage />} />
            <Route path="/terms" element={<LegalPage />} />
            <Route path="/privacy" element={<LegalPage />} />
            <Route path="/carrier-agreement" element={<LegalPage />} />
            <Route path="/shipper-agreement" element={<LegalPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:articleSlug" element={<ResourceArticlePage />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/product-hunt" element={<ProductHunt />} />
            <Route path="/gdpr" element={<GDPR />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />

          <Route element={<AppLayout />}>
            <Route path="/ops" element={<DashboardPage />} />
            <Route path="/loads" element={<LoadsPage />} />
            <Route path="/dispatch" element={<DispatchBoardPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/analytics" element={<MetricsDashboard />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/billing" element={<BillingRequiredPage />} />
            <Route path="/rate-comparison" element={<RateComparisonTool />} />
            <Route path="/pay-per-load" element={<PayPerLoadPricing />} />
            <Route path="/referrals" element={<ReferralProgram />} />
            <Route path="/launch-validation" element={<LaunchValidationPage />} />
            <Route path="/carriers" element={<CarriersPage />} />
            <Route path="/accounting" element={<AccountingDashboardPage />} />
            <Route path="/quotes" element={<QuoteRequestsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}

export default App;
