'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Home,
  Users
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

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

  const totalPages = Math.ceil(shelters.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = shelters.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'FULL': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="text-slate-500 font-bold text-sm">กำลังโหลดข้อมูลศูนย์พักพิง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-0 w-[40%] h-[30%] bg-blue-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-8 mb-4 sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => router.back()}
              className="group flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">รายชื่อศูนย์พักพิง</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Sisaket Ready</span>
                <span className="text-xs font-medium text-slate-400">พบ {shelters.length} แห่ง ทั่วจังหวัด</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm text-sm active:scale-95">
              <Download className="w-4 h-4 text-blue-600" /> ส่งออก
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm active:scale-95">
              <Plus className="w-4 h-4" /> เพิ่มศูนย์ใหม่
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="space-y-4">
          {currentItems.length === 0 ? (
            <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <Home size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">ไม่พบข้อมูลศูนย์พักพิงในรายการนี้</p>
            </div>
          ) : (
            currentItems.map((shelter, index) => {
              const safeCapacity = shelter.capacity || 1; 
              const percent = Math.round((shelter.occupied / safeCapacity) * 100);
              
              return (
                <div key={`${shelter.id}-${index}`} className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                      <Building2 className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-black mb-2 uppercase tracking-widest ${getStatusStyle(shelter.status)}`}>
                        {getStatusLabel(shelter.status)}
                      </div>
                      <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{shelter.name}</h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mt-2">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500" /> อ.{shelter.district}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> {shelter.capacity} ที่นั่ง</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pl-0 sm:pl-0 sm:min-w-[200px]">
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] font-bold mb-2">
                        <span className="text-slate-400 uppercase tracking-tighter">ความหนาแน่น</span>
                        <span className={percent > 90 ? 'text-rose-500' : 'text-blue-600'}>{percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${percent > 90 ? 'bg-rose-500' : percent > 70 ? 'bg-amber-500' : 'bg-blue-600'}`} 
                          style={{ width: `${Math.min(percent, 100)}%` }} 
                        />
                      </div>
                    </div>
                    <a href={`tel:${shelter.phone}`} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 active:scale-90">
                      <Phone className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-6 mt-16">
            <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button 
                onClick={() => goToPage(1)} 
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 disabled:opacity-20 hover:bg-slate-50 transition-colors"
              >
                <ChevronsLeft size={20} />
              </button>
              <button 
                onClick={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 disabled:opacity-20 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="h-6 w-[1px] bg-slate-100 mx-2"></div>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i);
                  if (pageNum <= 0 || pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <div className="h-6 w-[1px] bg-slate-100 mx-2"></div>

              <button 
                onClick={() => goToPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 disabled:opacity-20 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => goToPage(totalPages)} 
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 disabled:opacity-20 hover:bg-slate-50 transition-colors"
              >
                <ChevronsRight size={20} />
              </button>
            </div>
            
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">หน้า {currentPage} จากทั้งหมด {totalPages}</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        body { background-color: #F8FAFC; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

// Mock Icon เพื่อให้โค้ดรันได้สมบูรณ์
const Building2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
);