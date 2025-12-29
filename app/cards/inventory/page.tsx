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
  FileSpreadsheet,
  CloudUpload,
  ListChecks,
  Download
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
    { id: 1, name: 'น้ำดื่ม (แพ็ค)', stock: 500, limit: 50, image: '💧', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
    { id: 2, name: 'ข้าวสาร (5 กก.)', stock: 200, limit: 20, image: '🌾', unit: 'ถุง', category: 'อาหารและน้ำ' },
    { id: 3, name: 'บะหมี่กึ่งสำเร็จรูป', stock: 1000, limit: 100, image: '🍜', unit: 'ลัง', category: 'อาหารและน้ำ' },
    { id: 4, name: 'ปลากระป๋อง', stock: 800, limit: 100, image: '🐟', unit: 'แพ็ค', category: 'อาหารและน้ำ' },
    { id: 5, name: 'ยาสามัญชุดเล็ก', stock: 150, limit: 10, image: '💊', unit: 'ชุด', category: 'ยารักษาโรค' },
    { id: 6, name: 'ผ้าห่ม', stock: 300, limit: 50, image: '🧣', unit: 'ผืน', category: 'เครื่องนุ่งห่ม' },
    { id: 7, name: 'สบู่/ยาสีฟัน', stock: 400, limit: 40, image: '🧼', unit: 'ชุด', category: 'ของใช้ทั่วไป' },
  ];

  useEffect(() => {
    const loadInventory = () => {
        const stored = localStorage.getItem('ems_inventory');
        if (stored) setItems(JSON.parse(stored));
        else {
            localStorage.setItem('ems_inventory', JSON.stringify(defaultInventory));
            setItems(defaultInventory);
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
    XLSX.writeFile(wb, "Template_เติมสินค้า.xlsx");
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

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - ขนาดกำลังดี */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight">คลังทรัพยากร</h1>
              <div className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> ระบบสต็อกส่วนกลาง
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-900 border border-slate-700 p-1 rounded-2xl">
                <button onClick={() => setUploadMode(false)} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${!uploadMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>รายการ</button>
                <button onClick={() => setUploadMode(true)} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${uploadMode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>นำเข้า Excel</button>
             </div>
             {!uploadMode && (
               <div className="relative w-56">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="ค้นหา..." className="w-full bg-slate-900/60 border border-slate-700 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/40 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               </div>
             )}
          </div>
        </div>

        {!uploadMode ? (
          /* สินค้า - 4 คอลัมน์ อ่านง่ายขึ้น */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-5 hover:bg-slate-800/60 transition-all group">
                 <div className="text-3xl mb-3 p-3 bg-slate-800/50 rounded-2xl w-fit group-hover:scale-110 transition-transform">{item.image}</div>
                 <h3 className="font-bold text-white text-base mb-1 truncate">{item.name}</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">{item.category}</p>
                 <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                    <div>
                       <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">คงเหลือ</p>
                       <p className="text-2xl font-mono font-black text-emerald-500">{item.stock} <span className="text-xs font-sans text-slate-500">{item.unit}</span></p>
                    </div>
                    <button onClick={() => setShowRestockModal(item)} className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-md transition-all"><Plus className="w-5 h-5" /></button>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          /* โหมดนำเข้า - สัดส่วน 8:4 สมดุลขึ้น */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
             {/* ซ้าย: Preview */}
             <div className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-7">
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <h3 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight"><ListChecks className="text-emerald-500 w-5 h-5" /> ตรวจสอบรายการ</h3>
                      <p className="text-xs text-slate-500 mt-1">พบข้อมูล {excelPreview.length} รายการที่พร้อมนำเข้า</p>
                   </div>
                   {excelPreview.length > 0 && (
                      <button onClick={confirmExcelImport} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> ยืนยันทั้งหมด
                      </button>
                   )}
                </div>
                
                <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {excelPreview.length === 0 ? (
                    <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-600">
                       <Package size={40} className="mb-3 opacity-20" />
                       <p className="text-xs font-bold uppercase tracking-widest opacity-40">ยังไม่มีข้อมูล</p>
                    </div>
                  ) : (
                    excelPreview.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/40 border border-white/5 rounded-2xl hover:bg-slate-800/60 transition-colors">
                        <div className="flex items-center gap-4">
                           <span className="text-2xl">{item.image}</span>
                           <div>
                              <p className="text-sm font-bold text-white">{item.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase">{item.category}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-base font-mono font-black text-emerald-400">+{item.addAmount}</p>
                           <p className="text-[9px] text-slate-500 font-medium uppercase">สุทธิ: {item.stock + item.addAmount}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>

             {/* ขวา: อัปโหลด */}
             <div className="lg:col-span-4 space-y-4">
                <div className="relative group border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/40 rounded-[2.5rem] p-10 transition-all flex flex-col items-center gap-5 text-center min-h-[250px] justify-center">
                   <input type="file" accept=".xlsx, .xls" onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <CloudUpload className="w-7 h-7 text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-white font-bold text-sm uppercase tracking-tight">อัปโหลดไฟล์ Excel</p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed">ลากไฟล์มาวาง หรือ คลิกที่นี่</p>
                   </div>
                </div>

                <button onClick={downloadSampleExcel} className="w-full py-4 rounded-[1.5rem] bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-white/5 transition-all flex items-center justify-center gap-3 group">
                   <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                   <span className="text-xs font-bold uppercase tracking-wider">ดาวน์โหลดตัวอย่าง</span>
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Modal เติมของ */}
      {showRestockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
           <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-3xl border border-emerald-500/20 shadow-inner">{showRestockModal.image}</div>
                 <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">เติมสต๊อก</h3>
                    <p className="text-slate-400 text-xs font-medium">{showRestockModal.name}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">ระบุจำนวนที่เติม</label>
                    <input type="number" className="w-full bg-transparent text-white text-3xl font-mono font-black outline-none" autoFocus placeholder="0" value={restockAmount === 0 ? '' : restockAmount} onChange={(e) => setRestockAmount(Number(e.target.value))} />
                 </div>
                 <div className="flex gap-3 pt-2">
                    <button onClick={() => { setShowRestockModal(null); setRestockAmount(0); }} className="flex-1 py-4 rounded-2xl bg-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-widest transition-all">ยกเลิก</button>
                    <button onClick={handleRestock} className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-emerald-600/20">ยืนยันการเติม</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}