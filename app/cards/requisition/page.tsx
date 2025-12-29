'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Search,
  Check,
  Package,
  MapPin,
  ChevronRight,
  ShoppingCart,
  FileText,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  CloudUpload,
  Settings2,
  PlusCircle,
  AlertCircle,
  ListChecks
} from 'lucide-react';

export default function RequisitionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  
  const [uploadMode, setUploadMode] = useState(false); 
  const [excelPreview, setExcelPreview] = useState<any[]>([]); 
  
  const [selectedShelters, setSelectedShelters] = useState<number[]>([]);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [inventory, setInventory] = useState<any[]>([]);

  const categories = ['ทั้งหมด', 'อาหารและน้ำ', 'ยารักษาโรค', 'เครื่องนุ่งห่ม', 'ของใช้ทั่วไป'];

  const shelters = [
    { id: 1, name: 'โรงเรียนสตรีสิริเกศ', district: 'เมืองศรีสะเกษ' },
    { id: 2, name: 'อาคารเฉลิมพระเกียรติฯ', district: 'กันทรลักษ์' },
    { id: 3, name: 'วัดมหาพุทธาราม', district: 'เมืองศรีสะเกษ' },
    { id: 4, name: 'อบต. หญ้าปล้อง', district: 'เมืองศรีสะเกษ' },
    { id: 5, name: 'โรงเรียนขุขันธ์', district: 'ขุขันธ์' },
  ];

  useEffect(() => {
     const storedInv = localStorage.getItem('ems_inventory');
     if (storedInv) {
        setInventory(JSON.parse(storedInv));
     } else {
        const defaultInv = [
            { id: 1, name: 'น้ำดื่ม (แพ็ค)', stock: 500, limit: 50, image: '💧', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
            { id: 2, name: 'ข้าวสาร (5 กก.)', stock: 200, limit: 20, image: '🌾', unit: 'ถุง', category: 'อาหารและน้ำ' },
            { id: 3, name: 'บะหมี่กึ่งสำเร็จรูป', stock: 1000, limit: 100, image: '🍜', unit: 'ลัง', category: 'อาหารและน้ำ' },
            { id: 4, name: 'ปลากระป๋อง', stock: 800, limit: 100, image: '🐟', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
            { id: 5, name: 'ยาสามัญชุดเล็ก', stock: 150, limit: 10, image: '💊', unit: 'ชุด', category: 'ยารักษาโรค' },
            { id: 6, name: 'ผ้าห่ม', stock: 300, limit: 50, image: '🧣', unit: 'ผืน', category: 'เครื่องนุ่งห่ม' },
            { id: 7, name: 'สบู่/ยาสีฟัน', stock: 400, limit: 40, image: '🧼', unit: 'ชุด', category: 'ของใช้ทั่วไป' },
        ];
        setInventory(defaultInv);
        localStorage.setItem('ems_inventory', JSON.stringify(defaultInv));
     }
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
        const itemInInv = inventory.find(i => i.name === itemName);
        if (itemInInv && !isNaN(quantity)) {
          previewItems.push({ ...itemInInv, requestQty: quantity });
        }
      });
      setExcelPreview(previewItems);
    };
    reader.readAsBinaryString(file);
  };

  const importToCart = () => {
    const newCart = { ...cart };
    excelPreview.forEach(item => {
      const safeQty = Math.max(0, Math.min(item.limit, Math.min(item.stock, item.requestQty)));
      if (safeQty > 0) {
        newCart[item.id] = (newCart[item.id] || 0) + safeQty;
      }
    });
    setCart(newCart);
    setExcelPreview([]);
    setUploadMode(false);
    alert('นำเข้าข้อมูลเรียบร้อยแล้ว');
  };

  const downloadSampleExcel = () => {
    const sampleData = [{ 'รายการ': 'น้ำดื่ม (แพ็ค)', 'จำนวน': 10 }, { 'รายการ': 'ผ้าห่ม', 'จำนวน': 5 }];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    XLSX.writeFile(workbook, "Sample_Requisition.xlsx");
  };

  const handleInputChange = (itemId: number, value: string, limit: number, stock: number) => {
    const numValue = value === '' ? 0 : parseInt(value);
    if (isNaN(numValue)) return;
    const safeValue = Math.max(0, Math.min(limit, Math.min(stock, numValue)));
    setCart(prev => {
      if (safeValue === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: safeValue };
    });
  };

  const removeItem = (id: number) => {
    setCart(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = () => {
    const newRequests: any[] = [];
    let updatedInventory = [...inventory];
    const shelterCount = selectedShelters.length;

    // ตรวจสอบสต็อกรวมก่อนว่าพอจ่ายให้ทุกที่หรือไม่
    for (const [itemId, qty] of Object.entries(cart)) {
        const totalNeeded = Number(qty) * shelterCount;
        const item = updatedInventory.find(i => i.id === Number(itemId));
        if (item && item.stock < totalNeeded) {
            alert(`สินค้า "${item.name}" มีสต็อกไม่เพียงพอสำหรับ ${shelterCount} ศูนย์ (ต้องการ ${totalNeeded} แต่มี ${item.stock})`);
            return;
        }
    }

    // ทำรายการตัดสต็อกจริง
    selectedShelters.forEach(shelterId => {
       const shelter = shelters.find(s => s.id === shelterId);
       Object.entries(cart).forEach(([itemId, qty]) => {
          const itemIndex = updatedInventory.findIndex(i => i.id === Number(itemId));
          if (shelter && itemIndex !== -1) {
             const item = updatedInventory[itemIndex];
             newRequests.push({
                id: Date.now() + Math.random(),
                itemId: item.id,
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
             // หักสต็อกทีละรายการ (qty ต่อ 1 ศูนย์)
             updatedInventory[itemIndex] = { ...item, stock: item.stock - Number(qty) };
          }
       });
    });

    localStorage.setItem('ems_requests', JSON.stringify([...newRequests, ...(JSON.parse(localStorage.getItem('ems_requests') || '[]'))]));
    localStorage.setItem('ems_inventory', JSON.stringify(updatedInventory));
    window.dispatchEvent(new Event('storage'));
    alert(`บันทึกใบเบิกเรียบร้อย! (เบิกจ่ายให้ทั้งหมด ${shelterCount} ศูนย์พักพิง)`);
    router.push('/');
  };

  const filteredShelters = shelters.filter(s => s.name.includes(searchTerm) || s.district.includes(searchTerm));
  const filteredInventory = inventory.filter(item => activeCategory === 'ทั้งหมด' || item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen p-6">
        <div className="flex-shrink-0 mb-8">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">เบิกจ่ายสิ่งของ</h1>
                    <p className="text-sm text-slate-400">สร้างใบเบิกสำหรับศูนย์พักพิง ({selectedShelters.length} ศูนย์ที่เลือก)</p>
                </div>
             </div>
             
             {step === 2 && (
               <div className="flex bg-slate-900/80 border border-slate-700 p-1 rounded-xl">
                  <button onClick={() => { setUploadMode(false); setExcelPreview([]); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${!uploadMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                    <Settings2 className="w-4 h-4" /> เลือกเอง
                  </button>
                  <button onClick={() => setUploadMode(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${uploadMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                    <FileSpreadsheet className="w-4 h-4" /> อัปโหลด Excel
                  </button>
               </div>
             )}
          </div>
          
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
             {[1, 2, 3].map((s, idx) => (
                <div key={s} className="flex items-center gap-4">
                    <div className={`flex items-center gap-3 ${step >= s ? 'text-emerald-400' : 'text-slate-600'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step >= s ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-slate-700 bg-slate-800'}`}>{s}</div>
                    </div>
                    {idx < 2 && <div className="w-16 h-[2px] bg-slate-700 relative rounded-full overflow-hidden"><div className={`absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-500 ${step > s ? 'w-full' : 'w-0'}`} /></div>}
                </div>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {step === 1 && (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="relative mb-6 max-w-xl mx-auto w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" placeholder="ค้นหาชื่อศูนย์ หรืออำเภอ..." className="w-full bg-slate-900/60 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-32">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {filteredShelters.map((shelter) => (
                        <div key={shelter.id} onClick={() => setSelectedShelters(prev => prev.includes(shelter.id) ? prev.filter(id => id !== shelter.id) : [...prev, shelter.id])} className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${selectedShelters.includes(shelter.id) ? 'bg-emerald-500/10 border-emerald-500 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}`}>
                           <div className="flex items-start justify-between space-y-3 flex-col">
                                 <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${selectedShelters.includes(shelter.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 bg-slate-800'}`}>{selectedShelters.includes(shelter.id) && <Check className="w-4 h-4 text-white" />}</div>
                                 <div>
                                    <h3 className={`font-bold ${selectedShelters.includes(shelter.id) ? 'text-white' : 'text-slate-300'}`}>{shelter.name}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {shelter.district}</p>
                                 </div>
                           </div>
                        </div>
                      ))}
                  </div>
               </div>
            </div>
          )}

          {step === 2 && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in fade-in duration-300">
                <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                   {!uploadMode ? (
                      <>
                        <div className="flex-shrink-0 mb-6 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {categories.map((cat: string) => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>{cat}</button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-32">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredInventory.map((item) => {
                                    const qty = cart[item.id] || 0;
                                    const totalQty = qty * selectedShelters.length;
                                    return (
                                        <div key={item.id} className={`p-5 rounded-2xl bg-slate-900/40 border transition-all ${qty > 0 ? 'border-emerald-500/50 bg-emerald-900/5 shadow-md' : 'border-slate-800 hover:border-slate-700'}`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-white/5">{item.image}</div>
                                                <div className="text-right">
                                                   <p className={`text-sm font-mono font-bold ${item.stock < totalQty ? 'text-red-400' : 'text-emerald-400'}`}>{item.stock}</p>
                                                   <p className="text-[9px] text-slate-500 uppercase">Available</p>
                                                </div>
                                            </div>
                                            <h3 className="text-white font-bold text-sm mb-1">{item.name}</h3>
                                            <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-wider">โควตา: {item.limit} / ศูนย์</p>
                                            <input type="number" value={qty === 0 ? '' : qty} placeholder="ใส่จำนวน/ศูนย์" onChange={(e) => handleInputChange(item.id, e.target.value, item.limit, item.stock)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-3 text-center font-mono font-bold text-white outline-none focus:border-emerald-500" />
                                            {qty > 0 && <p className="text-[10px] text-amber-500 mt-2 text-center font-bold">รวมเบิกทั้งสิ้น: {totalQty} {item.unit}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                      </>
                   ) : (
                      <div className="flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
                         <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div>
                               <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans"><ListChecks className="text-emerald-500" /> ตรวจสอบรายการจาก Excel</h3>
                               <p className="text-xs text-slate-500">จำนวนนี้จะถูกจ่ายให้ทั้ง {selectedShelters.length} ศูนย์</p>
                            </div>
                            {excelPreview.length > 0 && (
                               <button onClick={importToCart} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold shadow-lg">
                                  <PlusCircle className="w-4 h-4" /> นำเข้ารวมหลัก
                               </button>
                            )}
                         </div>
                         <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {excelPreview.length === 0 ? (
                               <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                  <AlertCircle className="w-12 h-12 mb-2" />
                                  <p className="text-sm">ยังไม่มีข้อมูล โปรดอัปโหลดไฟล์</p>
                               </div>
                            ) : (
                               excelPreview.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl">
                                     <div className="flex items-center gap-4">
                                        <span className="text-2xl">{item.image}</span>
                                        <div><p className="text-sm font-bold text-white mb-1">{item.name}</p></div>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-xs font-black text-emerald-400 font-mono">ให้ที่ละ: {item.requestQty}</p>
                                        <p className="text-[10px] text-amber-500 font-bold uppercase">รวม: {item.requestQty * selectedShelters.length} {item.unit}</p>
                                     </div>
                                  </div>
                               ))
                            )}
                         </div>
                      </div>
                   )}
                </div>

                <div className="lg:col-span-4 flex flex-col h-full gap-5 overflow-hidden pb-32">
                   {uploadMode ? (
                      <div className="flex-shrink-0 space-y-3">
                         <div className="relative group border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/40 rounded-3xl p-8 transition-all flex flex-col items-center gap-4 text-center">
                            <input type="file" accept=".xlsx, .xls" onChange={(e) => { const file = e.target.files?.[0]; if(file) processExcel(file); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <CloudUpload className="w-12 h-12 text-emerald-400" />
                            <div><p className="text-white font-bold text-sm">ลากไฟล์ Excel วางที่นี่</p></div>
                         </div>
                         <button onClick={downloadSampleExcel} className="w-full py-3 rounded-xl bg-slate-800/40 text-slate-400 text-xs font-bold border border-white/5 flex items-center justify-center gap-2"><FileSpreadsheet className="w-4 h-4" /> ตัวอย่างไฟล์</button>
                      </div>
                   ) : (
                      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                           <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2 font-mono"><ShoppingCart className="w-4 h-4 text-emerald-500" /> ตะกร้า (ต่อศูนย์)</h3>
                           <span className="text-[10px] px-2 py-1 bg-emerald-500 text-white rounded-md font-black">{Object.keys(cart).length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                          {Object.keys(cart).length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-40"><Package className="w-10 h-10 mb-2" /><p className="text-[10px] font-bold uppercase">ว่างเปล่า</p></div>
                          ) : (
                            Object.entries(cart).map(([itemId, qty]) => {
                               const item = inventory.find(i => i.id === Number(itemId));
                               return (
                                  <div key={itemId} className="flex items-center justify-between p-3 bg-slate-800/30 border border-white/5 rounded-xl group transition-all">
                                     <div className="flex items-center gap-3">
                                        <span className="text-xl">{item?.image}</span>
                                        <div>
                                           <p className="text-xs font-bold text-white leading-none mb-1">{item?.name}</p>
                                           <p className="text-[10px] font-bold text-emerald-400 uppercase">{qty} {item?.unit} / ที่</p>
                                        </div>
                                     </div>
                                     <button onClick={() => removeItem(Number(itemId))} className="p-1.5 hover:text-red-400 text-slate-600"><XCircle className="w-4 h-4" /></button>
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
            <div className="h-full overflow-y-auto custom-scrollbar pr-2 pb-32 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-xl">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">ยืนยันการเบิกจ่าย</h2>
                    <p className="text-slate-500 text-sm mt-2">ตรวจสอบยอดรวมสำหรับการจ่ายให้ทั้ง {selectedShelters.length} ศูนย์</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
                    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> ปลายทาง ({selectedShelters.length})</h3>
                        <ul className="space-y-3">
                            {selectedShelters.map(id => <li key={id} className="text-sm bg-white/5 p-3 rounded-xl text-slate-300">{shelters.find(s => s.id === id)?.name}</li>)}
                        </ul>
                    </div>
                    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" /> ยอดเบิกสุทธิ (รวมทุกศูนย์)</h3>
                        <ul className="space-y-3">
                            {Object.entries(cart).map(([itemId, qty]) => {
                                const item = inventory.find(i => i.id === Number(itemId));
                                const total = Number(qty) * selectedShelters.length;
                                return <li key={itemId} className="flex justify-between items-center bg-white/5 p-3 rounded-xl text-sm text-slate-300"><span>{item?.name}</span><span className="font-mono text-emerald-400 font-bold">{total} {item?.unit}</span></li>
                            })}
                        </ul>
                    </div>
                </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-10 right-10 flex items-center gap-3 z-[100]">
            {step > 1 && (
                <button onClick={() => { if(confirm('ยกเลิกรายการทั้งหมด?')) { setSelectedShelters([]); setCart({}); setStep(1); } }} className="p-4 rounded-2xl bg-slate-800/80 hover:bg-red-500 text-slate-400 hover:text-white border border-white/5 transition-all shadow-2xl backdrop-blur-md">
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
                className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold transition-all shadow-2xl backdrop-blur-md ${
                    ((step === 1 && selectedShelters.length === 0) || (step === 2 && Object.keys(cart).length === 0))
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
            >
                <span className="text-sm uppercase tracking-widest font-sans">{step === 3 ? 'ยืนยันการเบิกจ่าย' : 'ถัดไป'}</span>
                {step === 3 ? <FileText className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}