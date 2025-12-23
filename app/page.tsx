'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Ambulance,
  Users,
  AlertCircle,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  Heart,
  Menu,
  X,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

export default function Page() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'ambulances'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: 'ศูนย์อพยพทั้งหมด',
      value: '12',
      total: '15',
      icon: Ambulance,
      color: 'bg-emerald-500',
      trend: '+2 จากเมื่อวาน',
    },
    {
      title: 'ศูนย์พักพิงทั้งหมด',
      value: '8',
      total: 'รายวันนี้',
      icon: AlertCircle,
      color: 'bg-red-500',
      trend: '-3 จากเมื่อวาน',
    },
    {
      title: 'เคำร้องด่วนทั้งหมด',
      value: '24',
      total: '32',
      icon: Users,
      color: 'bg-blue-500',
      trend: '75% พร้อมปฏิบัติการ',
    },
    {
      title: 'สิ่งของที่ถูกขอมากที่สุด',
      value: '6.5',
      total: 'นาที',
      icon: Clock,
      color: 'bg-amber-500',
      trend: 'ลดลง 1.2 นาที',
    },
  ];

  const emergencyCases = [
    { id: 1, time: '14:32', location: 'ถ.ศรีสะเกษ ซอย 5', type: 'อุบัติเหตุ', status: 'กำลังดำเนินการ', priority: 'สูง' },
    { id: 2, time: '14:15', location: 'ม.มหาสารคาม', type: 'หัวใจ', status: 'กำลังดำเนินการ', priority: 'วิกฤต' },
    { id: 3, time: '13:58', location: 'ตลาดกลาง', type: 'หมดสติ', status: 'รับผู้ป่วยแล้ว', priority: 'กลาง' },
    { id: 4, time: '13:42', location: 'โรงเรียนอนุบาล', type: 'บาดเจ็บ', status: 'ส่งโรงพยาบาลแล้ว', priority: 'ต่ำ' },
  ];

  const ambulanceStatus = [
    { id: 'A001', status: 'ว่าง', location: 'ฐานหลัก', driver: 'นายสมชาย ใจดี', battery: 95 },
    { id: 'A002', status: 'ปฏิบัติการ', location: 'ถ.ศรีสะเกษ', driver: 'นายวิชัย รักษ์ดี', battery: 82 },
    { id: 'A003', status: 'ว่าง', location: 'ฐานรอง 1', driver: 'นายประยุทธ สุขใจ', battery: 100 },
    { id: 'A004', status: 'ปฏิบัติการ', location: 'ม.มหาสารคาม', driver: 'นางสาวสมหญิง ดีมาก', battery: 76 },
  ];

  const menuItems = [
    { icon: Activity, label: 'ภาพรวม', id: 'overview' },
    { icon: AlertCircle, label: 'กรณีฉุกเฉิน', id: 'cases' },
    { icon: Ambulance, label: 'รถพยาบาล', id: 'ambulances' },
    { icon: Users, label: 'เจ้าหน้าที่', id: 'staff' },
    { icon: BarChart3, label: 'รายงานสถิติ', id: 'reports' },
    { icon: Settings, label: 'ตั้งค่า', id: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-700 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
            <div className="bg-red-500 p-3 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SISAKET READY</h1>
              <p className="text-slate-300 text-sm">จังหวัดศรีสะเกษ</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-white font-semibold">
                {currentTime.toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-slate-300 text-lg font-mono">
                {currentTime.toLocaleTimeString('th-TH')}
              </p>
            </div>
            <button className="flex items-center rounded-lg px-6 py-3 font-semibold text-white">
              <span>หน้าหลัก</span>
            </button>
            <button className="flex items-center rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600">
              <span>เข้าสู่ระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } transition-all duration-300 bg-slate-800 border-r border-slate-700 overflow-hidden flex flex-col`}
        >
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="px-4 py-4 border-t border-slate-700 space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
              <Settings className="w-5 h-5" />
              <span>ตั้งค่า</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 px-6 py-8 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
                <div className="flex justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-4xl font-bold text-white">
                  {stat.value} <span className="text-lg text-slate-400">/ {stat.total}</span>
                </p>
                <p className="text-sm text-green-400 mt-1">{stat.trend}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <button className="rounded-2xl bg-red-600 p-6 text-white flex justify-center items-center gap-3 hover:bg-red-700">
              <Phone /> รับแจ้งเหตุฉุกเฉิน
            </button>
            <button className="rounded-2xl bg-blue-600 p-6 text-white flex justify-center items-center gap-3 hover:bg-blue-700">
              <MapPin /> แผนที่สด
            </button>
            <button className="rounded-2xl bg-emerald-600 p-6 text-white flex justify-center items-center gap-3 hover:bg-emerald-700">
              <Heart /> รายงานสรุป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
