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
  AlertCircle
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
          if (!shelter.id || shelter.id === undefined || shelter.id === null) {
            return {
              ...shelter,
              id: index + 1
            };
          }
          return shelter;
        });

        setShelters(sheltersWithIds);
        console.log(`✅ Loaded ${sheltersWithIds.length} shelters`);
      } catch (error) {
        console.error("Failed to fetch shelters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  // ✅ ฟังก์ชัน Add Shelter
  const handleAddShelter = () => {
    setError('');
    
    if (!formData.name || !formData.district || !formData.capacity || !formData.phone) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const capacity = parseInt(formData.capacity) || 0;
    const occupied = parseInt(formData.occupied) || 0;

    if (capacity <= 0) {
      setError('ความจุต้องมากกว่า 0');
      return;
    }

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

  // ✅ ฟังก์ชัน Export Excel (.xlsx)
  const handleExportExcel = async () => {
    try {
      // สร้าง data array
      const data = shelters.map(s => ({
        'ชื่อศูนย์': s.name,
        'อำเภอ': s.district,
        'ความจุ (คน)': s.capacity,
        'ผู้พักพิง (คน)': s.occupied,
        'สถานะ': s.status,
        'เบอร์โทรศัพท์': s.phone
      }));

      // สร้าง workbook
      const ws = XLSX.utils.json_to_sheet(data);
      
      // ตั้งค่าความกว้างของคอลัมน์
      const colWidths = [25, 20, 15, 15, 12, 18];
      ws['!cols'] = colWidths.map(width => ({ wch: width }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ศูนย์พักพิง');

      // ดาวน์โหลด
      const fileName = `shelters_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      alert('✅ ส่งออกข้อมูลสำเร็จ');
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ ส่งออกข้อมูลล้มเหลว');
    }
  };

  // ✅ ฟังก์ชัน Import Excel (.xlsx)
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // อ่าน sheet แรก
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // แปลงเป็น JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setError('ไฟล์ไม่มีข้อมูล');
          return;
        }

        // แปลง JSON เป็น Shelter objects
        const importedShelters: Shelter[] = [];
        const startId = Math.max(...shelters.map(s => typeof s.id === 'number' ? s.id : 0), 0) + 1;

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i] as any;
          
          // ตรวจสอบว่ามีข้อมูลสำคัญหรือไม่
          const name = row['ชื่อศูนย์'] || row['name'] || '';
          const district = row['อำเภอ'] || row['district'] || '';
          const capacity = parseInt(row['ความจุ (คน)'] || row['capacity'] || 0) || 0;
          const occupied = parseInt(row['ผู้พักพิง (คน)'] || row['occupied'] || 0) || 0;
          const status = row['สถานะ'] || row['status'] || 'OPEN';
          const phone = row['เบอร์โทรศัพท์'] || row['phone'] || '';

          if (name && district && capacity > 0) {
            importedShelters.push({
              id: startId + importedShelters.length,
              name,
              district,
              capacity,
              occupied: Math.min(occupied, capacity),
              status,
              phone
            });
          }
        }

        if (importedShelters.length === 0) {
          setError('ไฟล์ไม่มีข้อมูลที่ถูกต้อง');
          return;
        }

        setShelters([...shelters, ...importedShelters]);
        setShowImportModal(false);
        alert(`✅ นำเข้าข้อมูล ${importedShelters.length} แห่งสำเร็จ`);
      } catch (error) {
        console.error('Import failed:', error);
        setError('❌ นำเข้าข้อมูลล้มเหลว: ' + (error instanceof Error ? error.message : 'ไฟล์ไม่ถูกต้อง'));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        
        {/* Header with Back Button & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sticky top-0 bg-[#0B1120]/80 backdrop-blur-md py-4 z-20 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all duration-300 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">รายชื่อศูนย์พักพิง</h1>
              <p className="text-sm text-slate-400">ทั้งประเทศ ({shelters.length} แห่ง)</p>
            </div>
          </div>

          {/* ✅ Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-lg transition-all flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" />
              เพิ่มศูนย์
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg transition-all flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              ส่งออก
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-lg transition-all flex-1 sm:flex-none"
            >
              <Upload className="w-4 h-4" />
              นำเข้า
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="space-y-3">
          {shelters.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>ไม่พบข้อมูลศูนย์พักพิง</p>
            </div>
          ) : (
            shelters.map((shelter, index) => {
              const uniqueKey = `shelter-${shelter.id}-${index}`;
              const safeCapacity = shelter.capacity || 1; 
              const percent = Math.round((shelter.occupied / safeCapacity) * 100);
              
              return (
                <div 
                  key={uniqueKey}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all duration-200"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 min-w-[3rem] text-center px-2 py-1 rounded-lg border text-xs font-bold ${getStatusColor(shelter.status)}`}>
                      {getStatusLabel(shelter.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {shelter.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {shelter.district}</span>
                        <span className="hidden sm:flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> ความจุ {shelter.capacity || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats & Actions */}
                  <div className="flex items-center gap-4 sm:gap-6 pl-14 sm:pl-0">
                    {/* Occupancy Bar (Mini) */}
                    <div className="flex-1 sm:w-32">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">ผู้พักพิง</span>
                        <span className={percent > 90 ? 'text-red-400' : 'text-emerald-400'}>{shelter.occupied} คน</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <a 
                        href={`tel:${shelter.phone}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 transition-colors border border-slate-700 hover:border-blue-500 flex items-center justify-center"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <button className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-400 transition-colors border border-slate-700 hover:border-emerald-500">
                        <Navigation className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ✅ Modal: Add Shelter */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white text-lg">เพิ่มศูนย์พักพิงใหม่</h3>
              <button onClick={() => { setShowAddModal(false); setError(''); }} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">ชื่อศูนย์พักพิง</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น ศูนย์พักพิงกลาง"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">อำเภอ</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="เช่น เมืองศรีสะเกษ"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">ความจุ (คน)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">ผู้พักพิง (คน)</label>
                  <input
                    type="number"
                    value={formData.occupied}
                    onChange={(e) => setFormData({ ...formData, occupied: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">สถานะ</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="OPEN">เปิดรับ</option>
                  <option value="FULL">เต็ม</option>
                  <option value="CLOSED">ปิด</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0x-xxxx-xxxx"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex gap-3">
              <button
                onClick={() => { setShowAddModal(false); setError(''); }}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddShelter}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
              >
                เพิ่ม
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal: Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white text-lg">นำเข้าข้อมูลจากไฟล์ Excel</h3>
              <button onClick={() => { setShowImportModal(false); setError(''); }} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center">
                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-300 mb-4">เลือกไฟล์ Excel (.xlsx, .xls)</p>
                <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer transition-colors">
                  เลือกไฟล์
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImportExcel}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-2 font-bold">📋 รูปแบบคอลัมน์:</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>• ชื่อศูนย์</p>
                  <p>• อำเภอ</p>
                  <p>• ความจุ (คน)</p>
                  <p>• ผู้พักพิง (คน)</p>
                  <p>• สถานะ (OPEN/FULL/CLOSED)</p>
                  <p>• เบอร์โทรศัพท์</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex gap-3">
              <button
                onClick={() => { setShowImportModal(false); setError(''); }}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}