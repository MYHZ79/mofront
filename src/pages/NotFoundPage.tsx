import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Home, ArrowLeft, Search, Target } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4" dir="rtl">
      <SEO
        title="صفحه یافت نشد - موتیو"
        description="صفحه مورد نظر شما یافت نشد."
      />
      
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div className="absolute top-4 right-8 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 left-6 w-3 h-3 bg-red-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-12 left-12 w-2 h-2 bg-red-300 rounded-full animate-pulse delay-700"></div>
        </div>

        <h1 className="text-6xl font-bold text-red-500 mb-4">۴۰۴</h1>
        <h2 className="text-2xl font-bold mb-4">صفحه یافت نشد</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          متأسفانه صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا ممکن است حذف شده باشد.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
          >
            <Home className="w-5 h-5" />
            بازگشت به صفحه اصلی
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            بازگشت به صفحه قبل
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-3">پیشنهادات:</p>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => navigate('/goals')}
              className="block w-full text-right text-gray-300 hover:text-white transition-colors"
            >
              • مشاهده اهداف من
            </button>
            <button
              onClick={() => navigate('/create-goal')}
              className="block w-full text-right text-gray-300 hover:text-white transition-colors"
            >
              • ایجاد هدف جدید
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="block w-full text-right text-gray-300 hover:text-white transition-colors"
            >
              • مشاهده پروفایل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}