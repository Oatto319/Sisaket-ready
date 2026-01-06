// lib/useAuth.ts
'use client';

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
}

// ✅ Mock database - ในจริงควรเป็น backend
const USERS_DB: Record<string, { password: string; role: 'admin' | 'staff'; name: string; id: string }> = {
  admin: {
    password: 'admin123',
    role: 'admin',
    name: 'ผู้บริหารระบบ',
    id: 'admin-001'
  },
  staff: {
    password: 'staff123',
    role: 'staff',
    name: 'เจ้าหน้าที่',
    id: 'staff-001'
  }
};

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ โหลด user จาก localStorage ตอน mount
  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  // ✅ ฟังก์ชัน login
  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const userDb = USERS_DB[username];
    
    if (!userDb || userDb.password !== password) {
      setIsLoading(false);
      throw new Error('username หรือ password ไม่ถูกต้อง');
    }

    const userData: User = {
      id: userDb.id,
      username,
      role: userDb.role,
      name: userDb.name
    };

    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  // ✅ ฟังก์ชัน logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff'
  };
};