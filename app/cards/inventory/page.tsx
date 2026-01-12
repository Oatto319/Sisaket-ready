'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Search,
  Plus,
  Package,
  CheckCircle2,
  CloudUpload,
  ListChecks,
  Download,
  Filter
} from 'lucide-react';

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  
  const [showRestockModal, setShowRestockModal] = useState<any>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);
  const [uploadMode, setUploadMode] = useState(false);
  const [excelPreview, setExcelPreview] = useState<any[]>([]);

  const defaultInventory = [
    { id: 1, name: 'น้ำดื่ม (แพ็ค)', stock: 500, limit: 50, image: '/inventory/water.png', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
    { id: 2, name: 'ข้าวสาร (5 กก.)', stock: 200, limit: 20, image: '/inventory/rice.png', unit: 'ถุง', category: 'อาหารและน้ำ' },
    { id: 3, name: 'บะหมี่กึ่งสำเร็จรูป', stock: 1000, limit: 100, image: '/inventory/noodle.png', unit: 'ลัง', category: 'อาหารและน้ำ' },
    { id: 4, name: 'ปลากระป๋อง', stock: 800, limit: 100, image: '/inventory/fish.png', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
    { id: 5, name: 'ยาสามัญชุดเล็ก', stock: 150, limit: 10, image: '/inventory/med.png', unit: 'ชุด', category: 'ยารักษาโรค' },
    { id: 6, name: 'ผ้าห่ม', stock: 300, limit: 50, image: '/inventory/blanket.png', unit: 'ผืน', category: 'เครื่องนุ่งห่ม' },
    { id: 7, name: 'สบู่/ยาสีฟัน', stock: 400, limit: 40, image: '/inventory/soap.png', unit: 'ชุด', category: 'ของใช้ทั่วไป' },
  ];

  useEffect(() => {
    const loadInventory = () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('ems_inventory');
            if (stored) setItems(JSON.parse(stored));
            else {
                localStorage.setItem('ems_inventory', JSON.stringify(defaultInventory));
                setItems(defaultInventory);
            }
        }
    };
    loadInventory();
    window.addEventListener('storage', loadInventory);
    return () => window.removeEventListener('storage', loadInventory);
  }, []);

  const downloadSampleExcel = () => {
    const sampleData = [
      { "รายการ": "น้ำดื่ม (แพ็ค)", "จำนวนที่เติม": 100 },
      { "รายการ": "ผ้าห่ม", "จำนวนที่เติม": 50 }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, "Template_Restock.xlsx");
  };

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
        const amount = parseInt(row['จำนวนที่เติม'] || row['amount'] || row['จำนวน']);
        const itemInInv = items.find(i => i.name === itemName);
        if (itemInInv && !isNaN(amount)) previewItems.push({ ...itemInInv, addAmount: amount });
      });
      setExcelPreview(previewItems);
    };
    reader.readAsBinaryString(file);
  };

  const confirmExcelImport = () => {
    const updatedItems = items.map(item => {
      const excelItem = excelPreview.find(ei => ei.id === item.id);
      return excelItem ? { ...item, stock: item.stock + excelItem.addAmount } : item;
    });
    setItems(updatedItems);
    localStorage.setItem('ems_inventory', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('storage'));
    setExcelPreview([]);
    setUploadMode(false);
  };

  const handleRestock = () => {
    if (!showRestockModal || restockAmount <= 0) return;
    const updatedItems = items.map(item => 
      item.id === showRestockModal.id ? { ...item, stock: item.stock + Number(restockAmount) } : item
    );
    setItems(updatedItems);
    localStorage.setItem('ems_inventory', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('storage'));
    setShowRestockModal(null);
    setRestockAmount(0);
  };

  const filteredItems = items.filter(item => (activeCategory === 'ทั้งหมด' || item.category === activeCategory) && item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const RenderItemImage = ({ src, name, sizeClass = "w-12 h-12" }: { src: string, name: string, sizeClass?: string }) => {
    const isPng = src.includes('.png') || src.includes('/');
    return (
      <div className={`${sizeClass} flex items-center justify-center bg-blue-50 rounded-2xl overflow-hidden border border-blue-100 group-hover:scale-105 transition-transform`}>
        {isPng ? (
          <img src={src} alt={name} className="w-full h-full object-contain p-2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <span className="text-2xl">{src}</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-blue-50/60 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">คลังทรัพยากร</h1>
              <div className="text-sm text-blue-600 font-bold flex items-center gap-2 mt-1 uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> SISAKET READY STOCK
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex bg-slate-200/50 backdrop-blur-sm border border-slate-200 p-1.5 rounded-2xl w-full md:w-auto">
                <button onClick={() => setUploadMode(false)} className={`flex-1 md:px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${!uploadMode ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>รายการสินค้า</button>
                <button onClick={() => setUploadMode(true)} className={`flex-1 md:px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${uploadMode ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>นำเข้า Excel</button>
             </div>
          </div>
        </div>

        {!uploadMode ? (
          <>
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="ค้นหาชื่อรายการสิ่งของ..." className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               </div>
               <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
                  {['ทั้งหมด', 'อาหารและน้ำ', 'ยารักษาโรค', 'เครื่องนุ่งห่ม'].map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}>{cat}</button>
                  ))}
               </div>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-xl hover:shadow-blue-900/5 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                      <Package size={80} />
                   </div>
                   <RenderItemImage src={item.image} name={item.name} sizeClass="w-20 h-20 mb-6 shadow-sm" />
                   <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{item.name}</h3>
                   <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-8">{item.category}</p>
                   
                   <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">คงเหลือในคลัง</p>
                         <p className="text-2xl font-black text-slate-900 leading-none">{item.stock.toLocaleString()} <span className="text-xs font-bold text-slate-500">{item.unit}</span></p>
                      </div>
                      <button onClick={() => setShowRestockModal(item)} className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all flex items-center justify-center group-hover:scale-110 active:scale-95">
                        <Plus className="w-6 h-6" />
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Left: Preview */}
             <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-8">
                   <div>
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ListChecks size={20} /></div>
                        ตรวจสอบข้อมูลนำเข้า
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium">เตรียมนำเข้า <span className="text-blue-600 font-bold">{excelPreview.length}</span> รายการสู่ระบบ</p>
                   </div>
                   {excelPreview.length > 0 && (
                      <button onClick={confirmExcelImport} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 transition-all flex items-center gap-2 active:scale-95">
                        <CheckCircle2 className="w-5 h-5" /> อัปเดตสต็อกทันที
                      </button>
                   )}
                </div>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {excelPreview.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300">
                       <CloudUpload size={48} className="mb-4 opacity-40" />
                       <p className="text-sm font-bold uppercase tracking-widest">ยังไม่มีข้อมูลสำหรับการนำเข้า</p>
                    </div>
                  ) : (
                    excelPreview.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-3xl hover:border-blue-200 transition-colors shadow-sm">
                        <div className="flex items-center gap-5">
                           <RenderItemImage src={item.image} name={item.name} sizeClass="w-12 h-12 shadow-sm" />
                           <div>
                              <p className="text-base font-bold text-slate-900">{item.name}</p>
                              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{item.category}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-black text-emerald-600">+{item.addAmount.toLocaleString()}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">ยอดใหม่: {(item.stock + item.addAmount).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>

             {/* Right: Actions */}
             <div className="lg:col-span-4 space-y-6">
                <div className="relative group border-4 border-dashed border-slate-200 hover:border-blue-400 bg-white rounded-[3rem] p-10 transition-all flex flex-col items-center gap-6 text-center shadow-sm cursor-pointer min-h-[300px] justify-center">
                   <input type="file" accept=".xlsx, .xls" onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform shadow-inner">
                      <CloudUpload className="w-10 h-10 text-blue-600" />
                   </div>
                   <div>
                      <p className="text-slate-900 font-black text-lg uppercase tracking-tight leading-none">อัปโหลดไฟล์ EXCEL</p>
                      <p className="text-xs text-slate-500 mt-3 font-medium px-4">เลือกไฟล์เทมเพลตที่เตรียมไว้เพื่ออัปเดตสต็อกจำนวนมากในครั้งเดียว</p>
                   </div>
                </div>

                <button onClick={downloadSampleExcel} className="w-full py-5 rounded-[2rem] bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group active:scale-95">
                   <Download className="w-5 h-5 text-blue-400 group-hover:translate-y-1 transition-transform" />
                   <span className="text-sm font-bold uppercase tracking-widest">ดาวน์โหลดตัวอย่างไฟล์</span>
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Modal Re-designed */}
      {showRestockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl border border-slate-100">
              <div className="flex items-center gap-5 mb-10">
                 <RenderItemImage src={showRestockModal.image} name={showRestockModal.name} sizeClass="w-20 h-20 shadow-lg" />
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">เติมสต็อกสินค้า</h3>
                    <p className="text-blue-600 text-xs font-bold tracking-widest uppercase">{showRestockModal.name}</p>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">จำนวนที่ต้องการเพิ่ม ({showRestockModal.unit})</label>
                    <input type="number" className="w-full bg-transparent text-slate-900 text-5xl font-black outline-none placeholder:text-slate-200" autoFocus placeholder="000" value={restockAmount === 0 ? '' : restockAmount} onChange={(e) => setRestockAmount(Number(e.target.value))} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { setShowRestockModal(null); setRestockAmount(0); }} className="py-5 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">ยกเลิก</button>
                    <button onClick={handleRestock} className="py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-100 active:scale-95">ยืนยันการเติม</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}