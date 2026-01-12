'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotificationPanel from './components/NotificationPanel'; 
import {
  Activity,
  Users,
  Clock,
  TrendingUp,
  ChevronRight,
  ClipboardList,
  PackageMinus,
  MapPin, 
  Package,
  FileText,
  Trash2,
  Eye,
  X,
  Phone,
  User
} from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  
  // Data State
  const [pendingCount, setPendingCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [shelterCount, setShelterCount] = useState(0);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const loadUserRole = () => {
    try {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        setUserRole(String(storedRole).toUpperCase().trim());
        return;
      }
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUserRole(String(userObj.role || userObj.userRole).toUpperCase());
      }
    } catch (e) { console.log(e); }
  };

  const loadShelterCount = async () => {
    try {
      const response = await fetch('/api/centers');
      if (response.ok) {
        const data = await response.json();
        setShelterCount((data || []).length);
      }
    } catch (error) { console.error(error); } finally { setLoadingShelters(false); }
  };

  const loadData = () => {
    try {
        const storedRequests = localStorage.getItem('ems_requests');
        if (storedRequests) {
            const requests = JSON.parse(storedRequests);
            setPendingCount(requests.filter((r: any) => r.status === 'PENDING').length);
            setRecentRequests(requests.slice(0, 10)); 
        }
        const storedInv = localStorage.getItem('ems_inventory');
        if (storedInv) {
            const items = JSON.parse(storedInv);
            setTotalStock(items.reduce((sum: number, item: any) => sum + item.stock, 0));
        }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadShelterCount();
    loadUserRole();
    loadData();
    const dataTimer = setInterval(loadData, 1000);
    window.addEventListener('storage', loadData);
    return () => { clearInterval(timer); clearInterval(dataTimer); window.removeEventListener('storage', loadData); };
  }, []);

  const getItemIcon = (itemName: string) => {
    if (itemName.includes('น้ำ')) return '💧';
    if (itemName.includes('ข้าว')) return '🌾';
    if (itemName.includes('ยา')) return '💊';
    return '📦';
  };

  const handleCancelRequest = (id: any) => {
    if(!confirm('ยืนยันการยกเลิกคำร้องขอนี้?')) return;
    const allRequests = JSON.parse(localStorage.getItem('ems_requests') || '[]');
    const newAllRequests = allRequests.filter((r: any) => r.id !== id);
    localStorage.setItem('ems_requests', JSON.stringify(newAllRequests));
    loadData();
    setSelectedRequest(null);
  };

  // ✅ New Color Palette Logic for White-Blue Theme
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'รอการอนุมัติ';
      case 'APPROVED': return 'อนุมัติแล้ว';
      case 'REJECTED': return 'ถูกปฏิเสธ';
      default: return status;
    }
  };

  const stats = [
    { 
      title: 'ศูนย์พักพิงทั้งหมด', 
      value: loadingShelters ? '-' : shelterCount.toString(), 
      total: 'แห่ง', 
      icon: MapPin, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-100 hover:border-blue-300', 
      trend: 'กดเพื่อดูรายชื่อ', 
      href: '/cards/shelter' 
    },
    { 
      title: 'คำร้องขอ (รออนุมัติ)', 
      value: pendingCount.toString(), 
      total: 'รายการ', 
      icon: ClipboardList, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50', 
      border: 'border-indigo-100 hover:border-indigo-300', 
      trend: 'รอการจัดการ', 
      href: '/cards/request' 
    },
    { 
      title: 'เบิกจ่ายสิ่งของ', 
      value: 'สร้างใบเบิก', 
      total: 'ใหม่', 
      icon: PackageMinus, 
      color: 'text-sky-600', 
      bg: 'bg-sky-50', 
      border: 'border-sky-100 hover:border-sky-300', 
      trend: 'คลังหลักพร้อมจ่าย', 
      href: '/cards/requisition' 
    },
    { 
      title: 'คลังสินค้าทั้งหมด', 
      value: totalStock.toLocaleString(), 
      total: 'ชิ้น', 
      icon: Package, 
      color: 'text-blue-700', 
      bg: 'bg-blue-100', 
      border: 'border-blue-200 hover:border-blue-400', 
      trend: 'ตรวจสอบสต๊อก', 
      href: '/cards/inventory' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* Background Accent */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-100/50 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-5%] left-[-5%] w-[20%] h-[20%] bg-indigo-100/40 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        
        {/* --- Header (Clean White & Blue) --- */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-none">SISAKET<br/><span className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">Ready System</span></h1>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <p className="text-lg font-semibold text-slate-700 tabular-nums">
                        {currentTime ? currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                </div>
                <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {userRole || 'GUEST'}
                        </p>
                    </div>
                    <Link href="/login" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all">
                        <User className="w-4 h-4 text-slate-600" />
                    </Link>
                </div>
            </div>
        </header>

        {/* --- Main Content --- */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ศูนย์สั่งการดิจิทัล</h2>
                <p className="text-slate-500 text-sm">Dashboard สรุปทรัพยากรและการช่วยเหลือ</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <Link href={stat.href} key={i} className={`group relative bg-white p-6 rounded-2xl border ${stat.border} shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                        <span className="text-xs text-slate-400 font-medium">{stat.total}</span>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
                        {stat.trend} <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                 <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-2 h-6 bg-blue-600 rounded-full" />
                      สถานะการเบิกจ่ายล่าสุด
                    </h3>
                    <Link href="/cards/request" className="text-xs font-bold text-blue-600 hover:underline">
                       ดูประวัติทั้งหมด
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                        <tr>
                           <th className="px-6 py-4">สถานะ</th>
                           <th className="px-6 py-4">สถานที่ / ผู้เบิก</th>
                           <th className="px-6 py-4">รายการ</th>
                           <th className="px-6 py-4 text-right">แอคชั่น</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {recentRequests.map((item) => (
                            <tr key={item.id} onClick={() => setSelectedRequest(item)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                                      {getStatusLabel(item.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">{item.requester}</div>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {item.location}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-700 font-medium flex items-center gap-2">
                                        <span className="bg-slate-100 w-7 h-7 flex items-center justify-center rounded-md text-sm">{getItemIcon(item.item)}</span>
                                        {item.item}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1">จำนวน: {item.quantity} {item.unit}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-1.5 hover:bg-blue-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleCancelRequest(item.id); }} className="p-1.5 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                 </div>
                 
                 {/* Notification Side */}
                 <div className="space-y-6">
                    {userRole === 'ADMIN' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <NotificationPanel />
                        </div>
                    )}
                 </div>
              </div>
            </div>
        </main>
      </div>

      {/* --- DETAIL MODAL (Styled) --- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className={`h-24 bg-gradient-to-r p-6 flex items-end justify-between ${selectedRequest.status === 'PENDING' ? 'from-amber-400 to-orange-500' : 'from-blue-600 to-indigo-700'}`}>
                    <div className="text-4xl">{getItemIcon(selectedRequest.item)}</div>
                    <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-8">
                    <div className="mb-6">
                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border mb-3 ${getStatusBadge(selectedRequest.status)}`}>
                            {getStatusLabel(selectedRequest.status)}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{selectedRequest.item}</h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Order ID: #{String(selectedRequest.id).slice(-6)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">จำนวนเบิก</p>
                            <p className="text-lg font-bold text-blue-600">{selectedRequest.quantity} <span className="text-sm font-medium text-slate-500">{selectedRequest.unit}</span></p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">เวลาที่แจ้ง</p>
                            <p className="text-sm font-bold text-slate-700">{selectedRequest.time || '--:--'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">สถานที่รับของ</p>
                                <p className="text-sm text-slate-700 font-semibold">{selectedRequest.location}</p>
                                <p className="text-xs text-slate-500">{selectedRequest.requester}</p>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setSelectedRequest(null)} className="w-full mt-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
                        ตกลง / ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}