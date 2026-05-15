
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { Camera, Trash2, Maximize2, X, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';

const ProductionGallery: React.FC = () => {
  const { gallery, removeGalleryItem, order } = useData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'production' | 'capture'>('all');

  const filteredItems = filter === 'all' ? gallery : gallery.filter(i => i.type === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Camera className="w-7 h-7 text-indigo-600" />
              Visual Progress & Captures
           </h1>
           <p className="text-gray-500 mt-1">Order #{order.orderNumber} - Tracking your custom piece</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200 self-start">
           {(['all', 'production', 'capture'] as const).map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                 filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
               }`}
             >
               {f.charAt(0).toUpperCase() + f.slice(1)}s
             </button>
           ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 py-20 px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 text-indigo-400 mb-6">
                <ImageIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Visual Gallery is Empty</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
                This space will showcase the journey of your bespoke piece. We track every stage of production from our London workshop.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                            <Clock className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">Automatic Logs</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">Our master craftsmen will upload live progress photos as they assemble, foam, and upholster your furniture.</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                            <Camera className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">Personal Captures</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">Navigate to your <strong>Profile</strong> tab to use the document capture tool. Saved snapshots will appear here instantly.</p>
                </div>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedImage(item.url)}
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    src={item.url} 
                    alt={item.caption} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="text-white w-8 h-8" />
                  </div>
              </div>
              
              <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        item.type === 'production' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.date}
                      </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate pr-8" title={item.caption}>{item.caption}</p>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGalleryItem(item.id);
                    }}
                    className="absolute bottom-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={selectedImage} 
            alt="Full Preview" 
            className="max-w-full max-h-full object-contain rounded-sm"
          />
        </div>
      )}

      <div className="bg-indigo-50 rounded-2xl p-6 flex items-start gap-4">
         <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
         </div>
         <div>
            <h4 className="font-bold text-indigo-900 text-sm">Real-time Production Log</h4>
            <p className="text-indigo-700/80 text-xs mt-1 leading-relaxed">
              Every custom order at HOB Furniture is handcrafted in our London workshop. 
              Our craftsmen take photos during key stages like frame assembly, foam setting, and upholstery. 
              These are automatically synced to this gallery so you can watch your vision come to life.
            </p>
         </div>
      </div>
    </div>
  );
};

export default ProductionGallery;