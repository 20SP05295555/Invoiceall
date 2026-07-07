
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { CompanyInfo, Customer, Order, OrderItem, GalleryItem, RecentOrder, SavedDocument, BusinessProfile } from '../types.ts';
import { COMPANY_INFO, CURRENT_CUSTOMER, SAMPLE_ORDER, INITIAL_GALLERY, INITIAL_RECENT_ORDERS, INITIAL_SAVED_DOCUMENTS, extractDocReference, cleanPaymentInstructions } from '../constants.ts';

interface DataContextType {
  // Profiles
  profiles: BusinessProfile[];
  activeProfileId: string;
  activeProfile: BusinessProfile | undefined;
  switchProfile: (id: string, overrideProfile?: BusinessProfile) => void;
  addProfile: (name: string, initialCompanyInfo?: CompanyInfo) => void;
  removeProfile: (id: string) => void;
  updateProfileName: (id: string, name: string) => void;
  updateProfile: (id: string, name: string, info: CompanyInfo) => void;

  // Active Profile Data
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: CompanyInfo) => void;
  customer: Customer;
  updateCustomer: (customer: Customer) => void;
  order: Order;
  updateOrder: (order: Order) => void;
  updateOrderItem: (index: number, field: keyof OrderItem, value: any) => void;
  addOrderItem: (description?: string, price?: number, unit?: string, details?: string[]) => void;
  removeOrderItem: (index: number) => void;
  updateAmountPaid: (amount: number) => void;
  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  removeGalleryItem: (id: string) => void;
  recentOrders: RecentOrder[];
  removeRecentOrder: (id: string) => void;
  savedDocuments: SavedDocument[];
  addSavedDocument: (doc: Omit<SavedDocument, 'id' | 'createdDate'>) => void;
  removeSavedDocument: (id: string) => void;
  bulkUpdate: (data: { companyInfo?: Partial<CompanyInfo>, customer?: Partial<Customer>, order?: Partial<Order> }) => void;
  isAutoSaving: boolean;

  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Currency Helpers
  currencySymbol: string;
  currencyCode: string;
  formatCurrency: (amount: number, digits?: number) => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Failed to load ${key} from storage`, e);
    return fallback;
  }
};

const DEFAULT_PROFILE_ID = 'default-profile';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return loadFromStorage<boolean>('hob_dark_mode', false);
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('hob_dark_mode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Profiles State
  const [profiles, setProfiles] = useState<BusinessProfile[]>(() => {
    const saved = loadFromStorage<BusinessProfile[]>('all_business_profiles', []);
    if (saved.length > 0) {
      // Ensure all profiles have savedDocuments and defaultProducts initialized
      return saved.map(p => ({
        ...p,
        companyInfo: {
          ...p.companyInfo,
          paymentInstructions: cleanPaymentInstructions(p.companyInfo?.paymentInstructions),
          defaultProducts: p.companyInfo?.defaultProducts || (p.companyInfo?.name === 'HOB FURNITURE' ? COMPANY_INFO.defaultProducts : [])
        },
        savedDocuments: p.savedDocuments || INITIAL_SAVED_DOCUMENTS
      }));
    }
    
    // Create initial profile if none exists
    return [{
      id: DEFAULT_PROFILE_ID,
      name: 'Primary Business',
      companyInfo: COMPANY_INFO,
      customer: CURRENT_CUSTOMER,
      order: SAMPLE_ORDER,
      gallery: INITIAL_GALLERY,
      recentOrders: INITIAL_RECENT_ORDERS,
      savedDocuments: INITIAL_SAVED_DOCUMENTS,
      lastUpdated: new Date().toISOString()
    }];
  });

  const [activeProfileId, setActiveProfileId] = useState(() => loadFromStorage('active_profile_id', DEFAULT_PROFILE_ID));

  // Current Profile Data state (individual for reactivity)
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    ...activeProfile.companyInfo,
    paymentInstructions: cleanPaymentInstructions(activeProfile.companyInfo?.paymentInstructions),
    defaultProducts: activeProfile.companyInfo?.defaultProducts || (activeProfile.companyInfo?.name === 'HOB FURNITURE' ? COMPANY_INFO.defaultProducts : [])
  });
  const [customer, setCustomer] = useState<Customer>(activeProfile.customer);
  const [order, setOrder] = useState<Order>(activeProfile.order);
  const [gallery, setGallery] = useState<GalleryItem[]>(activeProfile.gallery);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(activeProfile.recentOrders);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>(activeProfile.savedDocuments || INITIAL_SAVED_DOCUMENTS);
  
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Switch Profile
  const switchProfile = useCallback((id: string, overrideProfile?: BusinessProfile) => {
    const profile = overrideProfile || profiles.find(p => p.id === id);
    if (profile) {
      // First save current to profiles
      setProfiles(prev => prev.map(p => p.id === activeProfileId ? {
        ...p,
        companyInfo, customer, order, gallery, recentOrders, savedDocuments,
        lastUpdated: new Date().toISOString()
      } : p));

      // Then update active ID
      setActiveProfileId(id);
      
      // Then load new data
      setCompanyInfo({
        ...profile.companyInfo,
        paymentInstructions: cleanPaymentInstructions(profile.companyInfo?.paymentInstructions),
        defaultProducts: profile.companyInfo?.defaultProducts || (profile.companyInfo?.name === 'HOB FURNITURE' ? COMPANY_INFO.defaultProducts : [])
      });
      setCustomer(profile.customer);
      setOrder(profile.order);
      setGallery(profile.gallery);
      setRecentOrders(profile.recentOrders);
      setSavedDocuments(profile.savedDocuments || INITIAL_SAVED_DOCUMENTS);
    }
  }, [activeProfileId, companyInfo, customer, order, gallery, recentOrders, savedDocuments, profiles]);

  const addProfile = (name: string, initialCompanyInfo?: CompanyInfo) => {
    const newId = `profile_${Date.now()}`;
    const randNum = `2026-${Math.floor(100+Math.random()*900)}`;
    const newProfile: BusinessProfile = {
      id: newId,
      name,
      companyInfo: initialCompanyInfo || COMPANY_INFO,
      customer: CURRENT_CUSTOMER,
      order: { ...SAMPLE_ORDER, orderNumber: randNum, paymentReference: extractDocReference(randNum), items: [], subtotal: 0, total: 0, amountDue: 0, amountPaid: 0 },
      gallery: [],
      recentOrders: [],
      savedDocuments: INITIAL_SAVED_DOCUMENTS,
      lastUpdated: new Date().toISOString()
    };
    setProfiles(prev => [...prev, newProfile]);
    switchProfile(newId, newProfile);
  };

  const removeProfile = (id: string) => {
    if (profiles.length <= 1) return; // Must have at least one
    const newProfiles = profiles.filter(p => p.id !== id);
    setProfiles(newProfiles);
    if (activeProfileId === id) {
      switchProfile(newProfiles[0].id);
    }
  };

  const updateProfileName = (id: string, name: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const updateProfile = (id: string, name: string, info: CompanyInfo) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, name, companyInfo: info } : p));
    // If it's the active profile, also update the individual state for reactivity
    if (id === activeProfileId) {
      setCompanyInfo(info);
    }
  };

  // Auto-save effect
  useEffect(() => {
    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      // Sync active profile data into profiles array
      const updatedProfiles = profiles.map(p => p.id === activeProfileId ? {
        ...p,
        companyInfo, customer, order, gallery, recentOrders, savedDocuments,
        lastUpdated: new Date().toISOString()
      } : p);

      localStorage.setItem('all_business_profiles', JSON.stringify(updatedProfiles));
      localStorage.setItem('active_profile_id', activeProfileId);
      
      // Legacy support for single profile
      localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
      localStorage.setItem('customer', JSON.stringify(customer));
      localStorage.setItem('order', JSON.stringify(order));
      localStorage.setItem('gallery', JSON.stringify(gallery));
      localStorage.setItem('recentOrders', JSON.stringify(recentOrders));
      localStorage.setItem('savedDocuments', JSON.stringify(savedDocuments));
      
      setIsAutoSaving(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [companyInfo, customer, order, gallery, recentOrders, savedDocuments, activeProfileId, profiles]);

  const calculateTotals = (items: OrderItem[], amountPaid: number, infoOverride?: CompanyInfo) => {
    const activeInfo = infoOverride || companyInfo;
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const tax = activeInfo.enableVat ? (subtotal * (activeInfo.vatRate ?? 20)) / 100 : 0;
    const shipping = activeInfo.enableDelivery ? (activeInfo.deliveryCost ?? 25) : 0;
    const total = subtotal + tax + shipping;
    const amountDue = Math.max(0, total - amountPaid);
    return { subtotal, tax, shipping, total, amountDue };
  };

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
    setOrder(prev => {
      const { subtotal, tax, shipping, total, amountDue } = calculateTotals(prev.items, prev.amountPaid, info);
      return { ...prev, subtotal, tax, shipping, total, amountDue };
    });
  };

  const updateCustomer = (c: Customer) => setCustomer(c);
  const updateOrder = (o: Order) => setOrder(o);

  const updateAmountPaid = (amount: number) => {
      setOrder(prev => {
        const { subtotal, tax, shipping, total, amountDue } = calculateTotals(prev.items, amount);
        return { ...prev, amountPaid: amount, subtotal, tax, shipping, total, amountDue };
      });
  };

  const bulkUpdate = (data: { companyInfo?: Partial<CompanyInfo>, customer?: Partial<Customer>, order?: Partial<Order> }) => {
    if (data.companyInfo) {
      setCompanyInfo(prev => {
        const nextInfo = { ...prev, ...data.companyInfo };
        setOrder(prevOrder => {
          const { subtotal, tax, shipping, total, amountDue } = calculateTotals(prevOrder.items, prevOrder.amountPaid, nextInfo);
          return { ...prevOrder, subtotal, tax, shipping, total, amountDue };
        });
        return nextInfo;
      });
    }
    if (data.customer) setCustomer(prev => ({ ...prev, ...data.customer }));
    if (data.order) {
        setOrder(prev => {
            const merged = { ...prev, ...data.order };
            const { subtotal, tax, shipping, total, amountDue } = calculateTotals(merged.items, merged.amountPaid);
            return { ...merged, subtotal, tax, shipping, total, amountDue };
        });
    }
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    setOrder(prev => {
        const newItems = [...prev.items];
        const item = { ...newItems[index] };
        (item as any)[field] = value;
        if (field === 'quantity' || field === 'price') {
           item.total = Number(item.quantity) * Number(item.price);
        }
        newItems[index] = item;
        const { subtotal, tax, shipping, total, amountDue } = calculateTotals(newItems, prev.amountPaid);
        return { ...prev, items: newItems, subtotal, tax, shipping, total, amountDue };
    });
  };

  const addOrderItem = (description: string = 'New Item', price: number = 0, unit: string = 'each', details: string[] = []) => {
    setOrder(prev => {
        const newItem: OrderItem = {
          id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          description,
          details: details || [],
          quantity: 1,
          unit: unit || 'each',
          price: Number(price) || 0,
          total: Number(price) || 0
        };
        const newItems = [...prev.items, newItem];
        const { subtotal, tax, shipping, total, amountDue } = calculateTotals(newItems, prev.amountPaid);
        return { ...prev, items: newItems, subtotal, tax, shipping, total, amountDue };
    });
  };

  const removeOrderItem = (index: number) => {
    setOrder(prev => {
        const newItems = prev.items.filter((_, i) => i !== index);
        const { subtotal, tax, shipping, total, amountDue } = calculateTotals(newItems, prev.amountPaid);
        return { ...prev, items: newItems, subtotal, tax, shipping, total, amountDue };
    });
  };

  const addGalleryItem = (item: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = { ...item, id: `g_${Date.now()}` };
    setGallery(prev => [newItem, ...prev]);
  };

  const removeGalleryItem = (id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  const removeRecentOrder = (id: string) => {
    setRecentOrders(prev => prev.filter(order => order.id !== id));
  };

  const addSavedDocument = (doc: Omit<SavedDocument, 'id' | 'createdDate'>) => {
    const newDoc: SavedDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setSavedDocuments(prev => [newDoc, ...prev]);
  };

  const removeSavedDocument = (id: string) => {
    setSavedDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const currencySymbol = companyInfo.currencySymbol || '£';
  const currencyCode = companyInfo.currencyCode || 'GBP';

  const formatCurrency = useCallback((amount: number, digits: number = 2) => {
    return `${currencySymbol}${Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })}`;
  }, [currencySymbol]);

  return (
    <DataContext.Provider value={{ 
        profiles, activeProfileId, activeProfile, switchProfile, addProfile, removeProfile, updateProfileName, updateProfile,
        companyInfo, updateCompanyInfo, 
        customer, updateCustomer, 
        order, updateOrder, updateOrderItem,
        addOrderItem, removeOrderItem, updateAmountPaid,
        gallery, addGalleryItem, removeGalleryItem,
        recentOrders, removeRecentOrder,
        savedDocuments, addSavedDocument, removeSavedDocument,
        bulkUpdate,
        isAutoSaving,
        isDarkMode, toggleDarkMode,
        currencySymbol, currencyCode, formatCurrency
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
