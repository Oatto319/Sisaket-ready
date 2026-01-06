'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  ArrowLeft, Search, Check, Package, MapPin, ChevronRight,
  ShoppingCart, FileText, Trash2, CheckCircle2, XCircle,
  FileSpreadsheet, CloudUpload, Settings2, PlusCircle, AlertCircle, ListChecks
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
  const [mounted, setMounted] = useState(false); // ป้องกัน Hydration Error
  const [step, setStep] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ทั้งหมด');
  
  const [uploadMode, setUploadMode] = useState<boolean>(false); 
  const [excelPreview, setExcelPreview] = useState<any[]>([]); 
  
  const [selectedShelters, setSelectedShelters] = useState<string[]>([]);
  const [shelters, setShelters] = useState<Center[]>([]);
  const [loadingShelters, setLoadingShelters] = useState<boolean>(true);
  const [totalSheltersCount, setTotalSheltersCount] = useState<number>(0);
  const [cart, setCart] = useState<CartItem>({});
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const categories = ['ทั้งหมด', 'อาหารและน้ำ', 'ยารักษาโรค', 'เครื่องนุ่งห่ม', 'ของใช้ทั่วไป'];

  const defaultInventory: InventoryItem[] = [
    { id: 1, name: 'น้ำดื่ม (แพ็ค)', stock: 500, limit: 50, image: '/inventory/water.png', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
    { id: 2, name: 'ข้าวสาร (5 กก.)', stock: 200, limit: 20, image: '/inventory/rice.png', unit: 'ถุง', category: 'อาหารและน้ำ' },
    { id: 3, name: 'บะหมี่กึ่งสำเร็จรูป', stock: 1000, limit: 100, image: '/inventory/noodle.png', unit: 'ลัง', category: 'อาหารและน้ำ' },
    { id: 4, name: 'ปลากระป๋อง', stock: 800, limit: 100, image: '/inventory/fish.png', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
    { id: 5, name: 'ยาสามัญชุดเล็ก', stock: 150, limit: 10, image: '/inventory/med.png', unit: 'ชุด', category: 'ยารักษาโรค' },
    { id: 6, name: 'ผ้าห่ม', stock: 300, limit: 50, image: '/inventory/blanket.png', unit: 'ผืน', category: 'เครื่องนุ่งห่ม' },
    { id: 7, name: 'สบู่/ยาสีฟัน', stock: 400, limit: 40, image: '/inventory/soap.png', unit: 'ชุด', category: 'ของใช้ทั่วไป' },
  ];

  useEffect(() => {
    setMounted(true);
    // 1. โหลดข้อมูลศูนย์พักพิง
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
          setTotalSheltersCount(sheltersWithIds.length);
        }
      } catch (e) { console.error(e); } finally { setLoadingShelters(false); }
    };

    // 2. โหลดสต็อกสินค้าจาก LocalStorage
    const loadInventory = () => {
      const stored = localStorage.getItem('ems_inventory');
      if (stored) setInventory(JSON.parse(stored));
      else {
        localStorage.setItem('ems_inventory', JSON.stringify(defaultInventory));
        setInventory(defaultInventory);
      }
    };

    fetchShelters();
    loadInventory();
  }, []);

  const processExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      const previewItems: any[] = [];
      data.forEach((row) => {
        const itemName = row['รายการ'] || row['item'];
        const quantity = parseInt(row['จำนวน'] || row['quantity']);
        const item = inventory.find(i => i.name === itemName);
        if (item && !isNaN(quantity)) previewItems.push({ ...item, addAmount: quantity });
      });
      setExcelPreview(previewItems);
    };
    reader.readAsBinaryString(file);
  };

  const importToCart = () => {
    const newCart = { ...cart };
    excelPreview.forEach(item => {
      if (item.addAmount > 0) newCart[item.id] = item.addAmount;
    });
    setCart(newCart);
    setExcelPreview([]);
    setUploadMode(false);
  };

  const handleInputChange = (itemId: number, value: string, limit: number, stock: number) => {
    const numValue = value === '' ? 0 : parseInt(value);
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

  const handleSubmit = () => {
    if (selectedShelters.length === 0 || Object.keys(cart).length === 0) return;

    let updatedInventory = [...inventory];
    const newRequests: any[] = [];
    const shelterCount = selectedShelters.length;

    // ตรวจสอบสต็อก
    for (const [itemId, qty] of Object.entries(cart)) {
      const totalNeeded = Number(qty) * shelterCount;
      const item = updatedInventory.find(i => i.id === Number(itemId));
      if (item && item.stock < totalNeeded) {
        alert(`สินค้า "${item.name}" ไม่เพียงพอ (ต้องการ ${totalNeeded} แต่มี ${item.stock})`);
        return;
      }
    }

    // ตัดสต็อกและสร้างใบเบิก
    selectedShelters.forEach(sId => {
      const shelter = shelters.find(s => String(s.id) === String(sId));
      Object.entries(cart).forEach(([itemId, qty]) => {
        const itemIdx = updatedInventory.findIndex(i => i.id === Number(itemId));
        if (shelter && itemIdx !== -1) {
          const item = updatedInventory[itemIdx];
          newRequests.push({
            id: Date.now() + Math.random(),
            item: item.name,
            quantity: qty,
            unit: item.unit,
            requester: shelter.name,
            status: 'PENDING',
            timestamp: Date.now()
          });
          updatedInventory[itemIdx].stock -= Number(qty);
        }
      });
    });

    // บันทึกกลับ LocalStorage
    localStorage.setItem('ems_inventory', JSON.stringify(updatedInventory));
    const oldRequests = JSON.parse(localStorage.getItem('ems_requests') || '[]');
    localStorage.setItem('ems_requests', JSON.stringify([...newRequests, ...oldRequests]));
    
    // แจ้งเตือนหน้าอื่นให้ Update สต็อก
    window.dispatchEvent(new Event('storage'));
    
    alert('บันทึกใบเบิกเรียบร้อยแล้ว!');
    router.push('/');
  };

  const downloadSampleExcel = () => {
    const ws = XLSX.utils.json_to_sheet([{ 'รายการ': 'น้ำดื่ม (แพ็ค)', 'จำนวน': 10 }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, "Sample_Requisition.xlsx");
  };

  // Helper สำหรับรูปภาพ
  const ItemIcon = ({ src }: { src: string }) => (
    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 overflow-hidden shadow-inner">
      {src.includes('/') ? <img src={src} className="w-8 h-8 object-contain" /> : <span className="text-2xl">{src}</span>}
    </div>
  );

  if (!mounted) return null;

  const filteredShelters = shelters.filter(s => s.name.includes(searchTerm) || s.district.includes(searchTerm));
  const filteredInventory = inventory.filter(item => activeCategory === 'ทั้งหมด' || item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans flex flex-col overflow-hidden relative">
      <div className="relative z-10 flex flex-col h-screen p-6">
        
        {/* Step Header */}
        <div className="flex-shrink-0 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white uppercase tracking-tight">เบิกจ่ายสิ่งของ</h1>
                <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   ศูนย์ที่เลือก: {selectedShelters.length} ที่
                </div>
              </div>
            </div>
            {step === 2 && (
              <div className="flex bg-slate-900 border border-slate-700 p-1 rounded-xl">
                <button onClick={() => setUploadMode(false)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!uploadMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>เลือกเอง</button>
                <button onClick={() => setUploadMode(true)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${uploadMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>Excel</button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex items-center gap-3 ${step >= s ? 'text-emerald-400' : 'text-slate-600'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step >= s ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'border-slate-700 bg-slate-800'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {step === 1 && (
            <div className="h-full flex flex-col">
              <div className="relative mb-6 max-w-xl mx-auto w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="text" placeholder="ค้นหาชื่อศูนย์ หรืออำเภอ..." className="w-full bg-slate-900/60 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredShelters.map((shelter) => (
                    <div key={shelter.id} onClick={() => setSelectedShelters(prev => prev.includes(String(shelter.id)) ? prev.filter(id => id !== String(shelter.id)) : [...prev, String(shelter.id)])} className={`cursor-pointer p-5 rounded-2xl border transition-all ${selectedShelters.includes(String(shelter.id)) ? 'bg-emerald-500/10 border-emerald-500 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}`}>
                       <div className="flex items-start justify-between flex-col h-full space-y-4">
                          <div className={`w-6 h-6 rounded border flex items-center justify-center ${selectedShelters.includes(String(shelter.id)) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                             {selectedShelters.includes(String(shelter.id)) && <Check className="w-4 h-4" />}
                          </div>
                          <div>
                             <h3 className="font-bold text-slate-200">{shelter.name}</h3>
                             <p className="text-xs text-slate-500 mt-1">{shelter.district}</p>
                          </div>
                       </div>
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
                      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
                        {categories.map((cat: string) => (
                          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>{cat}</button>
                        ))}
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {filteredInventory.map((item) => (
                            <div key={item.id} className={`p-5 rounded-2xl bg-slate-900/40 border transition-all ${cart[item.id] > 0 ? 'border-emerald-500/50 bg-emerald-900/5' : 'border-slate-800'}`}>
                               <div className="flex items-start justify-between mb-4">
                                  <ItemIcon src={item.image} />
                                  <div className="text-right">
                                     <p className="text-sm font-mono font-bold text-emerald-400">{item.stock}</p>
                                     <p className="text-[9px] text-slate-500">คงคลัง</p>
                                  </div>
                               </div>
                               <h3 className="text-white font-bold text-sm mb-1">{item.name}</h3>
                               <p className="text-[10px] text-slate-500 mb-4 uppercase">โควตา: {item.limit} / ที่</p>
                               <input type="number" value={cart[item.id] || ''} placeholder="0" onChange={(e) => handleInputChange(item.id, e.target.value, item.limit, item.stock)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-3 text-center font-mono font-bold text-white outline-none focus:border-emerald-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden p-6">
                       <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><ListChecks className="text-emerald-500" /> ตรวจสอบไฟล์</h3>
                       <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                          {excelPreview.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-2xl">
                               <div className="flex items-center gap-4">
                                  <ItemIcon src={item.image} />
                                  <p className="text-sm font-bold">{item.name}</p>
                               </div>
                               <p className="text-emerald-400 font-bold">+{item.addAmount}</p>
                            </div>
                          ))}
                       </div>
                       {excelPreview.length > 0 && (
                        <button onClick={importToCart} className="w-full mt-4 py-4 bg-emerald-500 rounded-2xl font-bold shadow-lg">นำเข้าทั้งหมด</button>
                       )}
                    </div>
                  )}
               </div>

               <div className="lg:col-span-4 flex flex-col h-full gap-5 pb-32">
                  {uploadMode ? (
                    <div className="space-y-4">
                       <div className="relative border-2 border-dashed border-slate-700 rounded-3xl p-10 flex flex-col items-center gap-4 text-center">
                          <input type="file" accept=".xlsx, .xls" onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <CloudUpload className="w-12 h-12 text-emerald-400" />
                          <p className="text-sm font-bold">อัปโหลดไฟล์ Excel</p>
                       </div>
                       <button onClick={downloadSampleExcel} className="w-full py-3 bg-slate-800/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-slate-400 border border-white/5"><FileSpreadsheet className="w-4 h-4" /> ตัวอย่างไฟล์</button>
                    </div>
                  ) : (
                    <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                       <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                          <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-wider"><ShoppingCart className="w-4 h-4" /> ตะกร้า (ต่อศูนย์)</h3>
                       </div>
                       <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                          {Object.keys(cart).map(itemId => {
                            const item = inventory.find(i => i.id === Number(itemId));
                            return (
                              <div key={itemId} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl">
                                 <div className="flex items-center gap-3">
                                    <span className="text-xl">{item?.image.includes('/') ? <img src={item.image} className="w-5 h-5" /> : item?.image}</span>
                                    <p className="text-xs font-bold">{item?.name}</p>
                                 </div>
                                 <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs">{cart[Number(itemId)]} <XCircle className="w-4 h-4 text-slate-600 cursor-pointer" onClick={() => { const newCart = {...cart}; delete newCart[Number(itemId)]; setCart(newCart); }} /></div>
                              </div>
                            )
                          })}
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="h-full overflow-y-auto max-w-4xl mx-auto pb-32">
               <div className="text-center py-10">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-xl"><CheckCircle2 className="w-10 h-10 text-emerald-400" /></div>
                  <h2 className="text-3xl font-bold">ยืนยันใบเบิก</h2>
                  <p className="text-slate-500 mt-2">จ่ายให้ {selectedShelters.length} ศูนย์ รวมทั้งหมด {Object.keys(cart).length} รายการ</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                     <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> ปลายทาง</h4>
                     <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {selectedShelters.map(id => <div key={id} className="text-sm bg-white/5 p-3 rounded-xl">{shelters.find(s => String(s.id) === id)?.name}</div>)}
                     </div>
                  </div>
                  <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                     <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> ยอดรวมสุทธิ</h4>
                     <div className="space-y-2">
                        {Object.entries(cart).map(([id, qty]) => {
                          const item = inventory.find(i => i.id === Number(id));
                          return (
                            <div key={id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl text-sm font-bold">
                               <span>{item?.name}</span>
                               <span className="text-emerald-400">{Number(qty) * selectedShelters.length} {item?.unit}</span>
                            </div>
                          )
                        })}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Floating Actions */}
        <div className="fixed bottom-10 right-10 flex items-center gap-3 z-[100]">
           {step > 1 && <button onClick={() => { setCart({}); setSelectedShelters([]); setStep(1); }} className="p-4 rounded-2xl bg-slate-800/80 hover:bg-red-500 text-slate-400 hover:text-white border border-white/5 transition-all shadow-2xl"><Trash2 className="w-6 h-6" /></button>}
           <button onClick={() => { if (step === 1 && selectedShelters.length > 0) setStep(2); else if (step === 2 && Object.keys(cart).length > 0) setStep(3); else if (step === 3) handleSubmit(); }} disabled={(step === 1 && selectedShelters.length === 0) || (step === 2 && Object.keys(cart).length === 0)} className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold transition-all shadow-2xl backdrop-blur-md ${(step === 1 && selectedShelters.length === 0) || (step === 2 && Object.keys(cart).length === 0) ? 'bg-slate-800 text-slate-600' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
             <span className="text-sm uppercase tracking-widest">{step === 3 ? 'ยืนยันเบิกจ่าย' : 'ถัดไป'}</span>
             {step === 3 ? <FileText className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
           </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}