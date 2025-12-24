'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  Ambulance,
  Home,
  Users,
  AlertCircle,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  Menu,
  X,
  BarChart3,
  Settings,
  Search,
  ChevronRight
} from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- ส่วนที่แก้ไข: ปรับลำดับและข้อมูลใน stats ---
  const stats = [
    {
      // 1. ย้ายมาอยู่อันดับแรก
      title: 'ศูนย์พักพิงทั้งหมด',
      value: '15', // แสดงจำนวนตัวเลข
      total: 'แห่ง',
      unit: '',
      icon: MapPin,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20 group-hover:border-blue-400 group-hover:bg-blue-500/10', // เพิ่ม Hover effect
      trend: 'กดเพื่อดูรายชื่อ', // ข้อความด้านล่าง
      trendUp: true,
      href: '/cards/shelter' // ลิงก์ไปหน้า Shelter
    },
    {
      title: 'ศูนย์อพยพ (เปิด)',
      value: '12',
      total: '15',
      unit: 'แห่ง',
      icon: Home,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      trend: '+2 เปิดเพิ่ม',
      trendUp: true,
      href: null
    },
    {
      title: 'ผู้ประสบภัยรวม',
      value: '1,240',
      total: 'ราย',
      unit: 'คน',
      icon: Users,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      trend: '-15% จากเมื่อวาน',
      trendUp: false,
      href: null
    },
    {
      title: 'เวลาตอบสนอง',
      value: '6.5',
      total: 'นาที',
      unit: 'เฉลี่ย',
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      trend: 'เร็วขึ้น 1.2 นาที',
      trendUp: true,
      href: null
    },
  ];

  const emergencyCases = [
    { id: 1, time: '14:32', location: 'ถ.ศรีสะเกษ ซอย 5', type: 'อุบัติเหตุ', status: 'กำลังดำเนินการ', priority: 'high' },
    { id: 2, time: '14:15', location: 'ม.ราชภัฏศรีสะเกษ', type: 'ผู้ป่วยหัวใจ', status: 'กำลังดำเนินการ', priority: 'critical' },
    { id: 3, time: '13:58', location: 'ตลาดกลาง', type: 'หมดสติ', status: 'รับผู้ป่วยแล้ว', priority: 'medium' },
  ];

  const ambulanceStatus = [
    { id: 'A01', status: 'ว่าง', location: 'ฐานหลัก', driver: 'สมชาย ใจดี', battery: 95 },
    { id: 'A02', status: 'ปฏิบัติการ', location: 'ถ.ขุขันธ์', driver: 'วิชัย รักษ์ดี', battery: 82 },
  ];

  const menuItems = [
    { icon: Activity, label: 'ภาพรวมสถานการณ์', id: 'overview' },
    { icon: AlertCircle, label: 'แจ้งเหตุฉุกเฉิน', id: 'cases' },
    { icon: Ambulance, label: 'จัดการรถพยาบาล', id: 'ambulances' },
    { icon: Users, label: 'เจ้าหน้าที่เวร', id: 'staff' },
    { icon: BarChart3, label: 'รายงานสถิติ', id: 'reports' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ว่าง') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (status === 'ปฏิบัติการ') return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-72' : 'w-20'
          } transition-all duration-300 ease-in-out bg-slate-900/60 backdrop-blur-xl border-r border-slate-800 flex flex-col shadow-2xl`}
        >
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="min-w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className={`transition-opacity duration-300 ${!sidebarOpen && 'opacity-0 hidden'}`}>
                <h1 className="font-bold text-lg tracking-tight text-white leading-none">SISAKET<br/><span className="text-blue-400 text-sm font-medium">READY SYSTEM</span></h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`whitespace-nowrap font-medium transition-all duration-300 ${!sidebarOpen && 'opacity-0 w-0 hidden'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800/60 space-y-1">
             <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}>
               <Settings className="w-5 h-5" />
               <span className={`${!sidebarOpen && 'hidden'}`}>ตั้งค่าระบบ</span>
             </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent">
          
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-8 bg-slate-900/40 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50 focus-within:border-blue-500/50 focus-within:bg-slate-800 transition-all w-64 lg:w-96">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหา..." 
                  className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-500 w-full"
                />
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
                <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                   <Users className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
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
                  // สร้างเนื้อหาภายใน Card
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
                        {/* แสดงตัวเลขเสมอ */}
                        <h3 className="text-3xl font-bold text-white font-mono">{stat.value}</h3>
                        <span className="text-slate-500 text-sm">{stat.unit ? `/ ${stat.total} ${stat.unit}` : stat.total}</span>
                      </div>
                      
                      {/* ส่วนล่างของ Card: ถ้ามี href (เป็น Link) ให้แสดงปุ่มกด */}
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

                  // ตรวจสอบว่ามี href หรือไม่ เพื่อเลือกใช้ Link หรือ div
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

              {/* Table Section */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                 {/* Emergency Cases */}
                 <div className="xl:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      แจ้งเหตุฉุกเฉินล่าสุด
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-slate-900/80 text-xs uppercase font-medium text-slate-300">
                        <tr>
                           <th className="px-6 py-4">ความเร่งด่วน</th>
                           <th className="px-6 py-4">สถานที่</th>
                           <th className="px-6 py-4">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {emergencyCases.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                            </td>
                            <td className="px-6 py-4 text-white">{item.location}</td>
                            <td className="px-6 py-4 text-emerald-400">{item.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                 </div>

                 {/* Ambulance Status */}
                 <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md p-6">
                    <h3 className="text-white font-semibold mb-4">รถพยาบาลพร้อมใช้</h3>
                    {ambulanceStatus.map(amb => (
                      <div key={amb.id} className="flex justify-between items-center mb-3 p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-white">{amb.id}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(amb.status)}`}>{amb.status}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.5); border-radius: 10px; }
      `}</style>
    </div>
  );
}