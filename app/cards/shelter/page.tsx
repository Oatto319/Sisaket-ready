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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ... (Interface Shelter เหมือนเดิม)
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
  
  // ✅ State สำหรับ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

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

        const sheltersWithIds = (data || []).map((shelter: any, index: number) => ({
          ...shelter,
          id: shelter.id || index + 1
        }));

        setShelters(sheltersWithIds);
      } catch (error) {
        console.error("Failed to fetch shelters:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShelters();
  }, []);

  // ✅ Logic สำหรับคำนวณการแบ่งหน้า
  const totalPages = Math.ceil(shelters.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = shelters.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนขึ้นบนสุดเมื่อเปลี่ยนหน้า
  };

  // ... (ฟังก์ชัน handleAddShelter, handleExportExcel, handleImportExcel เหมือนเดิม)
  const handleAddShelter = () => { /* ... logic เดิม ... */ };
  const handleExportExcel = async () => { /* ... logic เดิม ... */ };
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... logic เดิม ... */ };

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
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sticky top-0 bg-[#0B1120]/80 backdrop-blur-md py-4 z-20 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">รายชื่อศูนย์พักพิง</h1>
              <p className="text-sm text-slate-400">ทั้งหมด {shelters.length} แห่ง (หน้า {currentPage}/{totalPages || 1})</p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex-1 sm:flex-none text-sm">
              <Plus className="w-4 h-4" /> เพิ่มศูนย์
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex-1 sm:flex-none text-sm">
              <Download className="w-4 h-4" /> ส่งออก
            </button>
          </div>
        </div>

        {/* List View - แสดงเฉพาะ currentItems */}
        <div className="space-y-3 mb-8">
          {currentItems.length === 0 ? (
            <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
              <p>ไม่พบข้อมูลในหน้านี้</p>
            </div>
          ) : (
            currentItems.map((shelter, index) => {
              const safeCapacity = shelter.capacity || 1; 
              const percent = Math.round((shelter.occupied / safeCapacity) * 100);
              return (
                <div key={`${shelter.id}-${index}`} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all duration-200">
                  {/* ... (ภายใน Card เหมือนเดิม) ... */}
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 min-w-[3.5rem] text-center px-2 py-1 rounded-lg border text-[10px] font-bold ${getStatusColor(shelter.status)}`}>
                      {getStatusLabel(shelter.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{shelter.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {shelter.district}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 pl-14 sm:pl-0">
                    <div className="flex-1 sm:w-32">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">ผู้พักพิง {shelter.occupied}/{shelter.capacity}</span>
                        <span className={percent > 90 ? 'text-red-400' : 'text-emerald-400'}>{percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                      </div>
                    </div>
                    <a href={`tel:${shelter.phone}`} className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-700 transition-colors"><Phone className="w-4 h-4" /></a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ✅ Pagination Controls UI */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 mt-10 pb-10">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => goToPage(1)} 
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 px-4">
                <span className="text-sm font-medium text-slate-400">หน้า</span>
                <span className="text-sm font-bold text-blue-400 mx-1">{currentPage}</span>
                <span className="text-sm font-medium text-slate-400">จาก {totalPages}</span>
              </div>

              <button 
                onClick={() => goToPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => goToPage(totalPages)} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Page Jump (Optional) */}
            <div className="flex flex-wrap justify-center gap-2">
               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // แสดงปุ่มเลขหน้าแบบยืดหยุ่น (หน้าปัจจุบัน +- 2)
                  let pageNum = currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i);
                  if (pageNum <= 0 || pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-600'}`}
                    >
                      {pageNum}
                    </button>
                  )
               })}
            </div>
          </div>
        )}
      </div>

      {/* ... (Modals สำหรับ Add และ Import เหมือนเดิม) ... */}
    </div>
  );
}