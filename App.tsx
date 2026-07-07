import React, { useState, useRef } from 'react';
import { Tab } from './types.ts';
import OrderConfirmation from './components/OrderConfirmation.tsx';
import Receipt from './components/Receipt.tsx';
import Invoice from './components/Invoice.tsx';
import EmailConversation from './components/EmailConversation.tsx';
import ProductionGallery from './components/ProductionGallery.tsx';
import UserProfile from './components/UserProfile.tsx';
import AccountSettings from './components/AccountSettings.tsx';
import CompanyProfile from './components/CompanyProfile.tsx';
import BusinessModal from './components/BusinessModal.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { DocumentArchive } from './components/DocumentArchive.tsx';
import { useData } from './contexts/DataContext.tsx';
import { extractDataFromDocument } from './services/geminiService.ts';
import { FileText, Mail, User, CheckSquare, Menu, X, Settings, FileBox, Camera, Sparkles, Upload, Loader2, Info, ChevronDown, Plus, Briefcase, Edit, Sun, Moon, Search, BarChart3, FolderOpen } from 'lucide-react';
import { CompanyInfo } from './types.ts';
import { INITIAL_EMAILS } from './constants.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [isEditingActiveProfile, setIsEditingActiveProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { bulkUpdate, profiles, activeProfileId, activeProfile, switchProfile, addProfile, updateProfile, order, savedDocuments, gallery, isDarkMode, toggleDarkMode, currencySymbol, formatCurrency } = useData();

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard onNavigateToTab={setActiveTab} />;
      case Tab.CONFIRMATION:
        return <OrderConfirmation />;
      case Tab.INVOICE:
        return <Invoice />;
      case Tab.RECEIPT:
        return <Receipt />;
      case Tab.DOCUMENTS:
        return <DocumentArchive onNavigateToTab={setActiveTab} />;
      case Tab.EMAIL:
        return <EmailConversation />;
      case Tab.GALLERY:
        return <ProductionGallery />;
      case Tab.PROFILE:
        return <UserProfile onNavigate={setActiveTab} />;
      case Tab.SETTINGS:
        return <AccountSettings onNavigate={setActiveTab} />;
      case Tab.COMPANY_PROFILE:
        return <CompanyProfile onNavigate={setActiveTab} />;
      default:
        return <Dashboard onNavigateToTab={setActiveTab} />;
    }
  };

  const handleNewProfile = () => {
    setIsAddBusinessModalOpen(true);
  };

  const handleSaveNewBusiness = (name: string, info: CompanyInfo) => {
    addProfile(name, info);
    setIsAddBusinessModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStep('Reading file...');

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      setImportStep('AI is analyzing document structure...');
      const data = await extractDataFromDocument(base64, file.type);
      
      setImportStep('Hydrating portal state...');
      bulkUpdate(data);
      
      setImportStep('Finalizing...');
      setTimeout(() => {
        setIsImporting(false);
        setActiveTab(Tab.INVOICE); // Switch to invoice so they can see results
        setImportStep('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 500);

    } catch (err) {
      console.warn("Direct import encountered an issue, loading simulated AI extraction:", err);
      try {
        const data = await extractDataFromDocument('', file.type);
        bulkUpdate(data);
        setActiveTab(Tab.INVOICE);
      } catch (fallbackErr) {
        console.error("Fallback error", fallbackErr);
      }
      setIsImporting(false);
      setImportStep('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const NavItem = ({ tab, label, icon: Icon }: { tab: Tab; label: string; icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
        activeTab === tab
          ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  // Search filter helper
  const searchResults = searchQuery.trim() ? [
    ...(order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || order.items.some(i => i.description.toLowerCase().includes(searchQuery.toLowerCase())) ? [{ id: 'active-ord', title: `Active Order: ${order.orderNumber}`, type: 'Order', tab: Tab.CONFIRMATION, subtext: order.items[0]?.description || 'Order items' }] : []),
    ...savedDocuments.filter(d => d.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) || d.title.toLowerCase().includes(searchQuery.toLowerCase())).map(d => ({ id: d.id, title: `${d.documentNumber}: ${d.title}`, type: 'Vault Doc', tab: Tab.DOCUMENTS, subtext: `${formatCurrency(d.amount)} - ${d.customerName}` })),
    ...INITIAL_EMAILS.filter(e => e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || e.body.toLowerCase().includes(searchQuery.toLowerCase())).map(e => ({ id: e.id, title: e.subject, type: 'Email Thread', tab: Tab.EMAIL, subtext: `From ${e.from} (${e.date})` })),
    ...gallery.filter(g => g.caption.toLowerCase().includes(searchQuery.toLowerCase())).map(g => ({ id: g.id, title: g.caption, type: 'Gallery Image', tab: Tab.GALLERY, subtext: g.date }))
  ] : [];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen fixed top-0 left-0 z-10 print:hidden transition-colors duration-200">
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-2xl font-black tracking-tighter text-gray-900">HOB<span className="text-gray-400">.PORTAL</span></h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Multi-Business Dashboard</p>
        </div>

        {/* Profile Switcher */}
        <div className="px-6 py-4">
           <div className="relative">
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-full flex items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group/profile"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                  }
                }}
              >
                 <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
                       <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="text-left overflow-hidden">
                       <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                          <p className="text-xs truncate">{activeProfile?.name}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditingActiveProfile(true);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            aria-label="Edit business profile"
                          >
                             <Edit className="w-3 h-3" />
                          </button>
                       </div>
                       <p className="text-[10px] text-gray-500 dark:text-gray-400">Active Business</p>
                    </div>
                 </div>
                 <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileMenuOpen && (
                 <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto py-2">
                       {profiles.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                               switchProfile(p.id);
                               setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${p.id === activeProfileId ? 'bg-indigo-50/50 dark:bg-indigo-900/30' : ''}`}
                          >
                             <div className={`w-2 h-2 rounded-full ${p.id === activeProfileId ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-transparent'}`}></div>
                             <span className={`text-sm truncate ${p.id === activeProfileId ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{p.name}</span>
                          </button>
                       ))}
                    </div>
                    <button 
                      onClick={() => {
                        handleNewProfile();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-bold text-xs"
                    >
                       <Plus className="w-3.5 h-3.5" />
                       Add New Business
                    </button>
                 </div>
              )}
           </div>
        </div>
        
        <div className="px-6 py-2">
           <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full relative group bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-xl shadow-lg hover:shadow-indigo-200 hover:-translate-y-1 transition-all overflow-hidden"
           >
              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative flex flex-col items-center text-center gap-2">
                 <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                 </div>
                 <div className="text-white">
                    <p className="font-bold text-sm tracking-tight">Magic Import</p>
                    <p className="text-[10px] text-indigo-100 opacity-80">Upload PDF/Image to populate</p>
                 </div>
              </div>
           </button>
           <input 
              ref={fileInputRef}
              type="file" 
              accept="application/pdf,image/*" 
              className="hidden" 
              onChange={handleFileUpload}
           />
        </div>

        <nav className="flex-1 p-6 pt-0 space-y-1 overflow-y-auto">
          <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-full flex items-center justify-center gap-2 p-3 mb-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-md shadow-indigo-100 active:scale-95 group"
          >
             <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
             <span>Upload Document</span>
          </button>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2 px-4">Overview</div>
          <NavItem tab={Tab.DASHBOARD} label="Analytics Dashboard" icon={BarChart3} />

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Documents</div>
          <NavItem tab={Tab.CONFIRMATION} label="Order Confirmation" icon={CheckSquare} />
          <NavItem tab={Tab.INVOICE} label="Invoice" icon={FileBox} />
          <NavItem tab={Tab.RECEIPT} label="Receipt" icon={FileText} />
          <NavItem tab={Tab.DOCUMENTS} label="Document Vault" icon={FolderOpen} />
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-4">Tracking</div>
          <NavItem tab={Tab.GALLERY} label="Production Gallery" icon={Camera} />
          <NavItem tab={Tab.EMAIL} label="Email Thread" icon={Mail} />
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-4">Account</div>
          <NavItem tab={Tab.PROFILE} label="User Profile" icon={User} />
          <NavItem tab={Tab.SETTINGS} label="Account Settings" icon={Settings} />
          <NavItem tab={Tab.COMPANY_PROFILE} label="Company Profile" icon={Briefcase} />
        </nav>
        

      </aside>

      {/* Loading Overlay for Import */}
      {isImporting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                  <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Magic in Progress</h3>
                      <p className="text-sm text-gray-500 font-medium">{importStep}</p>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg text-left">
                      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-blue-700 leading-relaxed">Gemini AI is parsing your document and mapping it to the portal fields. All extracted data will be editable once finished.</p>
                  </div>
              </div>
          </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white dark:bg-slate-900 z-20 border-b border-gray-200 dark:border-slate-800 px-4 py-4 flex justify-between items-center shadow-sm print:hidden transition-colors">
         <h1 className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">HOB<span className="text-gray-400">.PORTAL</span></h1>
         <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode} 
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="text-indigo-600 dark:text-indigo-400 p-1">
                <Upload className="w-6 h-6" />
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
            </button>
         </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-slate-900 z-10 pt-20 px-6 space-y-2 print:hidden overflow-y-auto pb-12 transition-colors">
            <NavItem tab={Tab.DASHBOARD} label="Analytics Dashboard" icon={BarChart3} />
            <NavItem tab={Tab.CONFIRMATION} label="Order Confirmation" icon={CheckSquare} />
            <NavItem tab={Tab.INVOICE} label="Invoice" icon={FileBox} />
            <NavItem tab={Tab.RECEIPT} label="Receipt" icon={FileText} />
            <NavItem tab={Tab.DOCUMENTS} label="Document Vault" icon={FolderOpen} />
            <NavItem tab={Tab.GALLERY} label="Production Gallery" icon={Camera} />
            <NavItem tab={Tab.EMAIL} label="Email Thread" icon={Mail} />
            <NavItem tab={Tab.PROFILE} label="User Profile" icon={User} />
            <NavItem tab={Tab.SETTINGS} label="Account Settings" icon={Settings} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-4 sm:p-6 lg:p-8 mt-16 md:mt-0 overflow-y-auto min-h-screen print:ml-0 print:p-0 print:mt-0 print:h-auto print:overflow-visible transition-colors duration-200">
        {/* Top Global Navigation / Search Bar */}
        <header className="max-w-7xl mx-auto mb-6 bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden transition-colors">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, docs, email keywords across profile..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* Search Dropdown Results */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 sm:w-[450px] top-full mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                <div className="p-2.5 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Search Results ({searchResults.length})
                  </span>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕ Close
                  </button>
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    No orders, documents, or email threads matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {searchResults.map(res => (
                      <div
                        key={res.id}
                        onClick={() => {
                          setActiveTab(res.tab);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-3 hover:bg-blue-50/60 dark:hover:bg-slate-800 cursor-pointer transition flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                              {res.type}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {res.title}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-sm">
                            {res.subtext}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 shrink-0 self-center">
                          Jump →
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold border border-gray-200 dark:border-slate-700 transition"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" /> Dark Mode
                </>
              )}
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto print:max-w-none">
             {renderContent()}
        </div>
      </main>

      <BusinessModal 
        isOpen={isAddBusinessModalOpen || isEditingActiveProfile} 
        onClose={() => {
          setIsAddBusinessModalOpen(false);
          setIsEditingActiveProfile(false);
        }}
        onSave={(name, info) => {
          if (isEditingActiveProfile && activeProfile) {
            updateProfile(activeProfile.id, name, info);
          } else {
            addProfile(name, info);
          }
          setIsAddBusinessModalOpen(false);
          setIsEditingActiveProfile(false);
        }}
        initialData={isEditingActiveProfile && activeProfile ? {
          name: activeProfile.name,
          info: activeProfile.companyInfo
        } : undefined}
      />
    </div>
  );
};

export default App;