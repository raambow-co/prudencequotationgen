import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import QuotationForm from './components/QuotationForm';
import QuotationPreview from './components/QuotationPreview';
import SettingsView from './components/SettingsView';
import { sampleQuotations } from './data/sampleQuotations';
import { defaultSettings } from './data/defaultSettings';
import { generateQuotationNumber } from './utils/formatters';
import { calculateSolarMetrics, calculateSubsidy, calculateFinancials } from './utils/calculations';
import { 
  Sun, 
  FileText, 
  Plus, 
  Settings as SettingsIcon, 
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Atom,
  ChevronRight
} from 'lucide-react';

const STORAGE_KEY_QUOTES = 'prudence_solar_quotations_v1';
const STORAGE_KEY_SETTINGS = 'prudence_solar_settings_v1';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-float text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-rose-100">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">Something went wrong while rendering</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
            {this.state.error?.message || 'An unexpected rendering error occurred. You can return to the dashboard safely.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="mt-6 px-6 py-2.5 bg-brand-900 text-white rounded-xl text-xs font-bold hover:bg-brand-800 shadow-md transition-all hover:scale-105"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'form', 'preview', 'settings'
  const [currentQuotation, setCurrentQuotation] = useState(null);

  // Purge any non-prudence cached keys if present
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (!key.startsWith('prudence_solar_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
  }, []);

  // Load Quotations from LocalStorage or Fallback to Samples
  const [quotations, setQuotations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading quotations from storage:', e);
    }
    return sampleQuotations;
  });

  // Load Settings from LocalStorage or Fallback to Defaults (with Deep Merge)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const companyDetails = (Array.isArray(parsed.companyDetails) && parsed.companyDetails.length > 0)
          ? parsed.companyDetails
          : defaultSettings.companyDetails;
        const defaultCompanyDetailId = parsed.defaultCompanyDetailId || defaultSettings.defaultCompanyDetailId || 'detail-1';
        const activeCompany = companyDetails.find(d => d.id === defaultCompanyDetailId) || companyDetails[0] || defaultSettings.company;

        return {
          ...defaultSettings,
          ...parsed,
          companyDetails,
          defaultCompanyDetailId,
          company: activeCompany,
          qrPortals: { ...defaultSettings.qrPortals, ...(parsed.qrPortals || {}) },
          coverPage: { ...defaultSettings.coverPage, ...(parsed.coverPage || {}) },
          pricing: { ...defaultSettings.pricing, ...(parsed.pricing || {}) },
          equipmentCatalog: {
            ...defaultSettings.equipmentCatalog,
            ...(parsed.equipmentCatalog || {}),
            panelBrands: (Array.isArray(parsed.equipmentCatalog?.panelBrands) && parsed.equipmentCatalog.panelBrands.length > 0)
              ? parsed.equipmentCatalog.panelBrands
              : defaultSettings.equipmentCatalog.panelBrands,
            inverterBrands: (Array.isArray(parsed.equipmentCatalog?.inverterBrands) && parsed.equipmentCatalog.inverterBrands.length > 0)
              ? parsed.equipmentCatalog.inverterBrands
              : defaultSettings.equipmentCatalog.inverterBrands,
            structureTypes: (Array.isArray(parsed.equipmentCatalog?.structureTypes) && parsed.equipmentCatalog.structureTypes.length > 0)
              ? parsed.equipmentCatalog.structureTypes
              : defaultSettings.equipmentCatalog.structureTypes,
            structureSpecs: { ...defaultSettings.equipmentCatalog.structureSpecs, ...(parsed.equipmentCatalog?.structureSpecs || {}) },
            electricalSpecs: { ...defaultSettings.equipmentCatalog.electricalSpecs, ...(parsed.equipmentCatalog?.electricalSpecs || {}) }
          },
          warranties: { ...defaultSettings.warranties, ...(parsed.warranties || {}) },
          paymentMilestones: (Array.isArray(parsed.paymentMilestones) && parsed.paymentMilestones.length > 0)
            ? parsed.paymentMilestones
            : defaultSettings.paymentMilestones,
          authorization: { ...defaultSettings.authorization, ...(parsed.authorization || {}) },
          omAssurance: { ...defaultSettings.omAssurance, ...(parsed.omAssurance || {}) },
          portfolioWorks: {
            ...defaultSettings.portfolioWorks,
            ...(parsed.portfolioWorks || {}),
            metrics: { ...defaultSettings.portfolioWorks.metrics, ...(parsed.portfolioWorks?.metrics || {}) },
            projects: (Array.isArray(parsed.portfolioWorks?.projects) && parsed.portfolioWorks.projects.length > 0)
              ? parsed.portfolioWorks.projects
              : defaultSettings.portfolioWorks.projects,
            extraShowcase: (Array.isArray(parsed.portfolioWorks?.extraShowcase) && parsed.portfolioWorks.extraShowcase.length > 0)
              ? parsed.portfolioWorks.extraShowcase
              : defaultSettings.portfolioWorks.extraShowcase
          },
          executionRoadmap: (Array.isArray(parsed.executionRoadmap) && parsed.executionRoadmap.length > 0)
            ? parsed.executionRoadmap
            : defaultSettings.executionRoadmap,
          scopeOfWorkMatrix: (Array.isArray(parsed.scopeOfWorkMatrix) && parsed.scopeOfWorkMatrix.length > 0)
            ? parsed.scopeOfWorkMatrix
            : defaultSettings.scopeOfWorkMatrix
        };
      }
    } catch (e) {
      console.error('Error loading settings from storage:', e);
    }
    return defaultSettings;
  });

  // Persist Quotations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotations));
    } catch (e) {
      console.error('Failed to save quotations:', e);
    }
  }, [quotations]);

  // Persist Settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Handlers
  const handleNewQuote = (presetKw = null) => {
    if (presetKw) {
      const defaultKw = parseFloat(presetKw);
      const metrics = calculateSolarMetrics(defaultKw, settings?.pricing?.defaultTariffPerUnit || 8.5, 550);
      const subsidy = calculateSubsidy(defaultKw, settings?.pricing?.defaultSubsidyScheme || 'pm-surya-ghar');
      const fin = calculateFinancials({
        capacityKw: defaultKw,
        pricePerKw: settings?.pricing?.defaultRatePerKw || 52000,
        gstRate: settings?.pricing?.defaultGstRate || 13.8,
        subsidyAmount: subsidy,
        annualSavings: metrics.annualSavings
      });

      const template = {
        id: `quote-${Date.now()}`,
        quotationNumber: generateQuotationNumber(),
        date: new Date().toISOString().split('T')[0],
        validityDays: 30,
        status: 'Draft',
        customer: {
          name: '',
          companyName: '',
          phone: '',
          email: '',
          location: '',
          consumerNumber: '',
          sanctionedLoad: `${defaultKw} kW`,
          gridPhase: defaultKw > 5 ? '3-Phase (415V LT)' : 'Single Phase (1-Phase 230V)',
          roofType: 'RCC Flat Concrete Terrace'
        },
        technical: {
          systemCapacityKw: defaultKw,
          actualDcCapacityKw: defaultKw,
          panelBrand: settings?.equipmentCatalog?.panelBrands?.[0]?.name || 'Waaree Solar',
          panelModel: settings?.equipmentCatalog?.panelBrands?.[0]?.model || '550Wp Bi-facial Dual Glass TopCon',
          panelWattage: 550,
          panelCount: metrics.panelCount,
          inverterBrand: settings?.equipmentCatalog?.inverterBrands?.[0]?.name || 'Sungrow Power',
          inverterModel: settings?.equipmentCatalog?.inverterBrands?.[0]?.model || 'Smart On-Grid Dual MPPT Inverter',
          structureType: settings?.equipmentCatalog?.structureTypes?.[0]?.name || 'Hot-Dip Galvanized Iron (GI) — Elevated 7 to 9 ft',
          cablesAndBOS: settings?.equipmentCatalog?.cableBrands || 'Polycab / Siechem 4 sq.mm TUV Solar Cables',
          monitoring: 'Smart Wi-Fi IoT Cloud Real-time Mobile Application',
          estimatedDailyUnits: metrics.dailyUnits,
          estimatedAnnualUnits: metrics.annualUnits,
          estimatedMonthlySavings: metrics.monthlySavings,
          estimatedAnnualSavings: metrics.annualSavings,
          roofAreaSqFt: metrics.roofAreaSqFt,
          co2SavedTonnes: metrics.annualCo2SavedTonnes,
          tariff: settings?.pricing?.defaultTariffPerUnit || 8.5
        },
        commercials: {
          ratePerKw: settings?.pricing?.defaultRatePerKw || 52000,
          baseCost: fin.basePrice,
          discount: 0,
          priceAfterDiscount: fin.priceAfterDiscount,
          gstRate: settings?.pricing?.defaultGstRate || 13.8,
          gstAmount: fin.gst,
          totalGrossCost: fin.totalGrossCost,
          subsidyScheme: defaultKw <= 10 ? 'PM Surya Ghar: Muft Bijli Yojana' : 'Commercial - Accelerated Depreciation (Tax Benefit 40%)',
          subsidyAmount: subsidy,
          netPayable: fin.netPayable,
          paybackYears: fin.paybackYears,
          gross25YrSavings: fin.gross25YrSavings,
          net25YrProfit: fin.net25YrProfit,
          cumulativeSavings25Years: fin.net25YrProfit
        },
        warranties: { ...(settings?.warranties || settings?.defaultWarranties || {}) },
        paymentMilestones: [...(settings?.paymentMilestones || settings?.defaultPaymentTerms || [])],
        notes: 'Includes turnkey DISCOM Net-Metering facilitation, foundation column civil work, and complimentary solar panel cleaning maintenance kit.',
        preparedBy: 'Prudence Solar Engineering & Sales Team'
      };
      setCurrentQuotation(template);
    } else {
      setCurrentQuotation(null);
    }
    setView('form');
  };

  const handleEditQuote = (quote) => {
    setCurrentQuotation(quote);
    setView('form');
  };

  const handlePreviewQuote = (quote) => {
    setCurrentQuotation(quote);
    setView('preview');
  };

  const handleDuplicateQuote = (quote) => {
    const cloned = {
      ...JSON.parse(JSON.stringify(quote)),
      id: `quote-${Date.now()}`,
      quotationNumber: generateQuotationNumber(),
      date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      customer: {
        ...quote.customer,
        name: `${quote.customer.name} (Copy)`
      }
    };
    setQuotations(prev => [cloned, ...prev]);
  };

  const handleDeleteQuote = (quoteId) => {
    if (window.confirm('Are you sure you want to delete this solar proposal?')) {
      setQuotations(prev => prev.filter(q => q.id !== quoteId));
      if (currentQuotation?.id === quoteId) {
        setCurrentQuotation(null);
        setView('dashboard');
      }
    }
  };

  const handleSaveQuote = (savedData) => {
    setQuotations(prev => {
      const exists = prev.some(q => q.id === savedData.id);
      if (exists) {
        return prev.map(q => q.id === savedData.id ? savedData : q);
      } else {
        return [savedData, ...prev];
      }
    });
    setCurrentQuotation(savedData);
    setView('preview');
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all pricing and company settings to Prudence default values?')) {
      setSettings(defaultSettings);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col text-slate-800 antialiased font-sans">
      {/* 4-Color Ultra-Precision Signature Accent Ribbon */}
      <div className="no-print h-1.5 w-full bg-gradient-to-r from-brand-900 via-sky-500 via-eco-500 to-solar-orange z-50 sticky top-0" />

      {/* Global Modern Executive Navigation Header */}
      <header className="no-print bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-1.5 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Corporate Monogram */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center gap-3.5 text-left group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-1.5 group-hover:scale-105 group-hover:shadow-md transition-all">
                <img 
                  src="/logo.png" 
                  alt="PRUDENCE" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-brand-900 tracking-tight font-display">
                    PRUDENCE
                  </span>
                  <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-50 to-sky-100 text-sky-800 font-bold uppercase tracking-wider border border-sky-200/80">
                    Solar &amp; Scientific
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-eco-500 inline-block animate-pulse" />
                  <span className="text-[10px] font-semibold text-eco-700 tracking-wide">
                    Inspired by Science &bull; Powered by Sun
                  </span>
                </div>
              </div>
            </button>

            <div className="hidden xl:block h-8 w-px bg-slate-200 mx-2" />
            <div className="hidden xl:flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium border border-slate-200">
                DISCOM Empanelled
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-solar-subtle text-solar-amber font-semibold border border-solar-border">
                PM Surya Ghar CFA
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 flex items-center gap-1">
              <button
                onClick={() => setView('dashboard')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  view === 'dashboard'
                    ? 'bg-white text-brand-900 shadow-xs'
                    : 'text-slate-600 hover:text-brand-900 hover:bg-white/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-sky-600" />
                <span>Dashboard</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono">
                  {quotations.length}
                </span>
              </button>

              <button
                onClick={() => setView('settings')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  view === 'settings'
                    ? 'bg-white text-brand-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-brand-900 hover:bg-white/60'
                }`}
                title="Company Settings & Pricing Configuration"
              >
                <SettingsIcon className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleNewQuote}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all shadow-md hover:shadow-float ${
                view === 'form'
                  ? 'bg-gradient-to-r from-brand-950 via-sky-800 to-brand-900 ring-2 ring-sky-400'
                  : 'bg-gradient-to-r from-brand-900 via-brand-800 to-sky-900 hover:opacity-95'
              }`}
            >
              <Plus className="w-4 h-4 text-solar-warm stroke-[3]" />
              <span>Create Proposal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1">
        <ErrorBoundary onReset={() => setView('dashboard')}>
          {view === 'dashboard' && (
            <Dashboard
              quotations={quotations}
              onNewQuote={handleNewQuote}
              onPreviewQuote={handlePreviewQuote}
              onEditQuote={handleEditQuote}
              onDuplicateQuote={handleDuplicateQuote}
              onDeleteQuote={handleDeleteQuote}
              onOpenSettings={() => setView('settings')}
            />
          )}

          {view === 'form' && (
            <QuotationForm
              initialData={currentQuotation}
              settings={settings}
              onSave={handleSaveQuote}
              onCancel={() => setView('dashboard')}
              onPreview={(data) => {
                setCurrentQuotation(data);
                setView('preview');
              }}
            />
          )}

          {view === 'preview' && (
            <QuotationPreview
              quotation={currentQuotation || quotations?.[0] || sampleQuotations?.[0]}
              settings={settings}
              onBack={() => setView('dashboard')}
              onEdit={(q) => {
                setCurrentQuotation(q);
                setView('form');
              }}
            />
          )}

          {view === 'settings' && (
            <SettingsView
              currentSettings={settings}
              onSaveSettings={handleSaveSettings}
              onResetDefaults={handleResetSettings}
              onBack={() => setView('dashboard')}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Modern Executive Footer (Hidden when printing or in preview) */}
      {view !== 'preview' && (
        <footer className="no-print bg-white border-t border-slate-200/80 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-brand-900 text-white flex items-center justify-center p-1">
                <img src="/logo.png" alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-brand-900 tracking-tight block">PRUDENCE SOLAR &amp; SCIENTIFIC SOLUTIONS PVT. LTD.</span>
                <span className="text-eco-600 font-medium text-[11px]">Inspired by Science. Powered by Sun.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
                Standard 5-Page A4 Proposal Engine
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-solar-orange inline-block" />
                PM Surya Ghar DBT Ready
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-eco-500 inline-block" />
                DISCOM Empanelled EPC Standards
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
