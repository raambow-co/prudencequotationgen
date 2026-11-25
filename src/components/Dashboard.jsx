import React, { useState, useMemo } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  FileText, 
  Zap, 
  TrendingUp, 
  SunMedium,
  Layers, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  Leaf, 
  Atom, 
  Building, 
  MapPin, 
  Calendar, 
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  CheckCheck,
  Coins,
  Cpu,
  Workflow,
  BadgeCheck,
  Settings as SettingsIcon,
  RotateCcw
} from 'lucide-react';

export default function Dashboard({ 
  quotations, 
  onNewQuote, 
  onPreviewQuote, 
  onEditQuote, 
  onDuplicateQuote, 
  onDeleteQuote,
  onOpenSettings 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all'); // 'all', 'res' (<6kW), 'comm' (6-20kW), 'ind' (>20kW)
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'capacity-desc', 'value-desc'

  // Filtered and Sorted quotations
  const filteredQuotations = useMemo(() => {
    return quotations
      .filter(q => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          q.customer?.name?.toLowerCase().includes(term) ||
          q.quotationNumber?.toLowerCase().includes(term) ||
          q.customer?.location?.toLowerCase().includes(term) ||
          q.technical?.panelBrand?.toLowerCase().includes(term) ||
          q.technical?.inverterBrand?.toLowerCase().includes(term);

        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

        const kw = parseFloat(q.technical?.actualDcCapacityKw || q.technical?.systemCapacityKw || 0);
        let matchesCapacity = true;
        if (capacityFilter === 'res') matchesCapacity = kw < 6;
        else if (capacityFilter === 'comm') matchesCapacity = kw >= 6 && kw <= 20;
        else if (capacityFilter === 'ind') matchesCapacity = kw > 20;

        return matchesSearch && matchesStatus && matchesCapacity;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date || 0) - new Date(a.date || 0);
        if (sortBy === 'date-asc') return new Date(a.date || 0) - new Date(b.date || 0);
        if (sortBy === 'capacity-desc') {
          const kwA = parseFloat(a.technical?.systemCapacityKw || 0);
          const kwB = parseFloat(b.technical?.systemCapacityKw || 0);
          return kwB - kwA;
        }
        if (sortBy === 'value-desc') {
          const valA = parseFloat(a.commercials?.netPayable || 0);
          const valB = parseFloat(b.commercials?.netPayable || 0);
          return valB - valA;
        }
        return 0;
      });
  }, [quotations, searchTerm, statusFilter, capacityFilter, sortBy]);

  // Aggregate KPIs
  const totalKw = quotations.reduce((acc, q) => acc + (parseFloat(q.technical?.actualDcCapacityKw || q.technical?.systemCapacityKw) || 0), 0);
  const totalValue = quotations.reduce((acc, q) => acc + (parseFloat(q.commercials?.netPayable) || 0), 0);
  const totalAnnualSavings = quotations.reduce((acc, q) => acc + (parseFloat(q.technical?.estimatedAnnualSavings) || 0), 0);
  const totalCo2Offset = Math.round(totalKw * 4.25 * 365 * 0.82 * 25 / 1000);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-eco-50 text-eco-700 border-eco-200 ring-1 ring-eco-100';
      case 'Sent':
        return 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-100';
      case 'Under Review':
        return 'bg-solar-subtle text-solar-amber border-solar-border ring-1 ring-amber-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Approved': return 'bg-eco-500';
      case 'Sent': return 'bg-sky-500';
      case 'Under Review': return 'bg-solar-warm';
      default: return 'bg-slate-400';
    }
  };

  const counts = {
    all: quotations.length,
    Approved: quotations.filter(q => q.status === 'Approved').length,
    Sent: quotations.filter(q => q.status === 'Sent').length,
    Draft: quotations.filter(q => q.status === 'Draft').length,
    'Under Review': quotations.filter(q => q.status === 'Under Review').length
  };

  // Export JSON backup handler
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prudence_solar_proposals_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ============================================================== */}
      {/* 1. HIGH-CONTRAST CLEAN EXECUTIVE COMMAND HEADER                */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* 4-Color Signature Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-900 via-sky-500 via-eco-500 to-solar-orange" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-eco-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-900">
                PRUDENCE SOLAR &bull; EPC PROPOSAL OPERATIONS
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-[11px] font-semibold text-slate-500">
                DISCOM Empanelled Partner
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-display leading-tight">
              Solar Quotation &amp; Proposal Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-2xl font-normal">
              Engineered for high-yield rooftop solar generation. Generate standardized 5-page techno-commercial proposals with automated system sizing, Bill of Materials, PM Surya Ghar DBT subsidies, and verified project case studies.
            </p>

            {/* Quick Sizing Launchers */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black text-brand-900 uppercase tracking-wide mr-1">
                Quick Preset:
              </span>
              {[
                { kw: 3, label: '3 kW Residential', badge: 'PM Surya Ghar' },
                { kw: 5, label: '5 kW Standard', badge: 'PM Surya Ghar' },
                { kw: 10, label: '10 kW Villa', badge: 'Commercial / Residential' },
                { kw: 25, label: '25 kW Commercial', badge: 'Accelerated Depr.' },
                { kw: 50, label: '50 kW Industrial', badge: 'Accelerated Depr.' },
              ].map((preset) => (
                <button
                  key={preset.kw}
                  onClick={() => onNewQuote(preset.kw)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-brand-900 border border-slate-200/90 text-[11px] font-bold transition-all hover:border-sky-300 shadow-2xs flex items-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-solar-orange" />
                  <span>+{preset.kw} kWp</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onNewQuote()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-brand-900 via-brand-800 to-sky-900 hover:from-brand-950 hover:to-sky-800 shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="w-4 h-4 text-solar-warm stroke-[3]" />
              <span>Create New Proposal</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all"
            >
              <SettingsIcon className="w-4 h-4 text-slate-500" />
              <span>Master Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. BENTO ANALYTICS STATS (4 BRAND COLORS)                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Proposals Count (Light Blue Accent) */}
        <div 
          onClick={() => { setStatusFilter('all'); setCapacityFilter('all'); setSearchTerm(''); }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle relative overflow-hidden group hover:border-sky-400 hover:shadow-card transition-all cursor-pointer"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-sky-600" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span className="font-extrabold text-slate-700 uppercase text-[10.5px] tracking-wide">Proposals in Registry</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-2xs group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-brand-900 mt-2 tracking-tight">
            {quotations.length}
          </p>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-sky-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              {counts.Approved} Approved
            </span>
            <span className="text-slate-400 font-medium text-[10px]">Click to Reset</span>
          </div>
        </div>

        {/* 2. Total Clean Capacity (Yellowish-Orange Solar Accent) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle relative overflow-hidden group hover:border-amber-400 hover:shadow-card transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-solar-warm to-solar-orange" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span className="font-extrabold text-slate-700 uppercase text-[10.5px] tracking-wide">Total Proposed Solar</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-solar-orange flex items-center justify-center border border-amber-100 shadow-2xs group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-brand-900 mt-2 tracking-tight">
            {totalKw.toFixed(1)} <span className="text-sm font-bold text-slate-400">kWp DC</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-solar-amber font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-solar-warm" />
            <span>High-Yield TOPCon Arrays</span>
          </div>
        </div>

        {/* 3. Net Pipeline Value (Dark Blue Tech Accent) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle relative overflow-hidden group hover:border-brand-400 hover:shadow-card transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-700 to-brand-950" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span className="font-extrabold text-slate-700 uppercase text-[10.5px] tracking-wide">Net Pipeline Value</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-900 flex items-center justify-center border border-brand-100 shadow-2xs group-hover:scale-110 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-brand-900 mt-2 tracking-tight">
            {formatCurrency(totalValue)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-brand-800 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-700" />
            <span>Net Client Outlay Post Subsidy</span>
          </div>
        </div>

        {/* 4. Annual Savings (Eco Green Accent) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle relative overflow-hidden group hover:border-emerald-400 hover:shadow-card transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-eco-400 to-eco-600" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span className="font-extrabold text-slate-700 uppercase text-[10.5px] tracking-wide">Client Bill Savings</span>
            <div className="w-9 h-9 rounded-xl bg-eco-50 text-eco-600 flex items-center justify-center border border-eco-100 shadow-2xs group-hover:scale-110 transition-transform">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-eco-700 mt-2 tracking-tight">
            {formatCurrency(totalAnnualSavings)} <span className="text-xs font-bold text-slate-400">/yr</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-eco-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-eco-500" />
            <span>~{totalCo2Offset} Tonnes CO₂ Abated (25-Yr)</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. PROPOSAL DIRECTORY WITH SEARCH, FILTERS & VIEW TOGGLE       */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-brand-900 tracking-tight">
                Proposal Directory
              </h2>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-900 border border-sky-200">
                {filteredQuotations.length} of {quotations.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live database of customer solar quotations and 5-page PDF proposals
            </p>
          </div>

          {/* Interactive Filters Hub */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, quote #, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 w-52 sm:w-64 bg-white shadow-2xs font-medium"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
              {['all', 'Approved', 'Sent', 'Draft', 'Under Review'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    statusFilter === status
                      ? 'bg-brand-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>

            {/* Capacity Sizing Filter */}
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">All Sizes</option>
              <option value="res">Residential (&lt;6 kW)</option>
              <option value="comm">Commercial (6–20 kW)</option>
              <option value="ind">Industrial (&gt;20 kW)</option>
            </select>

            {/* Sorting Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="capacity-desc">Highest Capacity</option>
              <option value="value-desc">Highest Value</option>
            </select>

            {/* View Mode Toggle (Table vs Grid) */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-brand-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-brand-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export Backup Button */}
            <button
              onClick={handleExportData}
              className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 transition-colors shadow-2xs"
              title="Export All Proposals as JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content: TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            {filteredQuotations.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/90">
                    <th className="py-3.5 px-5">Quotation Ref &amp; Date</th>
                    <th className="py-3.5 px-5">Client &amp; Installation Site</th>
                    <th className="py-3.5 px-5">System Architecture</th>
                    <th className="py-3.5 px-5">Commercial Investment</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredQuotations.map((q) => {
                    const initials = q.customer?.name
                      ? q.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'CL';

                    return (
                      <tr key={q.id} className="hover:bg-sky-50/30 transition-colors group">
                        {/* Ref & Date */}
                        <td className="py-4 px-5">
                          <span className="font-mono font-extrabold text-brand-900 block text-[13px] group-hover:text-sky-700 transition-colors">
                            {q.quotationNumber}
                          </span>
                          <div className="mt-1 flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-900 border border-sky-200 truncate max-w-[180px] inline-block">
                              {q.company?.name || 'PRUDENCE SOLAR & SCIENTIFIC SOLUTIONS'}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formatDate(q.date)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Customer & Location */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-50 to-sky-100 text-brand-900 font-extrabold text-xs flex items-center justify-center border border-sky-200/60 shadow-2xs shrink-0">
                              {initials}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-[13px]">{q.customer?.name || 'Customer'}</span>
                              {q.customer?.companyName && (
                                <span className="text-[11px] text-sky-700 font-medium block">{q.customer.companyName}</span>
                              )}
                              <div className="flex items-center gap-1 text-[10.5px] text-slate-400 mt-0.5 truncate max-w-xs">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{q.customer?.location || 'Hyderabad, TS'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* System Spec */}
                        <td className="py-4 px-5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-brand-900 text-sm">
                              {q.technical?.actualDcCapacityKw || q.technical?.systemCapacityKw || 5.5} kWp DC
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {q.technical?.panelCount || 10} modules
                            </span>
                          </div>
                          <span className="text-[10.5px] text-sky-700 font-medium block mt-1">
                            {q.technical?.panelBrand} &bull; {q.technical?.inverterBrand}
                          </span>
                        </td>

                        {/* Commercials */}
                        <td className="py-4 px-5">
                          <span className="font-extrabold text-slate-900 block text-sm">
                            {formatCurrency(q.commercials?.netPayable)}
                          </span>
                          {q.commercials?.subsidyAmount > 0 ? (
                            <span className="inline-block text-[10px] text-solar-amber font-bold bg-solar-subtle px-2 py-0.5 rounded-md border border-solar-border mt-1">
                              PM Surya Ghar: {formatCurrency(q.commercials.subsidyAmount)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Gross: {formatCurrency(q.commercials?.totalGrossCost)}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(q.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(q.status)}`} />
                            <span>{q.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => onPreviewQuote(q)}
                              className="p-2 rounded-xl text-sky-700 bg-sky-50/60 hover:bg-sky-100 border border-sky-200 transition-all hover:scale-105"
                              title="Preview 5-Page A4 Proposal"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onEditQuote(q)}
                              className="p-2 rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all hover:scale-105"
                              title="Edit Proposal Data"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onDuplicateQuote(q)}
                              className="p-2 rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all hover:scale-105"
                              title="Duplicate as New Proposal"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onDeleteQuote(q.id)}
                              className="p-2 rounded-xl text-rose-600 bg-rose-50/60 hover:bg-rose-100 border border-rose-200 transition-all hover:scale-105"
                              title="Delete Proposal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState onNewQuote={() => onNewQuote()} />
            )}
          </div>
        )}

        {/* Content: CARD GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="p-6">
            {filteredQuotations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredQuotations.map((q) => {
                  const initials = q.customer?.name
                    ? q.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'CL';

                  return (
                    <div 
                      key={q.id} 
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 hover:shadow-card transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Card Top: Ref & Status */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <span className="font-mono font-extrabold text-brand-900 text-xs">
                            {q.quotationNumber}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${getStatusBadge(q.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(q.status)}`} />
                            <span>{q.status}</span>
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-sky-100 text-brand-900 font-black text-xs flex items-center justify-center border border-sky-200 shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{q.customer?.name || 'Customer'}</h4>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{q.customer?.location || 'Telangana'}</span>
                            </p>
                          </div>
                        </div>

                        {/* System Specs Bento */}
                        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 uppercase text-[9px] font-bold block">Capacity</span>
                            <span className="font-black text-brand-900 text-xs">
                              {q.technical?.actualDcCapacityKw || q.technical?.systemCapacityKw || 5.5} kWp
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase text-[9px] font-bold block">Hardware</span>
                            <span className="font-bold text-sky-700 truncate block text-[10.5px]">
                              {q.technical?.panelBrand}
                            </span>
                          </div>
                        </div>

                        {/* Commercial Pricing */}
                        <div className="mt-3 flex items-baseline justify-between">
                          <div>
                            <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Net Outlay</span>
                            <span className="text-base font-black text-slate-900">
                              {formatCurrency(q.commercials?.netPayable)}
                            </span>
                          </div>
                          {q.commercials?.subsidyAmount > 0 && (
                            <span className="text-[9px] font-bold text-solar-amber bg-solar-subtle px-2 py-0.5 rounded-full border border-solar-border">
                              CFA: {formatCurrency(q.commercials.subsidyAmount)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onPreviewQuote(q)}
                          className="flex-1 py-2 px-3 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-solar-warm" />
                          <span>5-Page PDF</span>
                        </button>
                        <button
                          onClick={() => onEditQuote(q)}
                          className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateQuote(q)}
                          className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteQuote(q.id)}
                          className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState onNewQuote={() => onNewQuote()} />
            )}
          </div>
        )}
      </div>

      {/* 5-Page Standardized Solar Proposal Architecture Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center shadow-sm shrink-0">
            <Layers className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h4 className="text-xs font-black text-brand-900 uppercase tracking-wider">
              Standardized 5-Page Solar Techno-Commercial Deliverable
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              1. Proposal Cover &bull; 2. Technical BOM &bull; 3. Commercials &amp; ROI &bull; 4. Portfolio Works &bull; 5. Company Credentials &amp; QR
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs font-extrabold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-xl bg-sky-50 border border-sky-200"
        >
          <span>Configure Company &amp; Hardware Catalog</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onNewQuote }) {
  return (
    <div className="p-16 text-center text-slate-500">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <FileText className="w-7 h-7" />
      </div>
      <p className="text-base font-bold text-slate-800">No solar proposals match your criteria</p>
      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try clearing your search query or generate a new high-efficiency solar proposal.</p>
      <button
        onClick={onNewQuote}
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-900 text-white rounded-xl text-xs font-bold hover:bg-brand-800 shadow-sm"
      >
        <Plus className="w-4 h-4 text-solar-warm" />
        <span>Create New Proposal</span>
      </button>
    </div>
  );
}
