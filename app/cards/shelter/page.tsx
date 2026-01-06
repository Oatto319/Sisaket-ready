'use client';

import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
=======
import { useState, useEffect } from 'react'; // 1. Import hook เพิ่ม
>>>>>>> api
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
<<<<<<< HEAD
  Building2,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter
=======
  Building2
>>>>>>> api
} from 'lucide-react';

// (Optional) กำหนด Type ของข้อมูลเพื่อให้เรียกใช้ง่ายขึ้น
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
  
  // State สำหรับการค้นหาและฟิลเตอร์
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

<<<<<<< HEAD
  // Mock Data (สามารถขยายข้อมูลเพื่อทดสอบ Pagination ได้)
  const shelters = [
    { id: 1, name: 'โรงเรียนสตรีสิริเกศ', district: 'เมืองศรีสะเกษ', capacity: 500, occupied: 420, status: 'OPEN', phone: '045-612-345' },
    { id: 2, name: 'อาคารเฉลิมพระเกียรติฯ', district: 'กันทรลักษ์', capacity: 1000, occupied: 150, status: 'OPEN', phone: '045-899-123' },
    { id: 3, name: 'วัดมหาพุทธาราม', district: 'เมืองศรีสะเกษ', capacity: 200, occupied: 198, status: 'FULL', phone: '081-234-5678' },
    { id: 4, name: 'อบต. หญ้าปล้อง', district: 'เมืองศรีสะเกษ', capacity: 300, occupied: 0, status: 'STANDBY', phone: '045-111-222' },
    { id: 5, name: 'โรงเรียนขุขันธ์', district: 'ขุขันธ์', capacity: 400, occupied: 350, status: 'OPEN', phone: '045-999-888' },
  ];
=======
  // 2. เปลี่ยนจาก Mock Data เป็น State
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. ใช้ useEffect ดึงข้อมูลจาก API ที่เราสร้างไว้
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await fetch('/api/centers'); // ยิงไปที่ API Route
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setShelters(data);
      } catch (error) {
        console.error("Failed to fetch shelters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);
>>>>>>> api

  // Logic: กรองข้อมูล (Search + Status Filter)
  const filteredShelters = useMemo(() => {
    return shelters.filter((shelter) => {
      const matchSearch = shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shelter.district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || shelter.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter, shelters]);

  // Logic: แบ่งหน้า (Pagination)
  const totalPages = Math.ceil(filteredShelters.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredShelters.slice(start, start + itemsPerPage);
  }, [filteredShelters, currentPage]);

  // ฟังก์ชันดาวน์โหลด Excel
  const exportToExcel = () => {
    const dataToExport = filteredShelters.map(s => ({
      'ชื่อศูนย์': s.name,
      'อำเภอ': s.district,
      'ความจุ': s.capacity,
      'จำนวนที่พักอยู่': s.occupied,
      'สถานะ': getStatusLabel(s.status),
      'เบอร์โทรศัพท์': s.phone
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shelters");
    XLSX.writeFile(workbook, `Shelters_Sisaket_${new Date().toLocaleDateString()}.xlsx`);
  };

  const getStatusColor = (status: string) => {
    // API อาจส่งมาเป็น OPEN/FULL หรือตัวพิมพ์เล็ก ก็ปรับ case ตามต้องการ
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

  // 4. แสดงหน้า Loading ระหว่างรอข้อมูล
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        
<<<<<<< HEAD
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 transition-all shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">รายชื่อศูนย์พักพิง</h1>
                <p className="text-sm text-slate-400">จังหวัดศรีสะเกษ</p>
              </div>
            </div>

            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95 text-sm"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด Excel
            </button>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="ค้นหาชื่อศูนย์ หรือ อำเภอ..."
              className="w-full pl-10 pr-10 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
          </div>

          {/* Status Select */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none transition-all"
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value="OPEN">เปิดรับ</option>
              <option value="FULL">เต็ม</option>
              <option value="STANDBY">สำรอง</option>
            </select>
=======
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#0B1120]/80 backdrop-blur-md py-4 z-20 border-b border-slate-800/50">
          <button 
            onClick={() => router.back()}
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">รายชื่อศูนย์พักพิง</h1>
            <p className="text-sm text-slate-400">จังหวัดศรีสะเกษ ({shelters.length} แห่ง)</p>
>>>>>>> api
          </div>
        </div>

        {/* List View */}
<<<<<<< HEAD
        <div className="space-y-4 mb-8">
          {paginatedData.length > 0 ? (
            paginatedData.map((shelter) => {
               const percent = Math.round((shelter.occupied / shelter.capacity) * 100);
               return (
                <div key={shelter.id} className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 transition-all shadow-lg">
                  <div className="flex items-start gap-5 flex-1">
                    <div className={`mt-1 min-w-[3.5rem] text-center px-2 py-1.5 rounded-lg border text-xs font-bold ${getStatusColor(shelter.status)}`}>
                      {getStatusLabel(shelter.status)}
=======
        <div className="space-y-3">
          {shelters.map((shelter) => {
             // คำนวณเปอร์เซ็นต์ (ป้องกันการหารด้วย 0)
             const safeCapacity = shelter.capacity || 1; 
             const percent = Math.round((shelter.occupied / safeCapacity) * 100);
             
             return (
              <div 
                key={shelter.id}
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
>>>>>>> api
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{shelter.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-2">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500" /> {shelter.district}</span>
                        <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-purple-500" /> ความจุ {shelter.capacity.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

<<<<<<< HEAD
                  <div className="flex flex-col sm:flex-row items-center gap-8 w-full md:w-auto pl-14 md:pl-0">
                    <div className="w-full sm:w-48">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">ผู้พักพิง</span>
                        <span className={percent > 90 ? 'text-red-400' : 'text-emerald-400'}>{shelter.occupied.toLocaleString()} คน</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                        <div className={`h-full rounded-full transition-all duration-500 ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-all border border-slate-700"><Phone className="w-5 h-5" /></button>
                      <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white transition-all border border-slate-700"><Navigation className="w-5 h-5" /></button>
                    </div>
=======
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* ปุ่มโทร: ใส่ href tel: เพื่อให้กดโทรได้จริง */}
                    <a 
                      href={`tel:${shelter.phone}`}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 transition-colors border border-slate-700 hover:border-blue-500 flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-400 transition-colors border border-slate-700 hover:border-emerald-500">
                      <Navigation className="w-4 h-4" />
                    </button>
>>>>>>> api
                  </div>
                </div>
               );
            })
          ) : (
             <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
               <Search className="w-16 h-16 mb-4 text-slate-700" />
               <h3 className="text-xl font-semibold text-slate-300">ไม่พบข้อมูล</h3>
               <button onClick={() => {setSearchQuery(''); setStatusFilter('ALL');}} className="mt-4 text-blue-400 hover:underline">ล้างการค้นหา</button>
             </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 text-sm">
            <p className="text-slate-500">
              หน้า <span className="text-white font-medium">{currentPage}</span> จาก <span className="text-white font-medium">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}