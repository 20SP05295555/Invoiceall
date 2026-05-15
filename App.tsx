import React, { useState, useRef } from 'react';
import { Tab } from './types.ts';
import OrderConfirmation from './components/OrderConfirmation.tsx';
import Receipt from './components/Receipt.tsx';
import Invoice from './components/Invoice.tsx';
import EmailConversation from './components/EmailConversation.tsx';
import ProductionGallery from './components/ProductionGallery.tsx';
import UserProfile from './components/UserProfile.tsx';
import AccountSettings from './components/AccountSettings.tsx';
import BusinessModal from './components/BusinessModal.tsx';
import { useData } from './contexts/DataContext.tsx';
import { extractDataFromDocument } from './services/geminiService.ts';
import { FileText, Mail, User, CheckSquare, Menu, X, Settings, FileBox, Camera, Sparkles, Upload, Loader2, Info, ChevronDown, Plus, Briefcase, Edit } from 'lucide-react';
import { CompanyInfo } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CONFIRMATION);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [isEditingActiveProfile, setIsEditingActiveProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { bulkUpdate, profiles, activeProfileId, activeProfile, switchProfile, addProfile, updateProfile } = useData();

  const renderContent = () => {
    switch (activeTab) {
      case Tab.CONFIRMATION:
        return <OrderConfirmation />;
      case Tab.INVOICE:
        return <Invoice />;
      case Tab.RECEIPT:
        return <Receipt />;
      case Tab.EMAIL:
        return <EmailConversation />;
      case Tab.GALLERY:
        return <ProductionGallery />;
      case Tab.PROFILE:
        return <UserProfile onNavigate={setActiveTab} />;
      case Tab.SETTINGS:
        return <AccountSettings onNavigate={setActiveTab} />;
      default:
        return <OrderConfirmation />;
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
      console.error("Import failed", err);
      alert("Magic Import failed. Please check your API key and try again.");
      setIsImporting(false);
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
          ? 'bg-gray-900 text-white shadow-md'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex bg-[#f3f4f6]">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-10 print:hidden">
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-2xl font-black tracking-tighter text-gray-900">HOB<span className="text-gray-400">.PORTAL</span></h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Multi-Business Dashboard</p>
        </div>

        {/* Profile Switcher */}
        <div className="px-6 py-4">
           <div className="relative">
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-full flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group/profile"
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
                       <div className="flex items-center gap-1.5 font-bold text-gray-900">
                          <p className="text-xs truncate">{activeProfile?.name}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditingActiveProfile(true);
                            }}
                            className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-indigo-600 transition-colors"
                            aria-label="Edit business profile"
                          >
                             <Edit className="w-3 h-3" />
                          </button>
                       </div>
                       <p className="text-[10px] text-gray-500">Active Business</p>
                    </div>
                 </div>
                 <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileMenuOpen && (
                 <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto py-2">
                       {profiles.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                               switchProfile(p.id);
                               setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${p.id === activeProfileId ? 'bg-indigo-50/50' : ''}`}
                          >
                             <div className={`w-2 h-2 rounded-full ${p.id === activeProfileId ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
                             <span className={`text-sm truncate ${p.id === activeProfileId ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{p.name}</span>
                          </button>
                       ))}
                    </div>
                    <button 
                      onClick={() => {
                        handleNewProfile();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100 text-indigo-600 hover:text-indigo-800 font-bold text-xs"
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
             className="w-full flex items-center justify-center gap-2 p-3 mb-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-md shadow-indigo-100 active:scale-95 group"
          >
             <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
             <span>Upload Document</span>
          </button>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2 px-4">Documents</div>
          <NavItem tab={Tab.CONFIRMATION} label="Order Confirmation" icon={CheckSquare} />
          <NavItem tab={Tab.INVOICE} label="Invoice" icon={FileBox} />
          <NavItem tab={Tab.RECEIPT} label="Receipt" icon={FileText} />
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-4">Tracking</div>
          <NavItem tab={Tab.GALLERY} label="Production Gallery" icon={Camera} />
          <NavItem tab={Tab.EMAIL} label="Email Thread" icon={Mail} />
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-4">Account</div>
          <NavItem tab={Tab.PROFILE} label="User Profile" icon={User} />
          <NavItem tab={Tab.SETTINGS} label="Account Settings" icon={Settings} />
        </nav>
        
        <div className="p-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Support line</p>
                <p className="text-sm font-bold text-gray-900">+44 1865 241971</p>
                <p className="text-[10px] text-gray-400">Mon-Fri 9am-5pm BST</p>
            </div>
        </div>
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
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-20 border-b border-gray-200 px-4 py-4 flex justify-between items-center shadow-sm print:hidden">
         <h1 className="text-xl font-black tracking-tighter text-gray-900">HOB<span className="text-gray-400">.PORTAL</span></h1>
         <div className="flex items-center gap-4">
            <button onClick={() => fileInputRef.current?.click()} className="text-indigo-600 p-1">
                <Upload className="w-6 h-6" />
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>
         </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-10 pt-20 px-6 space-y-2 print:hidden overflow-y-auto pb-12">
            <NavItem tab={Tab.CONFIRMATION} label="Order Confirmation" icon={CheckSquare} />
            <NavItem tab={Tab.INVOICE} label="Invoice" icon={FileBox} />
            <NavItem tab={Tab.RECEIPT} label="Receipt" icon={FileText} />
            <NavItem tab={Tab.GALLERY} label="Production Gallery" icon={Camera} />
            <NavItem tab={Tab.EMAIL} label="Email Thread" icon={Mail} />
            <NavItem tab={Tab.PROFILE} label="User Profile" icon={User} />
            <NavItem tab={Tab.SETTINGS} label="Account Settings" icon={Settings} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-12 mt-16 lg:mt-0 overflow-y-auto min-h-screen print:ml-0 print:p-0 print:mt-0 print:h-auto print:overflow-visible">
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