'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  Building2,
  Search,
  X
} from 'lucide-react';

export default function ShelterPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data
  const shelters = [
    {
      id: 1,
      name: 'โรงเรียนสตรีสิริเกศ',
      district: 'เมืองศรีสะเกษ',
      capacity: 500,
      occupied: 420,
      status: 'OPEN',
      phone: '045-612-345',
    },
    {
      id: 2,
      name: 'อาคารเฉลิมพระเกียรติฯ',
      district: 'กันทรลักษ์',
      capacity: 1000,
      occupied: 150,
      status: 'OPEN',
      phone: '045-899-123',
    },
    {
      id: 3,
      name: 'วัดมหาพุทธาราม',
      district: 'เมืองศรีสะเกษ',
      capacity: 200,
      occupied: 198,
      status: 'FULL',
      phone: '081-234-5678',
    },
    {
      id: 4,
      name: 'อบต. หญ้าปล้อง',
      district: 'เมืองศรีสะเกษ',
      capacity: 300,
      occupied: 0,
      status: 'STANDBY',
      phone: '045-111-222',
    },
    {
      id: 5,
      name: 'โรงเรียนขุขันธ์',
      district: 'ขุขันธ์',
      capacity: 400,
      occupied: 350,
      status: 'OPEN',
      phone: '045-999-888',
    },
  ];

  // Logic การค้นหา
  const filteredShelters = useMemo(() => {
    return shelters.filter((shelter) => 
      shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.district.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, shelters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'FULL': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'เปิดรับ';
      case 'FULL': return 'เต็ม';
      default: return 'สำรอง';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        
        {/* Header & Search Section (Sticky) */}
        <div className="sticky top-0 bg-[#0B1120]/90 backdrop-blur-xl py-4 z-20 border-b border-slate-800/50 -mx-4 px-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center max-w-6xl mx-auto">
            
            {/* Title Block */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all duration-300 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">รายชื่อศูนย์พักพิง</h1>
                <p className="text-sm text-slate-400">จังหวัดศรีสะเกษ</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-96 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อศูนย์ หรือ อำเภอ..."
                className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List View of Shelters */}
        <div className="space-y-4">
          {filteredShelters.length > 0 ? (
            filteredShelters.map((shelter) => {
               const percent = Math.round((shelter.occupied / shelter.capacity) * 100);
               
               return (
                <div 
                  key={shelter.id}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all duration-200 shadow-lg"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-5 flex-1">
                    <div className={`mt-1 min-w-[3.5rem] text-center px-2 py-1.5 rounded-lg border text-xs font-bold ${getStatusColor(shelter.status)}`}>
                      {getStatusLabel(shelter.status)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {shelter.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-2">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500/70" /> {shelter.district}</span>
                        <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-purple-500/70" /> ความจุ {shelter.capacity.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats & Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto pl-14 md:pl-0">
                    {/* Occupancy Bar */}
                    <div className="w-full sm:w-48">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">ผู้พักพิง</span>
                        <span className={percent > 90 ? 'text-red-400' : 'text-emerald-400'}>{shelter.occupied.toLocaleString()} คน</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none p-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 transition-colors border border-slate-700 hover:border-blue-500 flex justify-center items-center">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="flex-1 sm:flex-none p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-400 transition-colors border border-slate-700 hover:border-emerald-500 flex justify-center items-center">
                        <Navigation className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
               );
            })
          ) : (
             // Empty State
             <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
               <Search className="w-16 h-16 mb-4 text-slate-700" />
               <h3 className="text-xl font-semibold text-slate-300">ไม่พบข้อมูล</h3>
               <p>ลองเปลี่ยนคำค้นหาใหม่</p>
               <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-400 hover:text-blue-300 hover:underline"
                >
                  ล้างคำค้นหา
                </button>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}