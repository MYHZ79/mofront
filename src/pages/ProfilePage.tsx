import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { GetMeResponse, EditUserRequest, EditPasswordRequest } from '../types/api';
import { formatAmount } from '../config/constants';
import { api } from '../config/api';
import { useAuth } from '../hooks/useAuth'; // Import useAuth

// Test user data
// const testUser: UserType = {
//   user_id: 1,
//   first_name: "علی",
//   last_name: "محمدی",
//   phone_number: "09123456789",
//   email: "ali@example.com",
//   birth: 631152000, // Example timestamp
//   gender: "M"
// };

export function ProfilePage() {
  const { user, isLoading } = useAuth(); // Use user and isLoading from useAuth
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Update formData when user data from useAuth changes
  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        email: user.email || '',
      });
    }
  }, [user]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.user.editUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      } as EditUserRequest); // Cast to EditUserRequest

      if (response.ok) {
        toast.success('اطلاعات با موفقیت به‌روزرسانی شد');
      } else {
        toast.error(response.error || 'خطا در به‌روزرسانی اطلاعات');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('رمز عبور جدید و تکرار آن مطابقت ندارند');
      return;
    }

    try {
      const response = await api.user.editPassword({
        password: formData.newPassword,
        confirmation: formData.confirmPassword,
      } as EditPasswordRequest); // Pass EditPasswordRequest object
      if (response.ok) {
        toast.success('رمز عبور با موفقیت تغییر کرد');
        setFormData({
          ...formData,
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.error || 'خطا در تغییر رمز عبور');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  if (isLoading) { // Use isLoading from useAuth
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-gray-900 rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold">پروفایل کاربری</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">نام</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">نام خانوادگی</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">شماره موبایل</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/20 border border-white/20 text-gray-400 placeholder-gray-400 focus:outline-none focus:ring-0"
                  dir="ltr"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">ایمیل</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
            >
              ذخیره تغییرات
            </button>
          </form>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6">تغییر رمز عبور</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium mb-2">رمز عبور جدید</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">تکرار رمز عبور جدید</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
            >
              تغییر رمز عبور
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
