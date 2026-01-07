'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  ArrowLeft, Search, Check, Package, MapPin, ChevronRight,
  ShoppingCart, XCircle, Trash2, CheckCircle2,
  FileSpreadsheet, CloudUpload, Settings2, ListChecks
} from 'lucide-react';

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
    const fetchShelters = async () => {
      try {
        const res = await fetch('/api/centers');
        if (res.ok) {
          const data = await res.json();
          const sheltersWithIds = (data || []).map((shelter: any, index: number) => ({
            ...shelter,
            id: shelter.id || index + 1
          }));
          setShelters(sheltersWithIds);
        }
      } catch (e) { console.error(e); } finally { setLoadingShelters(false); }
    };
    fetchShelters();
  }, []);

  useEffect(() => {
    const loadInventory = () => {
      const stored = localStorage.getItem('ems_inventory');
      if (stored) setInventory(JSON.parse(stored));
    };
    loadInventory();
  }, []);

  // ✅ Filter สำหรับ Shelters
  const filteredShelters = shelters.filter(s => {
    const name = (s.name || "").toLowerCase();
    const district = (s.district || "").toLowerCase();
    const search = (searchTerm || "").toLowerCase();
    return name.includes(search) || district.includes(search);
  });

  const filteredInventory = inventory.filter(item => 
    activeCategory === 'ทั้งหมด' || item.category === activeCategory
  );

  // Excel Functions
  const processExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (typeof bstr !== 'string') return;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      const previewItems: InventoryItem[] = [];
      data.forEach((row) => {
        const itemName = row['รายการ'] || row['item'];
        const quantity = parseInt(row['จำนวน'] || row['quantity'], 10);
        const itemInInv = inventory.find(i => i.name === itemName);
        if (itemInInv && !isNaN(quantity)) {
          previewItems.push({ ...itemInInv, stock: quantity } as InventoryItem);
        }
      });
      setExcelPreview(previewItems);
    };
    reader.readAsBinaryString(file);
  };

  const importToCart = () => {
    const newCart: CartItem = { ...cart };
    excelPreview.forEach(item => {
      if (item.stock > 0) newCart[item.id] = item.stock;
    });
    setCart(newCart);
    setExcelPreview([]);
    setUploadMode(false);
  };

  const downloadSampleExcel = () => {
    const sampleData = [{ 'รายการ': 'น้ำดื่ม (แพ็ค)', 'จำนวน': 10 }];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    XLSX.writeFile(workbook, "Sample_Requisition.xlsx");
  };

  const handleInputChange = (itemId: number, value: string, limit: number) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue)) return;
    const safeValue = Math.max(0, Math.min(limit, numValue));
    setCart(prev => {
      if (safeValue === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: safeValue };
    });
  };

  const handleSubmit = async () => {
    const shelterCount = selectedShelters.length;
    let updatedInventory = [...inventory];
    const newRequests: any[] = [];

    for (const [itemId, qty] of Object.entries(cart)) {
      const totalNeeded = Number(qty) * shelterCount;
      const item = updatedInventory.find(i => i.id === Number(itemId));
      if (item && item.stock < totalNeeded) {
        alert(`สินค้า "${item.name}" ไม่พอสำหรับ ${shelterCount} ศูนย์`);
        return;
      }
    }

    selectedShelters.forEach(sId => {
      const shelter = shelters.find(s => String(s.id) === String(sId));
      Object.entries(cart).forEach(([itemId, qty]) => {
        const idx = updatedInventory.findIndex(i => i.id === Number(itemId));
        if (shelter && idx !== -1) {
          const item = updatedInventory[idx];
          updatedInventory[idx].stock -= Number(qty);
          
          newRequests.push({
            id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            item: item.name,
            quantity: Number(qty),
            unit: item.unit,
            requester: shelter.name,
            status: 'PENDING',
            timestamp: new Date().toISOString(),
            type: 'เบิกจ่าย'
          });
        }
      });
    });

    localStorage.setItem('ems_inventory', JSON.stringify(updatedInventory));
    const existingRequests = JSON.parse(localStorage.getItem('ems_requests') || '[]');
    localStorage.setItem('ems_requests', JSON.stringify([...newRequests, ...existingRequests]));
    window.dispatchEvent(new Event('storage'));

    // ✅ ใช้ Unicode escape แทน emoji ตรงๆ
    alert('\u2705 บันทึกใบเบิกเรียบร้อยแล้ว!');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans overflow-hidden flex flex-col relative">
      <div className="relative z-10 flex flex-col h-screen p-6">
        <div className="flex-shrink-0 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white uppercase tracking-tight">เบิกจ่ายสิ่งของ</h1>
                <p className="text-sm text-slate-400">เลือกปลายทาง: {selectedShelters.length} ศูนย์</p>
              </div>
            </div>
            {step === 2 && (
              <div className="flex bg-slate-900/80 border border-slate-700 p-1 rounded-xl">
                <button onClick={() => setUploadMode(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${!uploadMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}><Settings2 className="w-4 h-4" /> เลือกเอง</button>
                <button onClick={() => setUploadMode(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${uploadMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}><FileSpreadsheet className="w-4 h-4" /> Excel</button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((s, idx) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step >= s ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-700 bg-slate-800'}`}>{s}</div>
                {idx < 2 && <div className={`w-16 h-[2px] transition-all ${step > s ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {step === 1 && (
            <div className="h-full flex flex-col animate-in fade-in duration-300">
              <div className="relative mb-6 max-w-xl mx-auto w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="text" placeholder="ค้นหาชื่อศูนย์ หรืออำเภอ..." className="w-full bg-slate-900/60 border border-slate-700 rounded-2xl py-4 pl-12 text-white outline-none focus:ring-2 focus:ring-emerald-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredShelters.map((shelter) => (
                    <div key={shelter.id} onClick={() => setSelectedShelters(prev => prev.includes(String(shelter.id)) ? prev.filter(id => id !== String(shelter.id)) : [...prev, String(shelter.id)])} className={`cursor-pointer p-5 rounded-2xl border transition-all ${selectedShelters.includes(String(shelter.id)) ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/5' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}`}>
                       <div className={`w-6 h-6 rounded border flex items-center justify-center mb-3 transition-colors ${selectedShelters.includes(String(shelter.id)) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                          {selectedShelters.includes(String(shelter.id)) && <Check className="w-4 h-4 text-white" />}
                       </div>
                       <h3 className="font-bold text-slate-100">{shelter.name || "ไม่มีชื่อศูนย์"}</h3>
                       <p className="text-xs text-slate-500 mt-1">{shelter.district || "ไม่ระบุอำเภอ"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                {!uploadMode ? (
                  <>
                    <div className="flex-shrink-0 mb-6 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>{cat}</button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredInventory.map((item) => {
                          const qty = cart[item.id] || 0;
                          const totalForAll = qty * selectedShelters.length;
                          const isOver = item.stock < totalForAll;

                          return (
                            <div key={item.id} className={`p-5 rounded-2xl bg-slate-900/40 border transition-all ${qty > 0 ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800'}`}>
                              <div className="flex justify-between mb-4">
                                <span className="text-2xl">{item.image}</span>
                                <div className="text-right">
                                  <p className={`font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>{item.stock}</p>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase">ในคลัง</p>
                                </div>
                              </div>
                              <h3 className="text-white font-bold text-sm mb-1">{item.name}</h3>
                              <p className="text-[10px] text-slate-500 mb-4 tracking-wider uppercase">โควตา: {item.limit} {item.unit} / ที่</p>
                              <input type="number" value={qty || ''} placeholder="0" onChange={(e) => handleInputChange(item.id, e.target.value, item.limit)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-3 text-center text-white font-bold outline-none focus:border-emerald-500 transition-all" />
                              {qty > 0 && (
                                <div className="mt-3 text-center animate-in slide-in-from-top-2 duration-200">
                                   <p className={`text-[11px] font-black ${isOver ? 'text-red-400' : 'text-amber-500'}`}>รวมเบิกทั้งสิ้น: {totalForAll} {item.unit}</p>
                                   {isOver && <p className="text-[9px] text-red-500 font-bold mt-1">! สินค้าไม่พอเบิก</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-sm flex items-center gap-2"><ListChecks className="text-emerald-500 w-4 h-4" /> รายการจาก Excel</h3>
                      {excelPreview.length > 0 && <button onClick={importToCart} className="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg">นำเข้าลงตะกร้า</button>}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                      {excelPreview.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600 text-xs uppercase font-bold tracking-widest">ยังไม่มีข้อมูล</div>
                      ) : (
                        excelPreview.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-white/5">
                            <p className="text-sm font-bold text-white">{item.name}</p>
                            <p className="text-emerald-400 font-bold text-sm">จำนวน: {item.stock} / ศูนย์</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="lg:col-span-4 flex flex-col h-full gap-5 pb-32">
                {uploadMode ? (
                  <div className="space-y-4">
                    <div className="relative border-2 border-dashed border-slate-700 rounded-[2rem] p-8 flex flex-col items-center gap-4 text-center hover:border-emerald-500/50 transition-all bg-slate-900/20 group cursor-pointer">
                      <input type="file" accept=".xlsx, .xls" onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><CloudUpload className="w-8 h-8 text-emerald-400" /></div>
                      <div>
                        <p className="text-sm font-bold text-white">เลือกไฟล์ Excel</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase">รองรับ .xlsx, .xls</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                       <h3 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-emerald-500" /> ตะกร้าสินค้า</h3>
                       <span className="text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded text-emerald-400">{Object.keys(cart).length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                      {Object.entries(cart).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase tracking-widest opacity-50">ไม่มีสินค้า</div>
                      ) : (
                        Object.entries(cart).map(([id, qty]) => {
                          const item = inventory.find(i => i.id === Number(id));
                          return (
                            <div key={id} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-3">
                                 <span className="text-xl">{item?.image}</span>
                                 <div>
                                    <p className="text-xs font-bold text-white">{item?.name}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold">{qty} {item?.unit} / ศูนย์</p>
                                 </div>
                              </div>
                              <button onClick={() => { const newCart = {...cart}; delete newCart[Number(id)]; setCart(newCart); }} className="p-2 text-slate-600 hover:text-red-400 transition-colors"><XCircle className="w-4 h-4" /></button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="h-full overflow-y-auto pb-32 animate-in zoom-in-95 duration-300">
               <div className="text-center py-12">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-2xl"><CheckCircle2 className="w-10 h-10 text-emerald-500" /></div>
                  <h2 className="text-3xl font-black text-white uppercase">ยืนยันใบเบิกจ่าย</h2>
                  <p className="text-slate-500 text-sm mt-2">ตรวจสอบรายการเบิกสำหรับ {selectedShelters.length} ศูนย์</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
                  <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem]">
                     <h4 className="text-[10px] font-black uppercase text-slate-500 mb-6 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> ศูนย์ปลายทาง</h4>
                     <div className="space-y-2">
                        {selectedShelters.map(id => (
                          <div key={id} className="text-sm font-bold bg-white/5 p-3 rounded-xl text-slate-300 border border-white/5">{shelters.find(s => String(s.id) === id)?.name || "ศูนย์ไม่ระบุชื่อ"}</div>
                        ))}
                     </div>
                  </div>
                  <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem]">
                     <h4 className="text-[10px] font-black uppercase text-slate-500 mb-6 flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" /> ยอดเบิกสุทธิ</h4>
                     <div className="space-y-3">
                        {Object.entries(cart).map(([id, qty]) => {
                          const item = inventory.find(i => i.id === Number(id));
                          return (
                            <div key={id} className="flex justify-between items-center bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                               <span className="text-sm font-bold text-slate-200">{item?.name}</span>
                               <span className="text-emerald-400 font-mono text-lg font-black">{Number(qty) * selectedShelters.length} <span className="text-[10px] font-sans text-slate-500 uppercase">{item?.unit}</span></span>
                            </div>
                          );
                        })}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-10 right-10 flex gap-3 z-[100]">
          {step > 1 && (
            <button onClick={() => {setStep(1); setCart({}); setSelectedShelters([]);}} className="p-4 bg-slate-800/80 rounded-2xl border border-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all shadow-2xl backdrop-blur-md">
              <Trash2 className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={() => {
              if (step === 1 && selectedShelters.length > 0) setStep(2);
              else if (step === 2 && Object.keys(cart).length > 0) setStep(3);
              else if (step === 3) handleSubmit();
            }}
            disabled={(step === 1 && selectedShelters.length === 0) || (step === 2 && Object.keys(cart).length === 0)}
            className={`px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-2xl ${(step === 1 && selectedShelters.length === 0) || (step === 2 && Object.keys(cart).length === 0) ? 'bg-slate-800 text-slate-600' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'}`}
          >
             <span className="text-sm uppercase tracking-widest">{step === 3 ? 'ยืนยันการเบิก' : 'ถัดไป'}</span>
             <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}