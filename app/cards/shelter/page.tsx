'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // 1. Import hook เพิ่ม
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  Building2
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
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        
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
          </div>
        </div>

        {/* List View */}
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
                  </div>
                </div>
              </div>
             );
          })}
        </div>

      </div>
    </div>
  );
}