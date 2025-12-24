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
import { getCenters } from './services/centerService';

interface Center {
  id: string;
  name: string;
  location: string;
  phone: string;
  status: 'active' | 'inactive';
  capacity: number;
  currentItems: number;
  district: string;
  subdistrict: string;
  shelterType: string;
  createdAt: string;
}

type TabType = 'overview' | 'cases' | 'ambulances' | 'centers' | 'reports' | 'settings';

export default function Page() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ===== Centers API State =====
  const [centers, setCenters] = useState<Center[]>([]);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centersError, setCentersError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ===== Fetch Centers =====
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setCentersLoading(true);
        setCentersError(null);

        const response = await getCenters(page, 20, search, filterStatus);

        if (response.success) {
          setCenters(response.data);
          setTotalPages(response.pagination.totalPages);
        } else {
          setCentersError(response.message);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch centers';
        setCentersError(errorMsg);
      } finally {
        setCentersLoading(false);
      }
    };

    if (activeTab === 'centers') {
      fetchCenters();
    }
  }, [activeTab, page, search, filterStatus]);

  const stats = [
    {
      title: 'ศูนย์อพยพทั้งหมด',
      value: centers.length.toString(),
      total: totalPages > 0 ? `${totalPages * 20}` : '944',
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
    { icon: Activity, label: 'ภาพรวม', id: 'overview' as TabType },
    { icon: AlertCircle, label: 'กรณีฉุกเฉิน', id: 'cases' as TabType },
    { icon: Ambulance, label: 'รถพยาบาล', id: 'ambulances' as TabType },
    { icon: Users, label: 'ศูนย์', id: 'centers' as TabType },
    { icon: BarChart3, label: 'รายงานสถิติ', id: 'reports' as TabType },
    { icon: Settings, label: 'ตั้งค่า', id: 'settings' as TabType },
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
              <h1 className="text-2xl font-bold text-white">ศูนย์การแพทย์ฉุกเฉิน</h1>
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
            <button className="flex items-center rounded-lg px-6 py-3 font-semibold text-white hover:bg-slate-700">
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
                onClick={() => setActiveTab(item.id)}
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
          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === 'overview' && (
            <>
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
                <button className="rounded-2xl bg-red-600 p-6 text-white flex justify-center items-center gap-3 hover:bg-red-700 transition">
                  <Phone /> รับแจ้งเหตุฉุกเฉิน
                </button>
                <button className="rounded-2xl bg-blue-600 p-6 text-white flex justify-center items-center gap-3 hover:bg-blue-700 transition">
                  <MapPin /> แผนที่สด
                </button>
                <button className="rounded-2xl bg-emerald-600 p-6 text-white flex justify-center items-center gap-3 hover:bg-emerald-700 transition">
                  <Heart /> รายงานสรุป
                </button>
              </div>
            </>
          )}

          {/* ===== CENTERS TAB (NEW) ===== */}
          {activeTab === 'centers' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-3xl font-bold text-white">ศูนย์อพยพ/พักพิง</h2>
                <p className="text-slate-400 text-sm mt-1">ทั้งหมด {totalPages > 0 ? totalPages * 20 : 'กำลังโหลด'} ศูนย์</p>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-4 flex-col sm:flex-row">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อศูนย์..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ปิดใช้</option>
                </select>
              </div>

              {/* Loading State */}
              {centersLoading && (
                <div className="text-center py-12">
                  <div className="inline-block">
                    <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-slate-400 mt-4">กำลังโหลด...</p>
                </div>
              )}

              {/* Error State */}
              {centersError && (
                <div className="rounded-lg bg-red-500/20 border border-red-500 p-4 text-red-400">
                  <p>❌ เกิดข้อผิดพลาด: {centersError}</p>
                </div>
              )}

              {/* Centers Table */}
              {!centersLoading && centers.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-300">ชื่อศูนย์</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-300">สถานที่</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-300">เบอร์โทร</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-300">ประเภท</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-300">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centers.map((center) => (
                        <tr key={center.id} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 text-white font-semibold">{center.name}</td>
                          <td className="px-4 py-3 text-slate-300 text-sm">{center.location || center.district}</td>
                          <td className="px-4 py-3 text-slate-300">{center.phone}</td>
                          <td className="px-4 py-3 text-slate-300 text-sm">{center.shelterType}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                center.status === 'active'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {center.status === 'active' ? '✓ ใช้งาน' : '✕ ปิดใช้'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Empty State */}
              {!centersLoading && centers.length === 0 && !centersError && (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">ไม่พบข้อมูล</p>
                </div>
              )}

              {/* Pagination */}
              {!centersLoading && totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6 flex-wrap">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                  >
                    ← ก่อนหน้า
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => page - 2 + i).map((p) => {
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-4 py-2 rounded-lg transition ${
                          p === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                  >
                    ถัดไป →
                  </button>

                  <span className="px-4 py-2 text-slate-300">
                    หน้า {page} / {totalPages}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ===== CASES TAB ===== */}
          {activeTab === 'cases' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">กรณีฉุกเฉิน</h2>
              <div className="space-y-4">
                {emergencyCases.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-semibold">{c.location}</p>
                        <p className="text-slate-400 text-sm">
                          {c.type} - {c.time}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          c.priority === 'วิกฤต'
                            ? 'bg-red-500/20 text-red-400'
                            : c.priority === 'สูง'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mt-2">{c.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== AMBULANCES TAB ===== */}
          {activeTab === 'ambulances' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">สถานะรถพยาบาล</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ambulanceStatus.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-semibold">{a.id}</p>
                        <p className="text-slate-400 text-sm">{a.driver}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          a.status === 'ว่าง'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">📍 {a.location}</p>
                    <div className="mt-3 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${a.battery}%` }}></div>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">🔋 {a.battery}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== REPORTS TAB ===== */}
          {activeTab === 'reports' && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-white mb-4">รายงานสถิติ</h2>
              <p className="text-slate-400">coming soon...</p>
            </div>
          )}

          {/* ===== SETTINGS TAB ===== */}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-white mb-4">ตั้งค่า</h2>
              <p className="text-slate-400">coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}