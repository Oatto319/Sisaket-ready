'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// ตรวจสอบว่าติดตั้ง heroicons แล้ว: npm install @heroicons/react
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        // ✅ ไปที่หน้า Dashboard
        router.push('/dashboard'); 
      } else {
        setError(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
      }
    } catch (error) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      setIsLoading(false);
    }
  };

  // CSS Classes สำหรับ Input แบบ Modern Clean
  const inputWrapperClass = "relative mt-2 rounded-xl shadow-sm";
  const iconClass = "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400";
  const inputClass = "block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-slate-100 ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all bg-slate-800/60 backdrop-blur-md";

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-slate-100">
      {/* === ส่วนซ้าย: Branding (แสดงเฉพาะบนจอใหญ่) === */}
      <div className="relative hidden w-0 flex-1 lg:block">
        {/* พื้นหลังแบบ Gradient นุ่มๆ และ Pattern จางๆ */}
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
             <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg"><pattern id="pattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="scale(2)"><rect width="100%" height="100%" fill="none"/><path d="M0 0h40v40H0z" fill="currentColor"/></pattern><rect width="100%" height="100%" fill="url(#pattern)"/></svg>
        </div>
        
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-slate-100">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
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
        <div className="mx-auto w-full max-w-sm lg:w-96 bg-slate-900/50 rounded-2xl p-8 shadow-lg border border-slate-800">
          <div>
             
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-100">
              ยินดีต้อนรับ
            </h2>
            <p className="mt-2 text-sm text-slate-100">
               เข้าสู่ระบบ
            </p>
          </div>

          <div className="mt-8">
            {error && (
                <div className="mb-6 rounded-xl bg-red-900/60 p-4 text-sm text-red-200 flex items-center gap-3 border border-red-800">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-300 flex-shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                   {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-100">
                  อีเมล
                </label>
                <div className={inputWrapperClass}>
                  <div className={iconClass}>
                    <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-100">
                    รหัสผ่าน
                    </label>
                    <div className="text-sm">
                        <a href="#" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                        ลืมรหัสผ่าน?
                        </a>
                    </div>
                </div>
                
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
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    <>
                       เข้าสู่ระบบ 
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-slate-100">
                  ยังไม่มีบัญชี?{' '}
                  <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    สร้างบัญชี
                  </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}