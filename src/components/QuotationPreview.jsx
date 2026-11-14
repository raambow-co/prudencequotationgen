import React, { useState } from 'react';
import Page1Cover from './pages/Page1Cover';
import Page2SystemSpec from './pages/Page2SystemSpec';
import Page3Financials from './pages/Page3Financials';
import Page4Portfolio from './pages/Page4Portfolio';
import Page5CompanyProfile from './pages/Page5CompanyProfile';
import { Printer, Eye, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Edit3, Download, Copy, CheckCheck } from 'lucide-react';

export default function QuotationPreview({ quotation, settings, onBack, onEdit }) {
  const [activePage, setActivePage] = useState('all'); // 'all', '1', '2', '3', '4', '5'
  const [zoomLevel, setZoomLevel] = useState(100);

  const handlePrint = () => {
    // When printing, ensure all 5 pages are rendered
    if (activePage !== 'all') {
      setActivePage('all');
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      window.print();
    }
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(130, Math.max(60, prev + delta)));
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${quotation?.quotationNumber || 'quotation'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const pages = [
    { id: '1', title: 'Page 1: Cover & Intro' },
    { id: '2', title: 'Page 2: System Spec & BOM' },
    { id: '3', title: 'Page 3: Commercials & Terms' },
    { id: '4', title: 'Page 4: Portfolio & Showcase' },
    { id: '5', title: 'Page 5: Company & Connect' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 4-Color Signature Top Accent Ribbon */}
      <div className="no-print h-1.5 w-full bg-gradient-to-r from-brand-900 via-sky-500 via-eco-500 to-solar-orange" />

      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div>
            <h2 className="text-xs font-bold text-brand-900 flex items-center gap-2">
              <span>{quotation?.quotationNumber || 'PRU-SOL-2026-0001'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                {quotation?.customer?.name || 'Customer'}
              </span>
            </h2>
          </div>
        </div>

        {/* Page Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-medium border border-slate-200/80">
          <button
            onClick={() => setActivePage('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activePage === 'all'
                ? 'bg-white text-brand-900 font-bold shadow-xs border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 5 Pages
          </button>
          {pages.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePage(p.id)}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activePage === p.id
                  ? 'bg-white text-brand-900 font-bold shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={p.title}
            >
              <span>Page {p.id}</span>
            </button>
          ))}
        </div>

        {/* Actions & Zoom */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1 text-slate-600 border border-slate-200/70">
            <button 
              onClick={() => handleZoom(-10)} 
              className="p-1 hover:text-slate-900 rounded" 
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 w-9 text-center font-bold text-slate-700">{zoomLevel}%</span>
            <button 
              onClick={() => handleZoom(10)} 
              className="p-1 hover:text-slate-900 rounded" 
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setZoomLevel(100)} 
              className="p-1 hover:text-slate-900 rounded text-slate-400" 
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
            title="Download Proposal JSON File"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(quotation)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Data</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-900 via-sky-800 to-brand-900 hover:from-brand-800 hover:to-sky-900 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-solar-warm" />
            <span>Print / Save 5-Page PDF</span>
          </button>
        </div>
      </div>

      {/* Preview Workspace Area */}
      <div className="flex-1 overflow-auto py-8 px-4 flex justify-center print-container">
        <div 
          className="transition-transform duration-150 origin-top flex flex-col items-center gap-8 print-wrapper"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {/* Page 1: Cover & Intro */}
          {(activePage === 'all' || activePage === '1') && (
            <div className="flex flex-col items-center">
              <div className="no-print mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span>Page 1 of 5 &bull; Techno-Commercial Proposal Cover</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-900 border border-brand-200 text-[9px] font-mono font-bold">Standardized Cover</span>
              </div>
              <Page1Cover quotation={quotation} settings={settings} />
            </div>
          )}

          {/* Page 2: System Spec & BOM */}
          {(activePage === 'all' || activePage === '2') && (
            <div className="flex flex-col items-center">
              <div className="no-print mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span>Page 2 of 5 &bull; Technical Specifications &amp; Bill of Materials</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[9px] font-mono font-bold">Hardware Sizing &amp; BOM</span>
              </div>
              <Page2SystemSpec quotation={quotation} settings={settings} />
            </div>
          )}

          {/* Page 3: Commercials & Financials */}
          {(activePage === 'all' || activePage === '3') && (
            <div className="flex flex-col items-center">
              <div className="no-print mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span>Page 3 of 5 &bull; Commercial Proposal &amp; Payback Economics</span>
                <span className="px-2 py-0.5 rounded-full bg-solar-subtle border border-solar-border text-solar-amber text-[9px] font-mono font-bold">Pricing, Subsidy &amp; Authorization</span>
              </div>
              <Page3Financials quotation={quotation} settings={settings} />
            </div>
          )}

          {/* Page 4: Dynamic Portfolio & Showcase */}
          {(activePage === 'all' || activePage === '4') && (
            <div className="flex flex-col items-center">
              <div className="no-print mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span>Page 4 of 5 &bull; Completed Projects &amp; Field Showcase</span>
                <span className="px-2 py-0.5 rounded-full bg-eco-50 text-eco-700 border border-eco-200 text-[9px] font-mono font-bold">Track Record &amp; Field Works</span>
              </div>
              <Page4Portfolio quotation={quotation} settings={settings} />
            </div>
          )}

          {/* Page 5: Dynamic Company Profile, Scope Matrix & Connect */}
          {(activePage === 'all' || activePage === '5') && (
            <div className="flex flex-col items-center">
              <div className="no-print mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span>Page 5 of 5 &bull; Company Credentials, Scope Matrix &amp; Connect</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[9px] font-mono font-bold">Corporate Credentials &amp; QR</span>
              </div>
              <Page5CompanyProfile quotation={quotation} settings={settings} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
