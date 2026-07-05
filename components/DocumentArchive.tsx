import React, { useState } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { SavedDocument, Tab } from '../types.ts';
import { Search, FileText, Trash2, ExternalLink, Plus, Filter, Calendar, DollarSign, Tag, CheckCircle2, Shield, FolderOpen } from 'lucide-react';

interface DocumentArchiveProps {
  onNavigateToTab?: (tab: Tab) => void;
}

export const DocumentArchive: React.FC<DocumentArchiveProps> = ({ onNavigateToTab }) => {
  const { savedDocuments, removeSavedDocument, addSavedDocument, order, customer, companyInfo } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<SavedDocument | null>(null);
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);

  // New manual archive entry state
  const [newDocNum, setNewDocNum] = useState(`ARCH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newTitle, setNewTitle] = useState('Custom Archive Document');
  const [newType, setNewType] = useState<SavedDocument['type']>('confirmation');
  const [newNotes, setNewNotes] = useState('');
  const [newTags, setNewTags] = useState('saved, manual');

  const filteredDocs = savedDocuments.filter(doc => {
    const matchesFilter = selectedFilter === 'all' || doc.type === selectedFilter;
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      doc.documentNumber.toLowerCase().includes(searchLower) ||
      doc.title.toLowerCase().includes(searchLower) ||
      doc.customerName.toLowerCase().includes(searchLower) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchLower)) ||
      (doc.tags && doc.tags.some(t => t.toLowerCase().includes(searchLower)));
    return matchesFilter && matchesSearch;
  });

  const handleCreateArchive = (e: React.FormEvent) => {
    e.preventDefault();
    addSavedDocument({
      documentNumber: newDocNum.trim() || 'DOC-000',
      title: newTitle.trim() || 'Untitled Document',
      type: newType,
      amount: order.total || 0,
      customerName: customer.name || 'Customer',
      itemsCount: order.items.length || 1,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      notes: newNotes.trim() || 'Saved manual snapshot to document archive.',
      snapshotData: {
        order: { ...order },
        customer: { ...customer },
        companyInfo: { ...companyInfo }
      }
    });
    setIsCreatingModalOpen(false);
    setNewDocNum(`ARCH-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const getBadgeColor = (type: SavedDocument['type']) => {
    switch (type) {
      case 'invoice': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'confirmation': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'receipt': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'quote': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Document Archive Vault
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Search, retrieve, and manage all your saved order confirmations, invoices, and payment receipts by document number.
          </p>
        </div>
        <button
          onClick={() => setIsCreatingModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Save New Document
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-slate-800 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Document Number (e.g. INV-2026-376, HOB-2026-376), title, customer, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold uppercase text-gray-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Type:
          </span>
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'confirmation', label: 'Order Confirmations' },
            { id: 'invoice', label: 'Invoices' },
            { id: 'receipt', label: 'Receipts' },
            { id: 'quote', label: 'Quotes / Custom' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No matching documents found</h3>
            <p className="text-sm max-w-md mx-auto">
              We couldn't find any saved documents matching "{searchTerm}". Try searching for another document number or adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Document Number</th>
                  <th className="px-6 py-4">Title & Type</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-sm">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {doc.documentNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{doc.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${getBadgeColor(doc.type)}`}>
                          {doc.type}
                        </span>
                        {doc.tags && doc.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            <Tag className="w-2.5 h-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                      {doc.customerName}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {doc.createdDate}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      £{doc.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => removeSavedDocument(doc.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Delete from archive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Document Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded">
                  {selectedDoc.documentNumber}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl text-sm">
              <div>
                <span className="text-xs text-gray-400 uppercase">Document Type</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize mt-0.5">{selectedDoc.type}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase">Archive Date</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{selectedDoc.createdDate}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase">Customer Name</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{selectedDoc.customerName}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase">Total Amount</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">£{selectedDoc.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {selectedDoc.notes && (
              <div className="bg-blue-50/50 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700 p-4 rounded-xl">
                <span className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">Document Notes</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{selectedDoc.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Close
              </button>
              {onNavigateToTab && (
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    if (selectedDoc.type === 'invoice') onNavigateToTab(Tab.INVOICE);
                    else if (selectedDoc.type === 'receipt') onNavigateToTab(Tab.RECEIPT);
                    else onNavigateToTab(Tab.CONFIRMATION);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-4 h-4" /> Open Active Layout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Manual Document Modal */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Save Document to Archive
            </h3>

            <form onSubmit={handleCreateArchive} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Document Number *
                </label>
                <input
                  type="text"
                  required
                  value={newDocNum}
                  onChange={(e) => setNewDocNum(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. INV-2026-999 or ORD-1029"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Document Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    <option value="confirmation">Order Confirmation</option>
                    <option value="invoice">Invoice</option>
                    <option value="receipt">Receipt</option>
                    <option value="quote">Quote / Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Archive Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
