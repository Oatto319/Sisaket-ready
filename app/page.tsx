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

  // ✅ ฟังก์ชันดึง role จาก localStorage
  const loadUserRole = () => {
    try {
      // 🟢 วิธีที่ 1: ดึงจาก localStorage.userRole
      const storedRole = localStorage.getItem('userRole');
      
      if (storedRole) {
        const normalizedRole = String(storedRole).toUpperCase().trim();
        setUserRole(normalizedRole);
        console.log(`✅ Role loaded: ${normalizedRole}`);
        return;
      }

      // 🟢 วิธีที่ 2: ดึงจาก localStorage.user object
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          const roleFields = ['role', 'userRole', 'type'];
          
          for (const field of roleFields) {
            if (userObj[field]) {
              const normalizedRole = String(userObj[field]).toUpperCase().trim();
              setUserRole(normalizedRole);
              console.log(`✅ Role loaded from user object: ${normalizedRole}`);
              return;
            }
          }
        } catch (e) {
          console.log('⚠️ Could not parse user object');
        }
      }

      console.log('⚠️ No role found in localStorage');
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  // ✅ ฟังก์ชันดึงจำนวนศูนย์พักพิง
  const loadShelterCount = async () => {
    try {
      const response = await fetch('/api/centers');
      if (response.ok) {
        const data = await response.json();
        const count = (data || []).length;
        setShelterCount(count);
        console.log(`✅ Loaded ${count} shelters`);
      }
    } catch (error) {
      console.error('Failed to fetch shelter count:', error);
    } finally {
      setLoadingShelters(false);
    }
  };

  const loadData = () => {
    try {
        const storedRequests = localStorage.getItem('ems_requests');
        if (storedRequests) {
            const requests = JSON.parse(storedRequests);
            const pending = requests.filter((r: any) => r.status === 'PENDING').length;
            setPendingCount(pending);
            setRecentRequests(requests.slice(0, 10)); 
        } else {
            setPendingCount(0);
            setRecentRequests([]);
        }

        const storedInv = localStorage.getItem('ems_inventory');
        if (storedInv) {
            const items = JSON.parse(storedInv);
            const total = items.reduce((sum: number, item: any) => sum + item.stock, 0);
            setTotalStock(total);
        } else {
            setTotalStock(0);
        }
    } catch (error) {
        console.error("Data load error:", error);
    }
  };

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    loadShelterCount();
    loadUserRole();
    
    loadData();
    const dataTimer = setInterval(loadData, 1000);
    window.addEventListener('storage', loadData);
    
    return () => {
        clearInterval(timer);
        clearInterval(dataTimer);
        window.removeEventListener('storage', loadData);
    };
  }, []);

  const getItemIcon = (itemName: string) => {
    if (itemName.includes('น้ำ')) return '💧';
    if (itemName.includes('ข้าว')) return '🌾';
    if (itemName.includes('บะหมี่')) return '🍜';
    if (itemName.includes('ปลา')) return '🐟';
    if (itemName.includes('ยา')) return '💊';
    if (itemName.includes('ผ้าห่ม')) return '🧣';
    if (itemName.includes('เต็นท์')) return '⛺';
    if (itemName.includes('ไฟฉาย')) return '🔦';
    return '📦';
  };

  const handleCancelRequest = (id: any) => {
    if(!confirm('ยืนยันการยกเลิกคำร้องขอนี้?')) return;
    const target = recentRequests.find(r => r.id === id);
    if (!target) return;
    if (target.status === 'PENDING') {
        const storedInv = localStorage.getItem('ems_inventory');
        if (storedInv) {
            const inventory = JSON.parse(storedInv);
            const itemIndex = inventory.findIndex((i: any) => i.id === target.itemId || i.name === target.item);
            if (itemIndex !== -1) {
                inventory[itemIndex].stock += target.quantity;
                localStorage.setItem('ems_inventory', JSON.stringify(inventory));
            }
        }
    }
    const allRequests = JSON.parse(localStorage.getItem('ems_requests') || '[]');
    const newAllRequests = allRequests.filter((r: any) => r.id !== id);
    localStorage.setItem('ems_requests', JSON.stringify(newAllRequests));
    loadData();
    window.dispatchEvent(new Event('storage'));
    setSelectedRequest(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'APPROVED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-700 text-slate-300';
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
      unit: '', 
      icon: MapPin, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/20 group-hover:border-blue-400 group-hover:bg-blue-500/10', 
      trend: 'กดเพื่อดูรายชื่อ', 
      trendUp: true, 
      href: '/cards/shelter' 
    },
    { 
      title: 'คำร้องขอ (รออนุมัติ)', 
      value: pendingCount.toString(), 
      total: 'รายการ', 
      unit: '', 
      icon: ClipboardList, 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/10', 
      border: 'border-orange-500/20 group-hover:border-orange-400 group-hover:bg-orange-500/10', 
      trend: 'รอการจัดการ', 
      trendUp: pendingCount > 0, 
      href: '/cards/request' 
    },
    { 
      title: 'เบิกจ่ายสิ่งของ', 
      value: 'สร้างใบเบิก', 
      total: 'ใหม่', 
      unit: '', 
      icon: PackageMinus, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20 group-hover:border-emerald-400 group-hover:bg-emerald-500/10', 
      trend: 'คลังหลักพร้อมจ่าย', 
      trendUp: true, 
      href: '/cards/requisition' 
    },
    { 
      title: 'คลังสินค้าทั้งหมด', 
      value: totalStock.toLocaleString(), 
      total: 'ชิ้น', 
      unit: '', 
      icon: Package, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10', 
      border: 'border-purple-500/20 group-hover:border-purple-400 group-hover:bg-purple-500/10', 
      trend: 'ตรวจสอบสต๊อก', 
      trendUp: true, 
      href: '/cards/inventory' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        
        {/* --- Header --- */}
        <header className="h-20 flex items-center justify-between px-8 bg-slate-900/40 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <div className="min-w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight text-white leading-none">SISAKET<br/><span className="text-blue-400 text-sm font-medium">READY SYSTEM</span></h1>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <p className="text-xl font-mono font-bold text-white tabular-nums leading-none mt-1">
                        {currentTime ? currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                </div>
                <div className="h-8 w-[1px] bg-slate-700 hidden sm:block"></div>
                <div className="flex items-center gap-3 pl-2">
                    {/* ✅ แสดง role ที่ได้รับ */}
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-400">
                          {userRole ? `👤 ${userRole}` : '⏳ Loading...'}
                        </p>
                    </div>
                    <Link href="/login" title="ไปยังหน้าเข้าสู่ระบบ" aria-label="ไปยังหน้าเข้าสู่ระบบ" className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center hover:ring-2 hover:ring-blue-500/30 transition-all cursor-pointer">
                        <Users className="w-5 h-5 text-slate-300" />
                    </Link>
                </div>
            </div>
        </header>

        {/* --- Main Content --- */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">ศูนย์สั่งการ</h2>
                  <p className="text-slate-400 mt-1">ภาพรวมสถานการณ์จังหวัดศรีสะเกษ</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat, i) => {
                  const CardContent = () => (
                    <>
                      <div className="absolute top-0 right-0 p-4 opacity-50">
                        <stat.icon className={`w-16 h-16 ${stat.color} opacity-10 -rotate-12 transform group-hover:scale-110 transition-transform`} />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-slate-400 font-medium text-sm">{stat.title}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white font-mono">{stat.value}</h3>
                        <span className="text-slate-500 text-sm">{stat.unit ? `/ ${stat.total} ${stat.unit}` : stat.total}</span>
                      </div>
                      <div className={`mt-4 flex items-center gap-2 text-xs font-medium ${stat.href ? 'text-blue-400' : (stat.trendUp ? 'text-emerald-400' : 'text-rose-400')}`}>
                        {stat.href ? (
                          <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                             <span className="underline decoration-blue-500/30 underline-offset-2">{stat.trend}</span> 
                             <ChevronRight className="w-3 h-3" />
                          </div>
                        ) : (
                          <>
                            <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
                            {stat.trend}
                          </>
                        )}
                      </div>
                    </>
                  );
                  const cardClasses = `relative group overflow-hidden rounded-2xl border ${stat.border} bg-slate-900/40 backdrop-blur-sm p-6 transition-all duration-300 ${stat.href ? 'cursor-pointer hover:bg-slate-800/60' : ''}`;
                  if (stat.href) {
                    return (
                      <Link href={stat.href} key={i} className={cardClasses}>
                        <CardContent />
                      </Link>
                    );
                  }
                  return (
                    <div key={i} className={cardClasses}>
                      <CardContent />
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                 <div className="xl:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md overflow-hidden flex flex-col min-h-[400px]">
                  <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/40">
                    <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      สถานะการเบิกจ่ายล่าสุด
                    </h3>
                    <Link href="/cards/request" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                       ดูทั้งหมด <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-slate-900/80 text-xs uppercase font-medium text-slate-300">
                        <tr>
                           <th className="px-6 py-4">สถานะ</th>
                           <th className="px-6 py-4">สถานที่ / ผู้เบิก</th>
                           <th className="px-6 py-4">รายการ</th>
                           <th className="px-6 py-4 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {recentRequests.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-slate-500">ไม่มีรายการเบิกจ่ายล่าสุด</td>
                            </tr>
                        ) : (
                            recentRequests.map((item) => (
                            <tr 
                                key={item.id} 
                                onClick={() => setSelectedRequest(item)}
                                className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                                    {getStatusLabel(item.status)}
                                </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium group-hover:text-blue-400 transition-colors">{item.requester}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white flex items-center gap-2">
                                        <span className="text-lg">{getItemIcon(item.item)}</span>
                                        {item.item}
                                    </div>
                                    <div className="text-xs text-slate-500">จำนวน: {item.quantity} {item.unit}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleCancelRequest(item.id); }}
                                            className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                            title="ยกเลิกรายการ"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                 </div>
                 
                 {/* ✅ ตรวจสอบ role - ถ้าเป็น ADMIN เท่านั้นจึงแสดง NotificationPanel */}
                 {userRole && userRole === 'ADMIN' && <NotificationPanel />}
              </div>
            </div>
        </main>
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className={`h-32 bg-gradient-to-br flex items-center justify-center relative ${selectedRequest.status === 'PENDING' ? 'from-yellow-600/20 to-orange-600/20' : selectedRequest.status === 'APPROVED' ? 'from-emerald-600/20 to-teal-600/20' : 'from-red-600/20 to-rose-600/20'}`}>
                    <div className="text-6xl drop-shadow-lg filter">{getItemIcon(selectedRequest.item)}</div>
                    <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getStatusBadge(selectedRequest.status)}`}>
                            {getStatusLabel(selectedRequest.status)}
                        </span>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-1">{selectedRequest.item}</h3>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            <span>รหัสคำร้อง: #{String(selectedRequest.id).slice(-6)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedRequest.time}</span>
                        </p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">จำนวนที่ขอเบิก</p>
                                <p className="text-white font-medium">{selectedRequest.quantity} {selectedRequest.unit}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-300 mb-4">สถานะการดำเนินการ</h4>
                        <div className="relative pl-4 border-l-2 border-slate-700 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
                                <p className="text-sm text-white font-medium">ส่งคำร้องขอแล้ว</p>
                            </div>
                            <div className="relative">
                                <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full ring-4 ring-slate-900 ${selectedRequest.status !== 'PENDING' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                <p className="text-sm text-white font-medium">เจ้าหน้าที่ตรวจสอบ</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">ข้อมูลผู้เบิก</h4>
                        <div className="bg-slate-800/30 rounded-xl p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-sm text-white">{selectedRequest.requester}</p>
                                    <p className="text-xs text-slate-500">{selectedRequest.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-800/50 flex gap-3">
                    <button onClick={() => setSelectedRequest(null)} className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-bold">ปิดหน้าต่าง</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}