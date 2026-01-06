'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/useAuth'; // ✅ ขึ้นไป 2 ชั้น

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // ✅ ฟังก์ชันกำหนด role ตาม username
  const getRoleByUsername = (username: string): string => {
    if (username.toLowerCase() === 'admin') {
      return 'ADMIN';
    } else if (username.toLowerCase() === 'staff') {
      return 'STAFF';
    }
    return 'USER';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ✅ เรียก login ผ่าน useAuth hook
      await login(formData.username, formData.password);
      
      // ✅ เก็บ role ลงใน localStorage
      const userRole = getRoleByUsername(formData.username);
      localStorage.setItem('userRole', userRole);
      
      // ✅ เก็บข้อมูล user object ด้วย
      const userData = {
        username: formData.username,
        role: userRole,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log(`✅ Login สำเร็จ - Role: ${userRole}`);
      console.log(`📊 User data:`, userData);
      
      // ✅ Redirect ไปยัง dashboard
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถเข้าสู่ระบบได้');
      setIsLoading(false);
    }
  };

  // ✅ Demo credentials
  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'ผู้บริหาร (Admin)' },
    { username: 'staff', password: 'staff123', role: 'เจ้าหน้าที่ (Staff)' }
  ];

  const inputWrapperClass = "relative mt-2 rounded-xl shadow-sm";
  const iconClass = "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400";
  const inputClass = "block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-slate-100 ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all bg-slate-800/60 backdrop-blur-md";

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-slate-100">
      {/* === ส่วนซ้าย: Branding === */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
          <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="scale(2)">
              <rect width="100%" height="100%" fill="none"/>
              <path d="M0 0h40v40H0z" fill="currentColor"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#pattern)"/>
          </svg>
        </div>
        
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-100">Sisaket Ready System</span>
          </div>
          <div className="mb-20">
            <blockquote className="space-y-2">
              <p className="text-2xl font-medium leading-relaxed text-slate-200">
                "ระบบศูนย์สั่งการที่ทันสมัย ช่วยให้การบริหารจัดการข้อมูลเป็นไปอย่างรวดเร็วและแม่นยำ เพื่อความพร้อมในการช่วยเหลือประชาชน"
              </p>
            </blockquote>
          </div>
          <p className="text-sm text-slate-100">© 2024 Sisaket Ready Team.</p>
        </div>
      </div>

      {/* === ส่วนขวา: แบบฟอร์ม Login === */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="bg-slate-900/50 rounded-2xl p-8 shadow-lg border border-slate-800">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">
                ยินดีต้อนรับ
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                เข้าสู่ระบบเพื่อใช้งาน
              </p>
            </div>

            <div className="mt-8">
              {error && (
                <div className="mb-6 rounded-xl bg-red-900/60 p-4 text-sm text-red-200 flex items-center gap-3 border border-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-300 flex-shrink-0">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium leading-6 text-slate-100">
                    Username
                  </label>
                  <div className={inputWrapperClass}>
                    <div className={iconClass}>
                      <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      placeholder="admin หรือ staff"
                      value={formData.username}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-100">
                    รหัสผ่าน
                  </label>
                  <div className={inputWrapperClass}>
                    <div className={iconClass}>
                      <LockClosedIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ✅ Demo Credentials */}
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z"></path>
              </svg>
              Demo Credentials
            </h3>
            <div className="space-y-3">
              {demoCredentials.map((cred) => (
                <div key={cred.username} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400">Username</p>
                    <p className="text-sm font-mono text-slate-100 truncate">{cred.username}</p>
                    <p className="text-xs text-slate-400 mt-1">Password</p>
                    <p className="text-sm font-mono text-slate-100 truncate">{cred.password}</p>
                    <p className="text-xs text-blue-400 mt-2">บทบาท: {cred.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ username: cred.username, password: cred.password });
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap mt-2"
                  >
                    ใช้
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}