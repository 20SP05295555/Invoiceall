import React, { useState } from 'react';
import { Tab, CompanyInfo } from '../types.ts';
import { useData } from '../contexts/DataContext.tsx';
import { Briefcase, Check, Eye, Edit3, Plus, Trash2, Palette, PenTool, Globe, Award, Sparkles, FileText, X, Save } from 'lucide-react';
import BusinessModal from './BusinessModal.tsx';

interface CompanyProfileProps {
  onNavigate: (tab: Tab) => void;
}

const INVOICE_TEMPLATES = [
  {
    id: 'default' as const,
    name: 'Default Classic',
    region: 'Global / Standard',
    badge: 'ডিফল্ট ডিজাইন',
    desc: 'বর্তমান ডিফল্ট ও অত্যন্ত সুন্দর ক্ল্যাসিক ডিজাইন। সকল ধরনের ব্যবসার জন্য উপযোগী।',
    previewFeatures: ['ক্ল্যাসিক হেডার ও স্ট্যাটাস স্ট্যাম্প', 'ডায়নামিক টেবিল ও ট্যাক্স হিসাব', 'ব্যাংকিং ডিটেইলস ও শর্তাবলী']
  },
  {
    id: 'usa' as const,
    name: 'USA Commercial Invoice',
    region: 'United States',
    badge: 'আমেরিকান স্ট্যান্ডার্ড',
    desc: 'ইউএসএ কমার্শিয়াল স্ট্যান্ডার্ড ইনভয়েস ফরম্যাট। Net 30 পেমেন্ট টার্মস ও স্পষ্ট Bill-To/Ship-To সেকশন।',
    previewFeatures: ['Prominent Net 30 Terms Box', 'American Commercial Grid Layout', 'Bold Wire Transfer / ACH Instructions']
  },
  {
    id: 'uk' as const,
    name: 'UK HMRC VAT Standard',
    region: 'United Kingdom',
    badge: 'ব্রিটিশ ভ্যাট ফরম্যাট',
    desc: 'ইউকে ও ইউরোপের ভ্যাট (HMRC) নিয়মানুযায়ী তৈরিকৃত ডিজাইন। কোম্পানি রেজি. নম্বর ও Sort Code ফোকাসড।',
    previewFeatures: ['Company Reg No & VAT Header', 'Sort Code & Account No Highlights', 'Clean British Typographic Style']
  },
  {
    id: 'canada' as const,
    name: 'Canada GST/HST Commercial',
    region: 'Canada',
    badge: 'কানাডিয়ান কমার্শিয়াল',
    desc: 'কানাডিয়ান বিজনেস নাম্বার (BN) ও স্পষ্ট কমার্শিয়াল সামারি কার্ড সমৃদ্ধ মডার্ন নর্থ আমেরিকান লেআউট।',
    previewFeatures: ['Structured Canadian Commercial Header', 'Prominent Subtotal & Tax Breakdown', 'Professional Inter-border Format']
  },
  {
    id: 'modern' as const,
    name: 'Global Modern Executive',
    region: 'International',
    badge: 'প্রিমিয়াম মডার্ন',
    desc: 'আধুনিক কালার বার ও মিনিমালিস্ট টাইপোগ্রাফি সমৃদ্ধ প্রিমিয়াম কর্পোরেট ইনভয়েস ডিজাইন।',
    previewFeatures: ['Top Accent Bar & Sleek Layout', 'High-contrast Summary Card', 'Executive Digital Signature Block']
  }
];

const BG_COLOR_PRESETS = [
  { label: 'Pure White (সাদা)', value: '#ffffff' },
  { label: 'Slate Tint (সফট স্লেট)', value: '#f8fafc' },
  { label: 'Soft Cream (ক্রিম)', value: '#fcfbf7' },
  { label: 'Mint Breeze (মিন্ট)', value: '#f0fdf4' },
  { label: 'Ice Blue (আইস ব্লু)', value: '#eff6ff' },
  { label: 'Warm Stone (স্টোন)', value: '#fafaf9' },
];

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ onNavigate }) => {
  const { profiles, activeProfileId, switchProfile, addProfile, removeProfile, companyInfo, updateCompanyInfo } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [activeTabSection, setActiveTabSection] = useState<'design' | 'signature' | 'background'>('design');

  const currentDesign = companyInfo.templateDesign || 'default';
  const currentBgColor = companyInfo.documentBgColor || '#ffffff';

  const handleSelectTemplate = (id: CompanyInfo['templateDesign']) => {
    updateCompanyInfo({ ...companyInfo, templateDesign: id });
  };

  const previewTemplate = INVOICE_TEMPLATES.find(t => t.id === previewTemplateId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" /> Company Profiles & International Templates
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            কোম্পানি প্রোফাইল ও ইনভয়েস ডিজাইন
          </h1>
          <p className="text-sm text-indigo-200 max-w-2xl leading-relaxed">
            এখান থেকে আপনার বিভিন্ন কোম্পানির প্রোফাইল পরিচালনা করুন এবং USA, UK, Canada সহ আন্তর্জাতিক মানের ৩-৪টি বহুল ব্যবহৃত ইনভয়েস ডিজাইন সিলেক্ট ও কাস্টমাইজ করুন।
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-95 shrink-0 text-sm"
        >
          <Plus className="w-4 h-4" /> নতুন কোম্পানি যোগ করুন
        </button>
      </div>

      {/* Profile Selector Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          সিলেক্টেড কোম্পানি (Active Business Profile):
        </h3>
        <div className="flex flex-wrap gap-3">
          {profiles.map(p => {
            const isActive = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                onClick={() => switchProfile(p.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 text-indigo-950 dark:text-indigo-200 shadow-sm font-bold scale-[1.02]'
                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-[10px] opacity-75">{isActive ? '✓ বর্তমানে সিলেক্টেড' : 'ক্লিক করে সিলেক্ট করুন'}</p>
                </div>
                {profiles.length > 1 && !isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete business "${p.name}"?`)) removeProfile(p.id);
                    }}
                    className="p-1 hover:text-red-500 ml-1 text-gray-400"
                    title="Delete profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs inside Customizer */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTabSection('design')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTabSection === 'design'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" /> ইন্টারন্যাশনাল ইনভয়েস ডিজাইন (Templates)
        </button>

        <button
          onClick={() => setActiveTabSection('signature')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTabSection === 'signature'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <PenTool className="w-4 h-4" /> ডিজিটাল সিগনেচার (Signature Option)
        </button>

        <button
          onClick={() => setActiveTabSection('background')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTabSection === 'background'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" /> পেজ ব্যাকগ্রাউন্ড কালার (Background Color)
        </button>
      </div>

      {/* TAB 1: INTERNATIONAL INVOICE DESIGNS */}
      {activeTabSection === 'design' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
              <span className="font-bold">ডিজাইন টিপস:</span> প্রতিটি ডিজাইনের নিচে ২টি অপশন রয়েছে— <span className="font-bold underline">প্রিভিউ</span> অপশনে ক্লিক করে ডিজাইনটি কেমন হবে তা দেখতে পারবেন এবং <span className="font-bold underline">কাস্টমাইজ ও সিলেক্ট</span> অপশনে ক্লিক করে আপনার ইনভয়েসের জন্য এই ডিজাইনটি ডিফল্ট হিসেবে সেট ও কাস্টমাইজ করতে পারবেন।
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INVOICE_TEMPLATES.map(t => {
              const isSelected = currentDesign === t.id;
              return (
                <div
                  key={t.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border-2 overflow-hidden flex flex-col transition-all shadow-sm hover:shadow-md ${
                    isSelected ? 'border-indigo-600 ring-4 ring-indigo-500/10' : 'border-gray-200 dark:border-slate-800 hover:border-gray-300'
                  }`}
                >
                  {/* Template Header Preview Box */}
                  <div className="bg-gray-100 dark:bg-slate-800/80 p-5 border-b border-gray-200 dark:border-slate-700 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-full">
                        {t.badge}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/60 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                      {t.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.region}</p>

                    {/* Mini layout illustration */}
                    <div className="mt-4 bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-200/80 dark:border-slate-700 space-y-1.5 shadow-inner">
                      <div className="flex justify-between items-center border-b pb-1">
                        <div className="w-16 h-2 bg-indigo-600 rounded"></div>
                        <div className="w-10 h-2 bg-gray-300 rounded"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded"></div>
                        <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded"></div>
                      </div>
                      <div className="h-6 bg-indigo-50 dark:bg-indigo-950/50 rounded w-full border border-indigo-100 dark:border-indigo-900"></div>
                    </div>
                  </div>

                  {/* Body & Features */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                        {t.desc}
                      </p>
                      <ul className="space-y-1.5">
                        {t.previewFeatures.map((f, idx) => (
                          <li key={idx} className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* TWO ACTION BUTTONS (2 Options as requested) */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplateId(t.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> প্রিভিউ (Preview)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleSelectTemplate(t.id);
                          onNavigate(Tab.INVOICE);
                        }}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isSelected ? 'কাস্টমাইজড (Active)' : 'কাস্টমাইজ ও সিলেক্ট'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: REALISTIC HUMAN SIGNATURE OPTION */}
      {activeTabSection === 'signature' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-600" /> ইনভয়েসে ডিজিটাল সিগনেচার (Human Handwriting Signature)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                এই অপশনটি সিলেক্ট করলেই কেবল ইনভয়েসের নিচে সিগনেচার শো করবে। আপনার নাম টাইপ করলে তা স্বয়ংক্রিয়ভাবে আসল মানুষের হাতের লেখার মতো সিগনেচারে রূপান্তরিত হবে।
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!companyInfo.enableSignature}
                onChange={(e) => updateCompanyInfo({ ...companyInfo, enableSignature: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                ইনভয়েসে সিগনেচার দেখান (Enable Signature on Documents)
              </span>
            </label>

            {companyInfo.enableSignature ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-slate-700 animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      সিগনেচার নাম (Signature Name / Type Name Here):
                    </label>
                    <input
                      type="text"
                      value={companyInfo.signatureText || ''}
                      onChange={(e) => updateCompanyInfo({ ...companyInfo, signatureText: e.target.value })}
                      placeholder="e.g. Oliver Kensington / Arpon Chakrabortty"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">শুধুমাত্র আপনার নাম ইংরেজিতে লিখুন, এটি স্বয়ংক্রিয়ভাবে সিগনেচারে রূপ নেবে।</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      পদবী বা টাইটেল (Title / Designation):
                    </label>
                    <input
                      type="text"
                      value={companyInfo.signatureTitle || 'Authorized Signatory'}
                      onChange={(e) => updateCompanyInfo({ ...companyInfo, signatureTitle: e.target.value })}
                      placeholder="e.g. Authorized Signatory / Managing Director"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Live Signature Preview */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col justify-end items-end relative overflow-hidden shadow-inner min-h-[160px]">
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    লাইভ সিগনেচার প্রিভিউ (Live Document Preview)
                  </span>
                  
                  <div className="w-full max-w-[220px] text-center pt-8">
                    {companyInfo.signatureText ? (
                      <div className="font-signature text-3xl sm:text-4xl text-indigo-950 dark:text-indigo-300 font-bold select-none transform -rotate-3 mb-1">
                        {companyInfo.signatureText}
                      </div>
                    ) : (
                      <div className="text-xs italic text-gray-400 mb-4">
                        (নাম টাইপ করলে এখানে হাতের লেখার সিগনেচার শো করবে)
                      </div>
                    )}
                    <div className="border-t-2 border-gray-400 pt-1.5">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {companyInfo.signatureText || companyInfo.contact || companyInfo.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {companyInfo.signatureTitle || 'Authorized Signatory'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                বর্তমানে সিগনেচার অপশন বন্ধ করা আছে। ইনভয়েসে সিগনেচার দেখাতে উপরের চেকবক্সটিতে ক্লিক করুন।
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT BACKGROUND COLOR */}
      {activeTabSection === 'background' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600" /> ডকুমেন্ট ও পেজ ব্যাকগ্রাউন্ড কালার (Background Color)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ইনভয়েস বা ডকুমেন্টের পেজের ব্যাকগ্রাউন্ড কালার এখান থেকে নির্বাচন করুন। আপনার নির্বাচিত কালার অনুযায়ী ডাউনলোড বা প্রিন্ট হবে।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {BG_COLOR_PRESETS.map(preset => {
              const isSelected = currentBgColor.toLowerCase() === preset.value.toLowerCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateCompanyInfo({ ...companyInfo, documentBgColor: preset.value })}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md font-bold scale-105'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-lg border border-gray-300 shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: preset.value }}
                  >
                    {isSelected && <Check className="w-5 h-5 text-indigo-600 drop-shadow" />}
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 text-center">{preset.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex items-center gap-4">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              কাস্টম কালার পিক করুন (Custom Color):
            </label>
            <input
              type="color"
              value={currentBgColor}
              onChange={(e) => updateCompanyInfo({ ...companyInfo, documentBgColor: e.target.value })}
              className="w-12 h-10 rounded-lg cursor-pointer border border-gray-300 bg-transparent"
            />
            <span className="font-mono text-xs font-bold text-gray-600 dark:text-gray-400 uppercase bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              {currentBgColor}
            </span>
          </div>
        </div>
      )}

      {/* Template Visual Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-400" /> প্রিভিউ: {previewTemplate.name}
                </h3>
                <p className="text-xs text-indigo-200">{previewTemplate.region} - {previewTemplate.desc}</p>
              </div>
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Simulated Visual Preview */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-100 dark:bg-slate-950 flex justify-center">
              <div
                className="w-full max-w-xl rounded-xl shadow-lg border border-gray-200 p-8 space-y-6 text-gray-800"
                style={{ backgroundColor: currentBgColor }}
              >
                {/* Header based on Template */}
                {previewTemplate.id === 'usa' && (
                  <div className="flex justify-between border-b-2 border-indigo-900 pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-indigo-950">COMMERCIAL INVOICE</h2>
                      <p className="text-xs font-bold text-gray-600">Terms: Net 30 Days</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold">{companyInfo.name}</h4>
                      <p className="text-xs text-gray-500">{companyInfo.contact}</p>
                    </div>
                  </div>
                )}

                {previewTemplate.id === 'uk' && (
                  <div className="flex justify-between border-b border-gray-300 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">VAT INVOICE</h2>
                      <p className="text-xs font-mono">Reg No: {companyInfo.regNo || '13988204'}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold">{companyInfo.name}</h4>
                      <p className="text-xs text-gray-500">Sort Code: {companyInfo.sortCode || '40-22-19'}</p>
                    </div>
                  </div>
                )}

                {previewTemplate.id === 'canada' && (
                  <div className="flex justify-between border-b-2 border-red-800 pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-red-950">INVOICE / FACTURE</h2>
                      <p className="text-xs font-mono">Business Number (BN): {companyInfo.regNo || '819283748 RC0001'}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold">{companyInfo.name}</h4>
                    </div>
                  </div>
                )}

                {(previewTemplate.id === 'default' || previewTemplate.id === 'modern') && (
                  <div className="flex justify-between border-b pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">TAX INVOICE</h2>
                      <p className="text-xs text-gray-500">Document No: HOB-2026-805</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold">{companyInfo.name}</h4>
                    </div>
                  </div>
                )}

                {/* Sample items */}
                <div className="py-4">
                  <div className="bg-gray-800 text-white text-xs font-bold px-3 py-2 flex justify-between rounded">
                    <span>Description</span>
                    <span>Total</span>
                  </div>
                  <div className="py-3 px-3 border-b text-xs flex justify-between">
                    <span>Executive Bespoke Table</span>
                    <span className="font-bold">£1,450.00</span>
                  </div>
                  <div className="py-3 px-3 border-b text-xs flex justify-between">
                    <span>Chesterfield Leather Sofa</span>
                    <span className="font-bold">£3,850.00</span>
                  </div>
                </div>

                {/* Totals & Signature */}
                <div className="flex justify-between items-end pt-4">
                  {companyInfo.enableSignature && (
                    <div className="text-center pt-2">
                      <div className="font-signature text-2xl text-indigo-950 font-bold transform -rotate-3">
                        {companyInfo.signatureText || companyInfo.contact}
                      </div>
                      <div className="border-t border-gray-400 mt-1 pt-1 text-[10px] font-bold">
                        {companyInfo.signatureTitle || 'Authorized Signatory'}
                      </div>
                    </div>
                  )}
                  <div className="text-right ml-auto">
                    <p className="text-xs text-gray-500">Amount Due</p>
                    <p className="text-xl font-black text-indigo-900">£5,300.00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t flex justify-end gap-3">
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100"
              >
                বন্ধ করুন (Close)
              </button>
              <button
                onClick={() => {
                  handleSelectTemplate(previewTemplate.id);
                  setPreviewTemplateId(null);
                  onNavigate(Tab.INVOICE);
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
              >
                <Check className="w-4 h-4" /> এই ডিজাইনটি সিলেক্ট ও কাস্টমাইজ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && <BusinessModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
};
export default CompanyProfile;
