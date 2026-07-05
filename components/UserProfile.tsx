
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { Tab } from '../types.ts';
import { 
  Package, MapPin, CreditCard, Bell, Settings, LogOut, 
  ChevronRight, Edit2, Save, Phone, Mail, Camera, 
  Loader2, Trash2, Image as ImageIcon, CheckCircle, X, User, Plus 
} from 'lucide-react';

interface UserProfileProps {
  onNavigate: (tab: Tab) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onNavigate }) => {
  const { customer, updateCustomer, order, addGalleryItem, recentOrders, removeRecentOrder, companyInfo, updateCompanyInfo } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [editData, setEditData] = useState(customer);
  const [editBusinessData, setEditBusinessData] = useState(companyInfo);
  const [isCapturing, setIsCapturing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEditing = () => {
    setEditData({ ...customer });
    setIsEditing(true);
  };

  const startEditingBusiness = () => {
    setEditBusinessData({ ...companyInfo });
    setIsEditingBusiness(true);
  };

  const handleSave = () => {
    updateCustomer(editData);
    setIsEditing(false);
  };

  const handleSaveBusiness = () => {
    updateCompanyInfo(editBusinessData);
    setIsEditingBusiness(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleCancelBusiness = () => {
    setIsEditingBusiness(false);
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddr = [...editData.address];
    newAddr[index] = value;
    setEditData({ ...editData, address: newAddr });
  };

  const handleBusinessAddressChange = (index: number, value: string) => {
    const newAddr = [...editBusinessData.address];
    newAddr[index] = value;
    setEditBusinessData({ ...editBusinessData, address: newAddr });
  };

  const handleFullPageCapture = async () => {
    // Check if html2canvas is available
    if (!(window as any).html2canvas) {
      alert("Capture utility is still loading. Please wait a second and try again.");
      return;
    }

    setIsCapturing(true);
    // Brief delay to allow UI to settle and hide capture button if needed
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const element = document.body;
      // @ts-ignore
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f3f4f6',
        ignoreElements: (el: any) => el.classList.contains('print-hidden')
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      addGalleryItem({
        url: imgData,
        caption: `Portal Snapshot - ${customer.name}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: 'capture'
      });

      const link = document.createElement('a');
      link.download = `HOB-Snapshot-${Date.now()}.jpg`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error("Full page capture failed", err);
      alert("Failed to take screenshot. This might be due to security restrictions on some images.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDeleteOrder = (id: string) => {
    setDeletingId(id);
    // Add a tiny delay for visual effect of "disappearing"
    setTimeout(() => {
      removeRecentOrder(id);
      setDeletingId(null);
    }, 300);
  };

  const EditableInput = ({ value, onChange, label, className = "" }: any) => (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-colors ${className}`}
      />
    </div>
  );

  const activeBankInfo = isEditingBusiness ? editBusinessData : companyInfo;
  const isIbanShown = activeBankInfo.showIban !== undefined ? activeBankInfo.showIban : (Boolean(activeBankInfo.iban) || !activeBankInfo.routingNo);
  const isRoutingShown = activeBankInfo.showRoutingNo !== undefined ? activeBankInfo.showRoutingNo : (Boolean(activeBankInfo.routingNo) && !activeBankInfo.iban);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Profile Header */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
         
         <div className="relative flex flex-col items-center gap-3">
            <div className="relative">
                <img 
                    src={customer.avatarUrl} 
                    alt="Profile" 
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
                />
                {!isEditing && (
                    <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                )}
            </div>
            {isEditing && (
                <div className="w-full max-w-[150px]">
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                            <Camera className="w-3 h-3 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={editData.avatarUrl}
                            onChange={(e) => setEditData({...editData, avatarUrl: e.target.value})}
                            placeholder="Image URL"
                            className="block w-full p-1.5 pl-7 text-xs text-gray-900 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                </div>
            )}
         </div>
         
         <div className="text-center md:text-left flex-1 w-full">
            {isEditing ? (
                <div className="grid gap-4 max-w-lg">
                    <EditableInput label="Full Name" value={editData.name} onChange={(v: string) => setEditData({...editData, name: v})} className="font-bold text-lg" />
                    <EditableInput label="Email" value={editData.email} onChange={(v: string) => setEditData({...editData, email: v})} />
                </div>
            ) : (
                <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{customer.name}</h1>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-500 text-sm">
                        <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {customer.email}</span>
                        <span className="hidden md:inline">•</span>
                        <span>Customer #{customer.id}</span>
                    </div>
                </>
            )}
         </div>

         <div className="flex flex-col sm:flex-row gap-3 print-hidden">
             {isEditing ? (
                 <>
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm">
                        <Save className="w-4 h-4" /> Save
                    </button>
                    <button onClick={handleCancel} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
                        <X className="w-4 h-4" /> Cancel
                    </button>
                 </>
             ) : (
                 <>
                    <button 
                      onClick={handleFullPageCapture} 
                      disabled={isCapturing} 
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all disabled:opacity-50"
                    >
                        {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />} Snapshot
                    </button>
                    <button onClick={() => onNavigate(Tab.SETTINGS)} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm">
                        <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button onClick={startEditing} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
                        <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                 </>
             )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3 text-blue-600">
                <Package className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900 text-sm">Active Order</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">#{order.orderNumber}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3 text-green-600">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900 text-sm">Total Spent</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">£{order.total.toFixed(2)}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3 text-purple-600">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900 text-sm">Updates</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">3</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-900">Recent Orders</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all history</button>
            </div>
            <div className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 bg-gray-50/20">
                        <div className="mb-2 flex justify-center"><Package className="w-8 h-8 opacity-20" /></div>
                        No recent orders to show.
                    </div>
                ) : (
                    recentOrders.map((ro) => (
                        <div 
                          key={ro.id} 
                          className={`p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all group relative ${deletingId === ro.id ? 'opacity-0 scale-95 duration-300' : 'opacity-100 scale-100'}`}
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-transparent group-hover:border-gray-200 group-hover:bg-white transition-all">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate pr-4">{ro.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <span>Order #{ro.orderNumber}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>{ro.date}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-3">
                                <span className={`hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${ro.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {ro.status}
                                </span>
                                
                                <div className="flex items-center">
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteOrder(ro.id);
                                        }}
                                        className="p-4 sm:p-3 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full transition-all active:scale-90 active:bg-red-100 flex items-center justify-center group/del"
                                        title="Delete order instantly"
                                        aria-label="Delete order"
                                    >
                                        <Trash2 className="w-6 h-6 sm:w-5 sm:h-5 transition-transform group-hover/del:scale-110" />
                                    </button>
                                    <ChevronRight className="w-5 h-5 text-gray-300 hidden sm:block" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Business Information</h3>
                {isEditingBusiness ? (
                  <div className="flex gap-2">
                    <button onClick={handleSaveBusiness} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Save">
                        <Save className="w-4 h-4" />
                    </button>
                    <button onClick={handleCancelBusiness} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                        <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={startEditingBusiness} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                  </button>
                )}
            </div>
            <div className="p-6 space-y-6">
                <div>
                     <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Business Name
                     </div>
                     {isEditingBusiness ? (
                         <EditableInput value={editBusinessData.name} onChange={(v: string) => setEditBusinessData({...editBusinessData, name: v})} />
                     ) : (
                         <p className="text-gray-900 font-bold pl-6 uppercase">{companyInfo.name}</p>
                     )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                      <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <User className="w-3.5 h-3.5 text-indigo-400" /> Contact Person
                      </div>
                      {isEditingBusiness ? (
                          <EditableInput value={editBusinessData.contact} onChange={(v: string) => setEditBusinessData({...editBusinessData, contact: v})} />
                      ) : (
                          <p className="text-gray-900 font-medium pl-6">{companyInfo.contact}</p>
                      )}
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <Settings className="w-3.5 h-3.5 text-indigo-400" /> Co. Reg. No.
                      </div>
                      {isEditingBusiness ? (
                          <EditableInput value={editBusinessData.regNo} onChange={(v: string) => setEditBusinessData({...editBusinessData, regNo: v})} />
                      ) : (
                          <p className="text-gray-900 font-medium pl-6">{companyInfo.regNo}</p>
                      )}
                  </div>
                  <div>
                      <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <Settings className="w-3.5 h-3.5 text-indigo-400" /> VAT Number
                      </div>
                      {isEditingBusiness ? (
                          <EditableInput value={editBusinessData.vatNo || ''} onChange={(v: string) => setEditBusinessData({...editBusinessData, vatNo: v})} />
                      ) : (
                          <p className="text-gray-900 font-medium pl-6">{companyInfo.vatNo || 'N/A'}</p>
                      )}
                  </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" /> Business Email & Web
                    </div>
                    <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isEditingBusiness ? (
                             <>
                                <EditableInput value={editBusinessData.email} onChange={(v: string) => setEditBusinessData({...editBusinessData, email: v})} placeholder="Business Email" />
                                <EditableInput value={editBusinessData.website} onChange={(v: string) => setEditBusinessData({...editBusinessData, website: v})} placeholder="Website" />
                             </>
                        ) : (
                            <>
                              <p className="text-gray-700 text-sm">{companyInfo.email}</p>
                              <p className="text-gray-700 text-sm">{companyInfo.website}</p>
                            </>
                        )}
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Registered Address
                    </div>
                    <div className="pl-6 space-y-1">
                        {isEditingBusiness ? (
                             <div className="space-y-2">
                                {editBusinessData.address.map((line, i) => (
                                    <div key={`bus-addr-edit-${i}`} className="flex gap-2">
                                      <input value={line} onChange={(e) => handleBusinessAddressChange(i, e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg p-2" />
                                      <button onClick={() => {
                                        const newAddr = editBusinessData.address.filter((_, idx) => idx !== i);
                                        setEditBusinessData({ ...editBusinessData, address: newAddr });
                                      }} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={() => setEditBusinessData({ ...editBusinessData, address: [...editBusinessData.address, ""] })} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Address Line</button>
                             </div>
                        ) : (
                            companyInfo.address.map((line, i) => <p key={`bus-addr-view-${i}`} className="text-gray-700 text-sm">{line}</p>)
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Bank Details
                        </div>
                    </div>
                    
                    <div className="pl-6 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Bank Name</label>
                                {isEditingBusiness ? (
                                    <EditableInput value={editBusinessData.bankName || ''} onChange={(v: string) => setEditBusinessData({...editBusinessData, bankName: v})} />
                                ) : (
                                    <p className="text-gray-900 text-sm font-medium">{companyInfo.bankName || 'Not Set'}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[10px] text-gray-400">Routing Number</label>
                                        {isEditingBusiness ? (
                                            <label className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isRoutingShown} 
                                                    onChange={() => {
                                                        if (!isRoutingShown) {
                                                            setEditBusinessData(prev => ({ ...prev, showRoutingNo: true, showIban: false }));
                                                        } else {
                                                            setEditBusinessData(prev => ({ ...prev, showRoutingNo: false }));
                                                        }
                                                    }}
                                                    className="w-3.5 h-3.5 text-indigo-600 rounded border-gray-300 cursor-pointer"
                                                />
                                                <span>Show on Document</span>
                                            </label>
                                        ) : (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isRoutingShown ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {isRoutingShown ? 'Shown on Doc' : 'Hidden on Doc'}
                                            </span>
                                        )}
                                    </div>
                                    {isEditingBusiness ? (
                                        <EditableInput value={editBusinessData.routingNo || ''} onChange={(v: string) => setEditBusinessData({...editBusinessData, routingNo: v})} />
                                    ) : (
                                        <p className="text-gray-900 text-sm font-medium">{companyInfo.routingNo || 'Not Set'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-400 mb-1">Sort Code</label>
                                    {isEditingBusiness ? (
                                        <EditableInput value={editBusinessData.sortCode || ''} onChange={(v: string) => setEditBusinessData({...editBusinessData, sortCode: v})} />
                                    ) : (
                                        <p className="text-gray-900 text-sm font-medium">{companyInfo.sortCode || 'Not Set'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] text-gray-400 mb-1">Account No.</label>
                                    {isEditingBusiness ? (
                                        <EditableInput value={editBusinessData.accountNo || ''} onChange={(v: string) => setEditBusinessData({...editBusinessData, accountNo: v})} />
                                    ) : (
                                        <p className="text-gray-900 text-sm font-medium">{companyInfo.accountNo || 'Not Set'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-400 mb-1">SWIFT / BIC</label>
                                    {isEditingBusiness ? (
                                        <EditableInput value={editBusinessData.swift || ''} onChange={(v: string) => setEditBusinessData({...editBusinessData, swift: v})} />
                                    ) : (
                                        <p className="text-gray-900 text-sm font-medium">{companyInfo.swift || 'Not Set'}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-[10px] text-gray-400">IBAN</label>
                                    {isEditingBusiness ? (
                                        <label className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={isIbanShown} 
                                                onChange={() => {
                                                    if (!isIbanShown) {
                                                        setEditBusinessData(prev => ({ ...prev, showIban: true, showRoutingNo: false }));
                                                    } else {
                                                        setEditBusinessData(prev => ({ ...prev, showIban: false }));
                                                    }
                                                }}
                                                className="w-3.5 h-3.5 text-indigo-600 rounded border-gray-300 cursor-pointer"
                                            />
                                            <span>Show on Document</span>
                                        </label>
                                    ) : (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isIbanShown ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {isIbanShown ? 'Shown on Doc' : 'Hidden on Doc'}
                                        </span>
                                    )}
                                </div>
                                {isEditingBusiness ? (
                                    <EditableInput value={editBusinessData.iban || ''} onChange={(v: string) => setEditBusinessData({...editBusinessData, iban: v})} />
                                ) : (
                                    <p className="text-gray-900 text-sm font-mono">{companyInfo.iban || 'Not Set'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                 <button className="w-full flex items-center justify-center gap-2 text-red-600 text-xs font-bold hover:text-red-700 py-3 rounded-lg transition-colors">
                     <LogOut className="w-4 h-4" /> Sign Out
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
