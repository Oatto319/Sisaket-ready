'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Check,
  Package,
  MapPin,
  ChevronRight,
  ShoppingCart,
  Plus,
  Minus,
  AlertCircle,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export default function RequisitionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- State ---
  const [selectedShelters, setSelectedShelters] = useState<number[]>([]);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [inventory, setInventory] = useState<any[]>([]);

  // Mock Shelters
  const shelters = [
    { id: 1, name: 'โรงเรียนสตรีสิริเกศ', district: 'เมืองศรีสะเกษ' },
    { id: 2, name: 'อาคารเฉลิมพระเกียรติฯ', district: 'กันทรลักษ์' },
    { id: 3, name: 'วัดมหาพุทธาราม', district: 'เมืองศรีสะเกษ' },
    { id: 4, name: 'อบต. หญ้าปล้อง', district: 'เมืองศรีสะเกษ' },
    { id: 5, name: 'โรงเรียนขุขันธ์', district: 'ขุขันธ์' },
  ];

  // โหลด Inventory จาก LocalStorage
  useEffect(() => {
     const storedInv = localStorage.getItem('ems_inventory');
     if (storedInv) {
        setInventory(JSON.parse(storedInv));
     } else {
        // Fallback default
        const defaultInv = [
            { id: 1, name: 'น้ำดื่ม (แพ็ค)', stock: 500, limit: 50, image: '💧', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
            { id: 2, name: 'ข้าวสาร (5 กก.)', stock: 200, limit: 20, image: '🌾', unit: 'ถุง', category: 'อาหารและน้ำ' },
            { id: 3, name: 'บะหมี่กึ่งสำเร็จรูป', stock: 1000, limit: 100, image: '🍜', unit: 'ลัง', category: 'อาหารและน้ำ' },
            { id: 4, name: 'ปลากระป๋อง', stock: 800, limit: 100, image: '🐟', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
            { id: 5, name: 'ยาสามัญชุดเล็ก', stock: 150, limit: 10, image: '💊', unit: 'ชุด', category: 'ยารักษาโรค' },
            { id: 6, name: 'ผ้าห่ม', stock: 300, limit: 50, image: '🧣', unit: 'ผืน', category: 'เครื่องนุ่งห่ม' },
        ];
        setInventory(defaultInv);
        localStorage.setItem('ems_inventory', JSON.stringify(defaultInv));
     }
  }, []);

  const toggleShelter = (id: number) => {
    setSelectedShelters(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const updateCart = (itemId: number, delta: number, limit: number, stock: number) => {
    setCart(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, Math.min(limit, Math.min(stock, currentQty + delta)));
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleCancel = () => {
    if(confirm('ต้องการยกเลิกการเบิกจ่ายทั้งหมดหรือไม่?')) {
        setSelectedShelters([]);
        setCart({});
        setStep(1);
    }
  };

  const handleSubmit = () => {
    const newRequests: any[] = [];
    // Clone inventory มาเพื่อตัดสต๊อก
    const updatedInventory = [...inventory];
    
    selectedShelters.forEach(shelterId => {
       const shelter = shelters.find(s => s.id === shelterId);
       Object.entries(cart).forEach(([itemId, qty]) => {
          // หาตำแหน่งของในคลัง
          const itemIndex = updatedInventory.findIndex(i => i.id === Number(itemId));
          
          if (shelter && itemIndex !== -1) {
             const item = updatedInventory[itemIndex];
             
             // สร้าง Request
             newRequests.push({
                id: Date.now() + Math.random(),
                itemId: item.id, // เก็บ ID ไว้เพื่อใช้คืนของตอน Reject
                item: item.name,
                quantity: qty,
                unit: item.unit,
                requester: shelter.name,
                location: shelter.district,
                status: 'PENDING',
                timestamp: Date.now(),
                time: 'เมื่อสักครู่', 
                urgency: 'MEDIUM'
             });

             // *** ตัดสต๊อกทันที ***
             updatedInventory[itemIndex] = {
                 ...item,
                 stock: Math.max(0, item.stock - qty)
             };
          }
       });
    });

    // 1. บันทึก Requests
    const existingData = localStorage.getItem('ems_requests');
    const previousRequests = existingData ? JSON.parse(existingData) : [];
    localStorage.setItem('ems_requests', JSON.stringify([...newRequests, ...previousRequests]));

    // 2. บันทึก Inventory ที่ถูกตัดสต๊อก
    localStorage.setItem('ems_inventory', JSON.stringify(updatedInventory));

    // 3. ส่งสัญญาณอัปเดต
    window.dispatchEvent(new Event('storage'));

    alert('บันทึกใบเบิกเรียบร้อย! ตัดสต๊อกคลังสินค้าแล้ว');
    router.push('/');
  };

  const filteredShelters = shelters.filter(s => 
    s.name.includes(searchTerm) || s.district.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 flex flex-col h-screen">
        <div className="flex flex-col gap-6 mb-8 flex-shrink-0">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">เบิกจ่ายสิ่งของ</h1>
                <p className="text-sm text-slate-400">สร้างใบเบิกสำหรับศูนย์พักพิง</p>
              </div>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base">
             <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-600'}`}>1</div>
                <span className="font-medium hidden sm:inline">เลือกศูนย์ฯ</span>
             </div>
             <div className="w-8 sm:w-16 h-[2px] bg-slate-700 relative">
                <div className={`absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
             </div>
             <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 2 ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-600 bg-slate-800'}`}>2</div>
                <span className="font-medium hidden sm:inline">เลือกของ</span>
             </div>
             <div className="w-8 sm:w-16 h-[2px] bg-slate-700 relative">
                <div className={`absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300 ${step >= 3 ? 'w-full' : 'w-0'}`} />
             </div>
             <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= 3 ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-600 bg-slate-800'}`}>3</div>
                <span className="font-medium hidden sm:inline">ยืนยัน</span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-28">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อศูนย์ หรืออำเภอ..." 
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredShelters.map((shelter) => {
                    const isSelected = selectedShelters.includes(shelter.id);
                    return (
                      <div 
                        key={shelter.id}
                        onClick={() => toggleShelter(shelter.id)}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                          isSelected 
                            ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
                               {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                               <h3 className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{shelter.name}</h3>
                               <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {shelter.district}</p>
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          )}
          {step === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-start gap-3">
                   <ShoppingCart className="w-5 h-5 text-emerald-400 mt-0.5" />
                   <div>
                      <h3 className="text-white font-medium">รายการเบิกจ่าย</h3>
                      <p className="text-sm text-slate-400">
                         กำลังทำรายการเบิกให้: <span className="text-emerald-400 font-bold">{selectedShelters.length} แห่ง</span>
                      </p>
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {inventory.map((item) => {
                     const qty = cart[item.id] || 0;
                     const isMax = qty >= item.limit || qty >= item.stock;

                     return (
                       <div key={item.id} className={`p-4 rounded-2xl bg-slate-900/60 border ${qty > 0 ? 'border-emerald-500/50 bg-emerald-900/5' : 'border-slate-800'} transition-all`}>
                          <div className="flex items-start justify-between mb-3">
                             <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                                {item.image}
                             </div>
                             <div className="text-right">
                                <span className="block text-xs text-slate-500">คงเหลือ</span>
                                <span className={`font-mono font-bold ${item.stock < 50 ? 'text-red-400' : 'text-slate-300'}`}>
                                  {item.stock}
                                </span>
                             </div>
                          </div>
                          <h3 className="text-white font-medium mb-1">{item.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                             <AlertCircle className="w-3 h-3" /> สูงสุด: {item.limit} {item.unit}
                          </div>
                          <div className="flex items-center justify-between bg-slate-800 rounded-lg p-1">
                             <button 
                               onClick={() => updateCart(item.id, -1, item.limit, item.stock)}
                               disabled={qty === 0}
                               className="w-8 h-8 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                             >
                               <Minus className="w-4 h-4" />
                             </button>
                             <span className={`font-mono font-bold text-lg ${qty > 0 ? 'text-white' : 'text-slate-500'}`}>
                               {qty}
                             </span>
                             <button 
                               onClick={() => updateCart(item.id, 1, item.limit, item.stock)}
                               disabled={isMax}
                               className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${isMax ? 'bg-slate-700 opacity-50' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                             >
                               <Plus className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                     );
                   })}
                </div>
             </div>
          )}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">ตรวจสอบข้อมูลการเบิก</h2>
                    <p className="text-slate-400">กรุณาตรวจสอบความถูกต้องก่อนยืนยัน</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-400" /> 
                                ศูนย์พักพิง ({selectedShelters.length})
                            </h3>
                            <button onClick={() => setStep(1)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <Edit2 className="w-3 h-3" /> แก้ไข
                            </button>
                        </div>
                        <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                            {selectedShelters.map(id => {
                                const shelter = shelters.find(s => s.id === id);
                                return (
                                    <li key={id} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
                                        {shelter?.name}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Package className="w-4 h-4 text-emerald-400" /> 
                                รายการเบิก ({Object.keys(cart).length})
                            </h3>
                            <button onClick={() => setStep(2)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <Edit2 className="w-3 h-3" /> แก้ไข
                            </button>
                        </div>
                        <ul className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                            {Object.entries(cart).map(([itemId, qty]) => {
                                const item = inventory.find(i => i.id === Number(itemId));
                                return (
                                    <li key={itemId} className="flex justify-between text-sm">
                                        <span className="text-slate-300">{item?.name}</span>
                                        <span className="font-mono font-medium text-emerald-400">x{qty} {item?.unit}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 z-50">
           <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="text-sm">
                 {step === 1 && <span className="text-slate-400">เลือกแล้ว <b className="text-white">{selectedShelters.length}</b> แห่ง</span>}
                 {step === 2 && <span className="text-slate-400">รวมรายการ <b className="text-white">{Object.keys(cart).length}</b> ชนิด</span>}
                 {step === 3 && <span className="text-slate-400">พร้อมยืนยัน <b className="text-emerald-400">ทั้งหมด</b></span>}
              </div>
              <div className="flex gap-3">
                 {step === 3 && (
                   <button 
                     onClick={handleCancel}
                     className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-colors flex items-center gap-2 border border-red-500/20"
                   >
                     <Trash2 className="w-4 h-4" /> ยกเลิก
                   </button>
                 )}
                 <button 
                   onClick={() => {
                     if (step === 1) {
                        if (selectedShelters.length > 0) setStep(2);
                     } else if (step === 2) {
                        if (Object.keys(cart).length > 0) setStep(3);
                     } else {
                        handleSubmit();
                     }
                   }}
                   disabled={(step === 1 && selectedShelters.length === 0) || (step === 2 && Object.keys(cart).length === 0)}
                   className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                     ((step === 1 && selectedShelters.length === 0) || (step === 2 && Object.keys(cart).length === 0))
                       ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                       : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:scale-105'
                   }`}
                 >
                   {step === 3 ? (
                     <>ยืนยันการเบิก <FileText className="w-5 h-5" /></>
                   ) : (
                     <>ถัดไป <ChevronRight className="w-5 h-5" /></>
                   )}
                 </button>
              </div>
           </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.5); border-radius: 10px; }
      `}</style>
    </div>
  );
}