'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  AlertTriangle,
  Package
} from 'lucide-react';

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  
  // Modal State
  const [showRestockModal, setShowRestockModal] = useState<any>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);

  // ข้อมูลเริ่มต้น (ถ้าเครื่องยังไม่มีข้อมูล)
  const defaultInventory = [
    { id: 1, name: 'น้ำดื่ม (แพ็ค)', stock: 500, limit: 50, image: '💧', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
    { id: 2, name: 'ข้าวสาร (5 กก.)', stock: 200, limit: 20, image: '🌾', unit: 'ถุง', category: 'อาหารและน้ำ' },
    { id: 3, name: 'บะหมี่กึ่งสำเร็จรูป', stock: 1000, limit: 100, image: '🍜', unit: 'ลัง', category: 'อาหารและน้ำ' },
    { id: 4, name: 'ปลากระป๋อง', stock: 800, limit: 100, image: '🐟', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
    { id: 5, name: 'ยาสามัญชุดเล็ก', stock: 150, limit: 10, image: '💊', unit: 'ชุด', category: 'ยารักษาโรค' },
    { id: 6, name: 'ผ้าห่ม', stock: 300, limit: 50, image: '🧣', unit: 'ผืน', category: 'เครื่องนุ่งห่ม' },
    { id: 7, name: 'เต็นท์สนาม', stock: 50, limit: 5, image: '⛺', unit: 'หลัง', category: 'อุปกรณ์พักแรม' },
    { id: 8, name: 'ไฟฉาย', stock: 120, limit: 20, image: '🔦', unit: 'กระบอก', category: 'อุปกรณ์ทั่วไป' },
  ];

  useEffect(() => {
    // โหลดข้อมูล
    const loadInventory = () => {
        const stored = localStorage.getItem('ems_inventory');
        if (stored) {
            setItems(JSON.parse(stored));
        } else {
            localStorage.setItem('ems_inventory', JSON.stringify(defaultInventory));
            setItems(defaultInventory);
        }
    };

    loadInventory();

    // ฟัง Event เมื่อมีการตัดของจากหน้าอื่น
    const handleStorageChange = () => loadInventory();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ฟังก์ชันเติมสต๊อก
  const handleRestock = () => {
    if (!showRestockModal || restockAmount <= 0) return;

    const updatedItems = items.map(item => 
      item.id === showRestockModal.id 
        ? { ...item, stock: item.stock + Number(restockAmount) } 
        : item
    );

    setItems(updatedItems);
    localStorage.setItem('ems_inventory', JSON.stringify(updatedItems));
    
    // แจ้งเตือนหน้าอื่นให้รู้ว่าสต๊อกเปลี่ยนแล้ว
    window.dispatchEvent(new Event('storage'));
    
    setShowRestockModal(null);
    setRestockAmount(0);
    alert(`เติมสต๊อก ${showRestockModal.name} เรียบร้อย!`);
  };

  const categories = ['ทั้งหมด', ...Array.from(new Set(defaultInventory.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'ทั้งหมด' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 sticky top-0 bg-[#0B1120]/90 backdrop-blur-md py-4 z-20 border-b border-slate-800/50">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">คลังสิ่งของช่วยเหลือ</h1>
              <p className="text-sm text-slate-400">จัดการสต๊อกและตรวจสอบสถานะคงเหลือ</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหาสิ่งของ..." 
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 font-medium">
                <Plus className="w-5 h-5" /> <span className="hidden sm:inline">เพิ่มรายการใหม่</span>
             </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-4 custom-scrollbar">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                 activeCategory === cat 
                   ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                   : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isLowStock = item.stock <= 20;
            const isOutOfStock = item.stock === 0;

            return (
              <div 
                key={item.id} 
                className={`group relative bg-slate-900/60 border ${isOutOfStock ? 'border-red-500/30' : 'border-slate-800'} rounded-2xl p-4 transition-all hover:bg-slate-800/80 hover:border-slate-700 hover:-translate-y-1`}
              >
                 {isOutOfStock && (
                   <div className="absolute top-3 right-3 px-2 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1 z-10">
                      <AlertTriangle className="w-3 h-3" /> สินค้าหมด
                   </div>
                 )}
                 {isLowStock && !isOutOfStock && (
                   <div className="absolute top-3 right-3 px-2 py-1 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold z-10">
                      ใกล้หมด
                   </div>
                 )}

                 <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-3xl shadow-inner">
                       {item.image}
                    </div>
                    <div>
                       <h3 className="font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">{item.name}</h3>
                       <p className="text-xs text-slate-500 mt-1">{item.category}</p>
                       <p className="text-xs text-slate-400 mt-0.5">ลิมิตเบิก: {item.limit} {item.unit}</p>
                    </div>
                 </div>

                 <div className="flex items-end justify-between bg-slate-800/50 rounded-xl p-3 border border-slate-800">
                    <div>
                       <p className="text-xs text-slate-400 mb-1">คงเหลือในคลัง</p>
                       <p className={`text-2xl font-mono font-bold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-400' : 'text-white'}`}>
                          {item.stock} <span className="text-sm font-sans font-normal text-slate-500">{item.unit}</span>
                       </p>
                    </div>
                    <button 
                      onClick={() => setShowRestockModal(item)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-300 transition-colors"
                    >
                       <Plus className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-white mb-2">เติมสต๊อกสินค้า</h3>
              <p className="text-slate-400 mb-6">กำลังเพิ่มจำนวนให้กับ: <span className="text-emerald-400">{showRestockModal.name}</span></p>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm text-slate-400 mb-2">จำนวนที่จะเพิ่ม ({showRestockModal.unit})</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 outline-none text-lg font-mono"
                      autoFocus
                      placeholder="0"
                      value={restockAmount === 0 ? '' : restockAmount}
                      onChange={(e) => setRestockAmount(Number(e.target.value))}
                    />
                 </div>
                 
                 <div className="flex items-center justify-between text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400">คงเหลือปัจจุบัน</span>
                    <span className="text-white font-mono">{showRestockModal.stock}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm bg-emerald-900/20 p-3 rounded-lg border border-emerald-900/30">
                    <span className="text-emerald-400">คงเหลือหลังเติม</span>
                    <span className="text-emerald-400 font-bold font-mono">{showRestockModal.stock + Number(restockAmount)}</span>
                 </div>

                 <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => { setShowRestockModal(null); setRestockAmount(0); }}
                      className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                       ยกเลิก
                    </button>
                    <button 
                      onClick={handleRestock}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-lg shadow-emerald-600/20"
                    >
                       ยืนยันการเติม
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.5); border-radius: 10px; }
      `}</style>
    </div>
  );
}