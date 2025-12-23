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
} from 'lucide-react';

export default function Page() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'ambulances'>('overview');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: 'รถพยาบาลพร้อมใช้งาน',
      value: '12',
      total: '15',
      icon: Ambulance,
      color: 'bg-emerald-500',
      trend: '+2 จากเมื่อวาน',
    },
    {
      title: 'ผู้ป่วยฉุกเฉิน',
      value: '8',
      total: 'รายวันนี้',
      icon: AlertCircle,
      color: 'bg-red-500',
      trend: '-3 จากเมื่อวาน',
    },
    {
      title: 'เจ้าหน้าที่ออกปฏิบัติการ',
      value: '24',
      total: '32',
      icon: Users,
      color: 'bg-blue-500',
      trend: '75% พร้อมปฏิบัติการ',
    },
    {
      title: 'เวลาตอบสนองเฉลี่ย',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
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

            <button className="flex items-center space-x-2 rounded-lg bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600">
              <Phone className="w-5 h-5" />
              <span>1669</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
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
          <button className="rounded-2xl bg-red-600 p-6 text-white flex justify-center items-center gap-3">
            <Phone /> รับแจ้งเหตุฉุกเฉิน
          </button>
          <button className="rounded-2xl bg-blue-600 p-6 text-white flex justify-center items-center gap-3">
            <MapPin /> แผนที่สด
          </button>
          <button className="rounded-2xl bg-emerald-600 p-6 text-white flex justify-center items-center gap-3">
            <Heart /> รายงานสรุป
          </button>
        </div>
      </div>
    </div>
  );
}
