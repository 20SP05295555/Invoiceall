import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Loader2, X, Layers, ArrowRight } from 'lucide-react';

interface ExportPageFitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: (pages: number) => Promise<void>;
  documentTitle?: string;
  recommendedPages?: number;
}

export const ExportPageFitModal: React.FC<ExportPageFitModalProps> = ({
  isOpen,
  onClose,
  onConfirmExport,
  documentTitle = 'Invoice Document',
  recommendedPages = 2
}) => {
  const [selectedPages, setSelectedPages] = useState<number>(recommendedPages);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onConfirmExport(selectedPages);
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-6 border-b border-amber-200/50 dark:border-amber-900/30 flex items-start gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              ডকুমেন্ট পেজ ফিটিং নোটিফিকেশন (Page Fit Alert)
            </h3>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mt-1">
              আপনার ডকুমেন্টটিতে আইটেম বা পেমেন্ট তথ্যের পরিমাণ বেশি হওয়ায় এটি ১টি A4 পেজে সম্পূর্ণ ফিট হচ্ছে না।
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-sm">
          <div className="bg-gray-50 dark:bg-slate-800/80 p-4 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between font-bold text-gray-800 dark:text-gray-200">
              <span>ডকুমেন্ট: {documentTitle}</span>
              <span className="text-xs px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full font-mono">
                A4 Format
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              ডকুমেন্টটি ১ পেজে জোর করে (Force Fit) ডাউনলোড করলে লেখা ও টেবিল সংকুচিত বা ছোট হয়ে যেতে পারে। সুন্দর ও স্পষ্ট দেখাতে ২ পেজে ডাউনলোড করার পরামর্শ দেওয়া হচ্ছে।
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
              পেজ সংখ্যা সিলেক্ট করুন (Select Page Count):
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: 1 Page */}
              <button
                type="button"
                onClick={() => setSelectedPages(1)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center transition-all ${
                  selectedPages === 1
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-bold shadow-md'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`}
              >
                <FileText className={`w-6 h-6 mb-2 ${selectedPages === 1 ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="text-sm font-bold">১ পেজ (1 Page)</span>
                <span className="text-[11px] opacity-75 mt-0.5">Scale & Fit to 1 Page</span>
              </button>

              {/* Option 2: 2 Pages */}
              <button
                type="button"
                onClick={() => setSelectedPages(2)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center transition-all ${
                  selectedPages === 2
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-bold shadow-md'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`}
              >
                <span className="absolute -top-2.5 right-3 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  Recommended
                </span>
                <Layers className={`w-6 h-6 mb-2 ${selectedPages === 2 ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="text-sm font-bold">২ পেজ (2 Pages)</span>
                <span className="text-[11px] opacity-75 mt-0.5">Full Size (কোনো লেখা কাটবে না)</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 dark:bg-slate-800 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <span className="font-bold shrink-0">টিপস:</span>
            <span>ইন্টারন্যাশনাল ইনভয়েস (যেমন USA/UK/Canada) যেগুলোতে বিস্তারিত শর্ত বা আইটেম থাকে, সেগুলো ২ পেজের ডিজাইনেই সবচেয়ে সুন্দর দেখায়।</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-slate-700 rounded-xl transition"
          >
            বাতিল (Cancel)
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>ডাউনলোড করুন ({selectedPages} পেজ)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
