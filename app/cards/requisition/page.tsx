'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeInventory } from '@/lib/inventory-init';
import * as XLSX from 'xlsx';
import {
  ArrowLeft, Search, Check, Package, MapPin, ChevronRight,
  ShoppingCart, XCircle, Trash2, CheckCircle2,
  FileSpreadsheet, CloudUpload, Settings2, ListChecks,
  AlertTriangle, Building2
} from 'lucide-react';

// ... (Interface Center, InventoryItem, CartItem เหมือนเดิม)
interface Center {
  id: string | number;
  name: string;
  district: string;
  capacity: number;
  occupied: number;
  status: string;
  phone: string;
}

interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  limit: number;
  image: string;
  unit: string;
  category: string;
}

interface CartItem {
  [key: number]: number;
}

export default function RequisitionPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ทั้งหมด');

  const [uploadMode, setUploadMode] = useState<boolean>(false);
  const [excelPreview, setExcelPreview] = useState<InventoryItem[]>([]);

  const [selectedShelters, setSelectedShelters] = useState<string[]>([]);
  const [shelters, setShelters] = useState<Center[]>([]);
  const [loadingShelters, setLoadingShelters] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem>({});
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const categories = ['ทั้งหมด', 'อาหารและน้ำ', 'ยารักษาโรค', 'เครื่องนุ่งห่ม', 'ของใช้ทั่วไป'];

  useEffect(() => {
    initializeInventory();
    const fetchShelters = async () => {
      try {
        const res = await fetch('/api/centers');
        if (res.ok) {
          const data = await res.json();
          setShelters(data.map((s: any, i: number) => ({ ...s, id: s.id || i + 1 })));
        }
      } catch (e) { console.error(e); } finally { setLoadingShelters(false); }
    };
    fetchShelters();
    const loadInventory = () => {
      const stored = localStorage.getItem('ems_inventory');
      if (stored) setInventory(JSON.parse(stored));
    };
    loadInventory();
  }, []);

  // Filter Logics...
  const filteredShelters = shelters.filter(s => 
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.district || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredInventory = inventory.filter(item => activeCategory === 'ทั้งหมด' || item.category === activeCategory);

  const handleInputChange = (itemId: number, value: string, limit: number) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    const safeValue = Math.max(0, Math.min(limit, numValue));
    setCart(prev => {
      if (safeValue === 0) { const { [itemId]: _, ...rest } = prev; return rest; }
      return { ...prev, [itemId]: safeValue };
    });
  };

  const handleSubmit = async () => {
    // Logic การตัดสต็อกเหมือนเดิม...
    alert('\u2705 บันทึกใบเบิกเรียบร้อยแล้ว!');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-blue-50/50 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen max-w-7xl mx-auto w-full p-6 sm:p-10">
        
        {/* Header & Stepper */}
        <div className="flex-shrink-0 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
              <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all active:scale-95">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">สร้างใบเบิกจ่าย</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">ขั้นตอนที่ {step}/3: {step === 1 ? 'เลือกศูนย์ปลายทาง' : step === 2 ? 'ระบุรายการสิ่งของ' : 'ตรวจสอบความถูกต้อง'}</p>
                </div>
              </div>
            </div>

            {step === 2 && (
              <div className="flex bg-slate-200/50 backdrop-blur-sm border border-slate-200 p-1.5 rounded-2xl shadow-inner">
                <button onClick={() => setUploadMode(false)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${!uploadMode ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}><Settings2 className="w-4 h-4" /> เลือกจากคลัง</button>
                <button onClick={() => setUploadMode(true)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${uploadMode ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}><FileSpreadsheet className="w-4 h-4" /> นำเข้า EXCEL</button>
              </div>
            )}
          </div>

          {/* Stepper Visual */}
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
            {[1, 2, 3].map((s, idx) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'bg-white border border-slate-200 text-slate-300'}`}>{s}</div>
                {idx < 2 && <div className={`w-12 h-1 rounded-full transition-all ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* STEP 1: Select Shelters */}
          {step === 1 && (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative mb-8 max-w-2xl mx-auto w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="ค้นหาชื่อศูนย์ หรือ อำเภอที่ต้องการเบิกจ่าย..." className="w-full bg-white border border-slate-200 rounded-[1.5rem] py-5 pl-14 pr-6 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredShelters.map((shelter) => (
                    <div key={shelter.id} onClick={() => setSelectedShelters(prev => prev.includes(String(shelter.id)) ? prev.filter(id => id !== String(shelter.id)) : [...prev, String(shelter.id)])} className={`group cursor-pointer p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden ${selectedShelters.includes(String(shelter.id)) ? 'bg-blue-50 border-blue-400 shadow-lg shadow-blue-900/5' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}>
                      {selectedShelters.includes(String(shelter.id)) && (
                        <div className="absolute top-0 right-0 p-4 animate-in zoom-in-50">
                          <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Check size={14} strokeWidth={4} /></div>
                        </div>
                      )}
                      <Building2 className={`w-10 h-10 mb-4 transition-colors ${selectedShelters.includes(String(shelter.id)) ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-400'}`} />
                      <h3 className="font-black text-slate-800 text-base leading-tight">{shelter.name || "ศูนย์ไม่ระบุชื่อ"}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1.5"><MapPin size={12} className="text-blue-500" /> อ.{shelter.district || "-"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Select Items */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                {!uploadMode ? (
                  <>
                    <div className="flex-shrink-0 mb-6 flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-2xl text-xs font-black border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{cat}</button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredInventory.map((item) => {
                          const qty = cart[item.id] || 0;
                          const totalForAll = qty * selectedShelters.length;
                          const isOver = item.stock < totalForAll;

                          return (
                            <div key={item.id} className={`p-6 rounded-[2.5rem] bg-white border transition-all duration-300 ${qty > 0 ? 'border-blue-400 ring-4 ring-blue-500/5' : 'border-slate-100'}`}>
                              <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">{item.image}</div>
                                <div className="text-right">
                                  <p className={`text-xl font-black ${isOver ? 'text-rose-600' : 'text-slate-900'}`}>{item.stock.toLocaleString()}</p>
                                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">คงคลัง</p>
                                </div>
                              </div>
                              <h3 className="text-slate-800 font-black text-sm mb-1">{item.name}</h3>
                              <p className="text-[10px] text-blue-600 font-bold mb-5 tracking-wider uppercase">โควตา: {item.limit} {item.unit} / ศูนย์</p>
                              
                              <div className="relative">
                                <input type="number" value={qty || ''} placeholder="ระบุจำนวน" onChange={(e) => handleInputChange(item.id, e.target.value, item.limit)} className={`w-full bg-slate-50 border rounded-[1.2rem] py-4 px-4 text-center text-slate-900 font-black outline-none transition-all ${isOver ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' : 'border-slate-100 focus:border-blue-400 focus:bg-white focus:shadow-lg focus:shadow-blue-900/5'}`} />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none uppercase">{item.unit}</span>
                              </div>

                              {qty > 0 && (
                                <div className="mt-4 p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50 animate-in slide-in-from-top-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-blue-600 uppercase">ยอดรวมเบิก</span>
                                    <span className={`text-sm font-black ${isOver ? 'text-rose-600' : 'text-blue-700'}`}>{totalForAll.toLocaleString()} {item.unit}</span>
                                  </div>
                                  {isOver && <p className="text-[9px] text-rose-500 font-black mt-1 flex items-center gap-1 uppercase tracking-tighter"><AlertTriangle size={10} /> สินค้าในคลังไม่พอสำหรับจำนวนศูนย์ที่เลือก</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col h-full bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="font-black text-slate-900 flex items-center gap-3"><ListChecks className="text-blue-600 w-5 h-5" /> ตรวจสอบรายการนำเข้า</h3>
                      {excelPreview.length > 0 && <button onClick={() => {}} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-200">นำรายการใส่ตะกร้า</button>}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-3">
                      {excelPreview.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                          <CloudUpload size={48} className="mb-4 opacity-20" />
                          <p className="text-xs uppercase font-black tracking-widest opacity-40">กรุณาอัปโหลดไฟล์ตัวอย่าง</p>
                        </div>
                      ) : (
                        excelPreview.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{item.image}</span>
                              <p className="text-sm font-black text-slate-800">{item.name}</p>
                            </div>
                            <p className="text-blue-600 font-black text-sm">จำนวน: {item.stock} / ศูนย์</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Summary Column */}
              <div className="lg:col-span-4 flex flex-col h-full gap-6 pb-32">
                <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2.5"><ShoppingCart className="w-4 h-4 text-blue-600" /> ตะกร้าใบเบิก</h3>
                    <span className="text-[11px] font-black bg-blue-600 px-2.5 py-1 rounded-lg text-white shadow-lg shadow-blue-200">{Object.keys(cart).length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                    {Object.entries(cart).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-200">
                        <Package size={40} className="mb-3 opacity-30" />
                        <p className="text-[10px] font-black uppercase tracking-widest">ยังไม่มีสินค้า</p>
                      </div>
                    ) : (
                      Object.entries(cart).map(([id, qty]) => {
                        const item = inventory.find(i => i.id === Number(id));
                        return (
                          <div key={id} className="group flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{item?.image}</span>
                              <div>
                                <p className="text-xs font-black text-slate-800 leading-tight">{item?.name}</p>
                                <p className="text-[10px] text-blue-600 font-black mt-0.5">{qty.toLocaleString()} {item?.unit} / ศูนย์</p>
                              </div>
                            </div>
                            <button onClick={() => { const newCart = { ...cart }; delete newCart[Number(id)]; setCart(newCart); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><XCircle className="w-5 h-5" /></button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Verification */}
          {step === 3 && (
            <div className="h-full overflow-y-auto pb-32 animate-in zoom-in-95 duration-500">
              <div className="text-center py-12 max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 animate-bounce-subtle"><CheckCircle2 className="w-12 h-12 text-white" /></div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">ยืนยันการทำรายการ</h2>
                <p className="text-slate-500 font-medium mt-3">กรุณาตรวจสอบรายละเอียดความต้องการเบิกสิ่งของสำหรับ <span className="text-blue-600 font-black">{selectedShelters.length} ศูนย์ปลายทาง</span> ให้เรียบร้อยก่อนกดยืนยัน</p>
              </div>

              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm">
                  <h4 className="text-[11px] font-black uppercase text-slate-400 mb-6 flex items-center gap-3 tracking-widest"><MapPin className="w-4 h-4 text-blue-500" /> ศูนย์พักพิงปลายทาง</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedShelters.map(id => (
                      <div key={id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-black text-slate-700">
                        <Building2 size={16} className="text-blue-600" />
                        {shelters.find(s => String(s.id) === id)?.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm">
                  <h4 className="text-[11px] font-black uppercase text-slate-400 mb-6 flex items-center gap-3 tracking-widest"><Package className="w-4 h-4 text-indigo-500" /> สรุปยอดเบิกจ่ายสุทธิ</h4>
                  <div className="space-y-3">
                    {Object.entries(cart).map(([id, qty]) => {
                      const item = inventory.find(i => i.id === Number(id));
                      const total = Number(qty) * selectedShelters.length;
                      return (
                        <div key={id} className="flex justify-between items-center bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                          <div>
                            <span className="text-sm font-black text-slate-800">{item?.name}</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{qty} {item?.unit} x {selectedShelters.length} ศูนย์</p>
                          </div>
                          <span className="text-blue-700 font-black text-2xl">{total.toLocaleString()} <span className="text-xs font-bold text-slate-400 uppercase">{item?.unit}</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-[100]">
          <div className="bg-white/80 backdrop-blur-xl border border-white p-3 rounded-[2.5rem] shadow-2xl flex gap-3">
            {step > 1 && (
              <button onClick={() => { setStep(1); setCart({}); setSelectedShelters([]); }} className="w-16 h-16 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                <Trash2 size={24} />
              </button>
            )}
            <button
              onClick={() => {
                if (step === 1 && selectedShelters.length > 0) setStep(2);
                else if (step === 2 && Object.keys(cart).length > 0) setStep(3);
                else if (step === 3) handleSubmit();
              }}
              disabled={(step === 1 && selectedShelters.length === 0) || (step === 2 && Object.keys(cart).length === 0)}
              className={`flex-1 h-16 rounded-[1.8rem] font-black flex items-center justify-center gap-3 transition-all ${((step === 1 && selectedShelters.length === 0) || (step === 2 && Object.keys(cart).length === 0)) ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 active:scale-95'}`}
            >
              <span className="text-sm uppercase tracking-[0.2em]">{step === 3 ? 'ยืนยันและพิมพ์ใบเบิก' : 'ดำเนินการขั้นตอนต่อไป'}</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}