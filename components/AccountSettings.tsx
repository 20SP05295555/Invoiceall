
import React, { useState } from 'react';
import { Tab } from '../types.ts';
import { Save, ArrowLeft, Lock, Bell, Shield, Smartphone, Mail, Check, Briefcase, Trash2, Edit, Plus, Sun, Moon, Globe } from 'lucide-react';
import { useData } from '../contexts/DataContext.tsx';
import BusinessModal from './BusinessModal.tsx';
import { CompanyInfo } from '../types.ts';
import { COUNTRY_CURRENCY_OPTIONS } from '../constants.ts';

interface AccountSettingsProps {
  onNavigate: (tab: Tab) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onNavigate }) => {
  const { profiles, activeProfileId, switchProfile, addProfile, removeProfile, updateProfile, isDarkMode, toggleDarkMode, companyInfo, updateCompanyInfo } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotional: false,
    securityAlerts: true,
    sms: false
  });

  const handleSave = () => {
    setIsSaving(true);
    // Profiles are already auto-saved in context, so we just simulate success
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleStartEdit = (id: string) => {
    setEditingProfileId(id);
  };

  const Toggle = ({ label, description, checked, onChange }: any) => (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="pr-4">
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onNavigate(Tab.PROFILE)}
          className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
           <p className="text-gray-500 text-sm">Manage your security and preferences</p>
        </div>
      </div>

      {/* Business Management Section Link */}
      <div className="bg-indigo-50/60 dark:bg-slate-800 rounded-xl p-6 border border-indigo-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shrink-0">
               <Briefcase className="w-6 h-6" />
            </div>
            <div>
               <h2 className="font-bold text-gray-900 dark:text-white text-base">কোম্পানি প্রোফাইল ও ইনভয়েস ডিজাইন (Company Profile)</h2>
               <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">কোম্পানি পরিবর্তন, আন্তর্জাতিক ৩-৪টি ইনভয়েস ডিজাইন (USA/UK/Canada), সিগনেচার ও ব্যাকগ্রাউন্ড কালার সেট করুন।</p>
            </div>
         </div>
         <button 
           onClick={() => onNavigate(Tab.COMPANY_PROFILE)}
           className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition shrink-0"
         >
           Company Profile এ যান →
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Lock className="w-5 h-5" />
             </div>
             <div>
                <h2 className="font-bold text-gray-900">Password & Security</h2>
                <p className="text-xs text-gray-500">Update your login credentials</p>
             </div>
          </div>
          <div className="p-6 space-y-4">
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                <input type="password" placeholder="Enter new password" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
             </div>
             <div className="pt-2">
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">Forgot password?</button>
             </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
             <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Bell className="w-5 h-5" />
             </div>
             <div>
                <h2 className="font-bold text-gray-900">Notification Preferences</h2>
                <p className="text-xs text-gray-500">Choose how we contact you</p>
             </div>
          </div>
          <div className="p-6 flex-1">
             <Toggle 
                label="Order Updates" 
                description="Receive emails about your order status" 
                checked={notifications.orderUpdates}
                onChange={(v: boolean) => setNotifications({...notifications, orderUpdates: v})}
             />
             <Toggle 
                label="Promotional Emails" 
                description="Receive offers and newsletters" 
                checked={notifications.promotional}
                onChange={(v: boolean) => setNotifications({...notifications, promotional: v})}
             />
             <Toggle 
                label="SMS Notifications" 
                description="Get text messages for delivery updates" 
                checked={notifications.sms}
                onChange={(v: boolean) => setNotifications({...notifications, sms: v})}
             />
             <Toggle 
                label="Security Alerts" 
                description="Get notified about account activity" 
                checked={notifications.securityAlerts}
                onChange={(v: boolean) => setNotifications({...notifications, securityAlerts: v})}
             />
          </div>
        </div>
      </div>

      {/* Regional Country & Currency */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Regional Country & Currency</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select country to automatically format financial totals in the matching currency</p>
            </div>
          </div>
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">Active Region & Currency Standard</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Currently set to <span className="font-bold text-gray-900 dark:text-white">{companyInfo.country || 'United Kingdom'}</span> using currency <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{companyInfo.currencyCode || 'GBP'} ({companyInfo.currencySymbol || '£'})</span>.
            </p>
          </div>
          <div className="w-full sm:w-64 shrink-0">
            <select
              value={companyInfo.country || 'United Kingdom'}
              onChange={(e) => {
                const selectedCountry = e.target.value;
                const match = COUNTRY_CURRENCY_OPTIONS.find(c => c.country === selectedCountry);
                updateCompanyInfo({
                  ...companyInfo,
                  country: selectedCountry,
                  currencyCode: match ? match.currencyCode : 'GBP',
                  currencySymbol: match ? match.currencySymbol : '£'
                });
              }}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            >
              {COUNTRY_CURRENCY_OPTIONS.map(opt => (
                <option key={opt.country} value={opt.country}>
                  {opt.country} ({opt.currencyCode} - {opt.currencySymbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* In-App Universal Option & Document Customizer */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">In-App Universal Option Customizer</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add, edit, or customize any document setting or option directly in the app without editing external code</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Document Numbering Prefixes */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Document Number Prefixes ({companyInfo.name})</h3>
            <p className="text-xs text-gray-500 mb-3">Customize how document identification numbers start when generated.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Invoice Prefix</label>
                <input
                  type="text"
                  value={companyInfo.invoicePrefix || 'INV-'}
                  onChange={(e) => updateCompanyInfo({ ...companyInfo, invoicePrefix: e.target.value })}
                  className="w-full mt-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Order Confirmation Prefix</label>
                <input
                  type="text"
                  value={companyInfo.orderPrefix || 'ORD-'}
                  onChange={(e) => updateCompanyInfo({ ...companyInfo, orderPrefix: e.target.value })}
                  className="w-full mt-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Receipt Prefix</label>
                <input
                  type="text"
                  value={companyInfo.receiptPrefix || 'REC-'}
                  onChange={(e) => updateCompanyInfo({ ...companyInfo, receiptPrefix: e.target.value })}
                  className="w-full mt-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick VAT & Delivery Global Options */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Default VAT & Delivery Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(companyInfo.enableVat)}
                    onChange={(e) => updateCompanyInfo({ ...companyInfo, enableVat: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Enable VAT by Default</span>
                </label>
                {companyInfo.enableVat && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Default Rate (%):</span>
                    <input
                      type="number"
                      value={companyInfo.vatRate !== undefined ? companyInfo.vatRate : 20}
                      onChange={(e) => updateCompanyInfo({ ...companyInfo, vatRate: parseFloat(e.target.value) || 0 })}
                      className="w-20 bg-white dark:bg-slate-900 border rounded px-2 py-1 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(companyInfo.enableDelivery)}
                    onChange={(e) => updateCompanyInfo({ ...companyInfo, enableDelivery: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Enable Delivery Fee by Default</span>
                </label>
                {companyInfo.enableDelivery && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Default Fee:</span>
                    <input
                      type="number"
                      value={companyInfo.deliveryCost !== undefined ? companyInfo.deliveryCost : 25}
                      onChange={(e) => updateCompanyInfo({ ...companyInfo, deliveryCost: parseFloat(e.target.value) || 0 })}
                      className="w-20 bg-white dark:bg-slate-900 border rounded px-2 py-1 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance & Interface Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Interface Theme & Lighting</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Optimize visual contrast for furniture design review environments</p>
            </div>
          </div>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">High-Contrast Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch all components to a low-glare dark palette ideal for showroom or workshop reviews.</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-xl font-semibold text-xs transition flex items-center gap-2 ${
              isDarkMode 
                ? 'bg-amber-500 text-gray-950 hover:bg-amber-400' 
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4" /> Active: Dark Theme
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" /> Switch to Dark Theme
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 flex justify-end items-center gap-4">
          {showSuccess && (
             <span className="text-green-600 text-sm font-medium flex items-center gap-1 animate-fade-in">
                <Check className="w-4 h-4" /> Changes saved successfully
             </span>
          )}
          <button 
             onClick={() => onNavigate(Tab.PROFILE)}
             className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
             Cancel
          </button>
          <button 
             onClick={handleSave}
             disabled={isSaving}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 hover:shadow-md'}`}
          >
             {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
      </div>

      <BusinessModal 
        isOpen={isAddModalOpen || !!editingProfileId} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProfileId(null);
        }}
        onSave={(name, info) => {
          if (editingProfileId) {
            updateProfile(editingProfileId, name, info);
          } else {
            addProfile(name, info);
          }
          setIsAddModalOpen(false);
          setEditingProfileId(null);
        }}
        initialData={editingProfileId ? {
          name: profiles.find(p => p.id === editingProfileId)?.name || '',
          info: profiles.find(p => p.id === editingProfileId)?.companyInfo || profiles[0].companyInfo
        } : undefined}
      />
    </div>
  );
};

export default AccountSettings;
