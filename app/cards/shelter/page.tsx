'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  Building2,
  Plus,
  Download,
  Upload,
  X,
  AlertCircle,
  Search
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Shelter {
  id: string | number;
  name: string;
  district: string;
  capacity: number;
  occupied: number;
  status: string;
  phone: string;
}

export default function ShelterPage() {
  const router = useRouter();

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // ✅ State สำหรับการค้นหา
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    district: '',
    capacity: '',
    occupied: '',
    status: 'OPEN',
    phone: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await fetch('/api/centers');
        if (!response.ok) throw new Error('Network response was not ok');
        let data = await response.json();

        const sheltersWithIds = (data || []).map((shelter: any, index: number) => {
          if (!shelter.id) {
            return { ...shelter, id: index + 1 };
          }
          return shelter;
        });

        setShelters(sheltersWithIds);
      } catch (error) {
        console.error("Failed to fetch shelters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  // ✅ แก้ไขฟังก์ชันการกรองข้อมูลให้ปลอดภัย (ป้องกันค่า null/undefined จากฐานข้อมูล)
  const filteredShelters = shelters.filter(shelter => {
    const name = shelter.name || ""; 
    const district = shelter.district || "";
    const search = searchQuery.toLowerCase();
    
    return (
      name.toLowerCase().includes(search) ||
      district.toLowerCase().includes(search)
    );
  });

  const handleAddShelter = () => {
    setError('');
    if (!formData.name || !formData.district || !formData.capacity || !formData.phone) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const capacity = parseInt(formData.capacity) || 0;
    const occupied = parseInt(formData.occupied) || 0;

    const newShelter: Shelter = {
      id: Math.max(...shelters.map(s => typeof s.id === 'number' ? s.id : 0), 0) + 1,
      name: formData.name,
      district: formData.district,
      capacity,
      occupied: Math.min(occupied, capacity),
      status: formData.status,
      phone: formData.phone
    };

    setShelters([...shelters, newShelter]);
    setFormData({ name: '', district: '', capacity: '', occupied: '', status: 'OPEN', phone: '' });
    setShowAddModal(false);
    alert('✅ เพิ่มศูนย์พักพิงสำเร็จ');
  };

  const handleExportExcel = async () => {
    try {
      const data = shelters.map(s => ({
        'ชื่อศูนย์': s.name,
        'อำเภอ': s.district,
        'ความจุ (คน)': s.capacity,
        'ผู้พักพิง (คน)': s.occupied,
        'สถานะ': s.status,
        'เบอร์โทรศัพท์': s.phone
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ศูนย์พักพิง');
      XLSX.writeFile(wb, `shelters_${new Date().getTime()}.xlsx`);
      alert('✅ ส่งออกข้อมูลสำเร็จ');
    } catch (error) {
      alert('❌ ส่งออกข้อมูลล้มเหลว');
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        const importedShelters: Shelter[] = [];
        const startId = Math.max(...shelters.map(s => typeof s.id === 'number' ? s.id : 0), 0) + 1;

        jsonData.forEach((row: any) => {
          const name = row['ชื่อศูนย์'] || row['name'] || '';
          if (name) {
            importedShelters.push({
              id: startId + importedShelters.length,
              name,
              district: row['อำเภอ'] || row['district'] || '',
              capacity: parseInt(row['ความจุ (คน)'] || row['capacity'] || 0),
              occupied: parseInt(row['ผู้พักพิง (คน)'] || row['occupied'] || 0),
              status: row['สถานะ'] || row['status'] || 'OPEN',
              phone: row['เบอร์โทรศัพท์'] || row['phone'] || ''
            });
          }
        });
        setShelters([...shelters, ...importedShelters]);
        setShowImportModal(false);
        alert(`✅ นำเข้าข้อมูล ${importedShelters.length} แห่งสำเร็จ`);
      } catch (error) {
        setError('❌ ไฟล์ไม่ถูกต้อง');
      }
    };
    reader.readAsBinaryString(file);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'FULL': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'เปิดรับ';
      case 'FULL': return 'เต็ม';
      default: return 'สำรอง';
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-slate-400 font-sans">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sticky top-0 bg-[#0B1120]/80 backdrop-blur-md py-4 z-20 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 transition-all shadow-lg">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">รายชื่อศูนย์พักพิง</h1>
              <p className="text-sm text-slate-400">ทั้งหมด ({shelters.length} แห่ง)</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex-1 sm:flex-none">
              <Plus className="w-4 h-4" /> เพิ่ม
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex-1 sm:flex-none">
              <Download className="w-4 h-4" /> ส่งออก
            </button>
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all flex-1 sm:flex-none">
              <Upload className="w-4 h-4" /> นำเข้า
            </button>
          </div>
        </div>

        {/* ✅ Search Box */}
        <div className="relative mb-6 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="ค้นหาชื่อศูนย์ หรือ ชื่ออำเภอ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* List View */}
        <div className="space-y-3">
          {filteredShelters.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
              <p className="text-slate-500">ไม่พบข้อมูลที่ค้นหา</p>
            </div>
          ) : (
            filteredShelters.map((shelter, index) => {
              const safeCapacity = shelter.capacity || 1; 
              const percent = Math.round((shelter.occupied / safeCapacity) * 100);
              return (
                <div key={`s-${shelter.id}-${index}`} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 min-w-[3rem] text-center px-2 py-1 rounded-lg border text-xs font-bold ${getStatusColor(shelter.status)}`}>
                      {getStatusLabel(shelter.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{shelter.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {shelter.district || 'ไม่ระบุอำเภอ'}</span>
                        <span className="hidden sm:flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> ความจุ {shelter.capacity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 pl-14 sm:pl-0">
                    <div className="flex-1 sm:w-32">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">ผู้พักพิง</span>
                        <span className={percent > 90 ? 'text-red-400' : 'text-emerald-400'}>{shelter.occupied} คน</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${shelter.phone}`} className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 transition-colors border border-slate-700"><Phone className="w-4 h-4" /></a>
                      <button className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-400 transition-colors border border-slate-700"><Navigation className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Add */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white text-lg">เพิ่มศูนย์พักพิง</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-sm text-red-200">{error}</div>}
              <input type="text" placeholder="ชื่อศูนย์" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
              <input type="text" placeholder="อำเภอ" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="ความจุ" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
                <input type="number" placeholder="ปัจจุบัน" value={formData.occupied} onChange={e => setFormData({...formData, occupied: e.target.value})} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
              </div>
              <input type="tel" placeholder="เบอร์โทร" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
            </div>
            <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-lg bg-slate-800 text-white font-bold transition-colors">ยกเลิก</button>
              <button onClick={handleAddShelter} className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold transition-colors">เพิ่มข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white text-lg">นำเข้า Excel</h3>
              <button onClick={() => setShowImportModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-10 border-2 border-dashed border-slate-700 rounded-xl text-center group hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer transition-colors">
                  เลือกไฟล์ .xlsx
                  <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-slate-800 bg-slate-900/50">
              <button onClick={() => setShowImportModal(false)} className="w-full py-2 rounded-lg bg-slate-800 text-white font-bold transition-colors">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}