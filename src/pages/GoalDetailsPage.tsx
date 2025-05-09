import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Calendar, DollarSign, User, Mail, Phone, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Goal } from '../types/goal';
import { formatAmount } from '../config/constants';

// Test data
const testGoal: Goal = {
  goal_id: 1,
  goal: "ترک سیگار",
  description: "قصد دارم در مدت ۳۰ روز سیگار را کاملاً ترک کنم",
  value: 2000000,
  deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
  supervisor_phone_number: "09123456789",
  supervisor_email: "supervisor@example.com",
  done: false,
  created_at: Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60), // 5 days ago
  phone_number: "09198765432",
  creator_first_name: "علی",
  creator_last_name: "محمدی",
  email: "ali@example.com"
};

export function GoalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await fetch('https://imotiv.ir/api/viewGoal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ goal_id: parseInt(id!) }),
        });
        
        const data = await response.json();
        if (data.ok) {
          setGoal(data.data);
        } else {
          // Use test data if API fails
          setGoal(testGoal);
        }
        // Check if current user is supervisor or owner
        const userPhone = localStorage.getItem('userPhone') || "09123456789"; // Test phone number
        setIsSupervisor(testGoal.supervisor_phone_number === userPhone);
        setIsOwner(testGoal.phone_number === userPhone);
      } catch (error) {
        // Use test data if API fails
        setGoal(testGoal);
        const userPhone = localStorage.getItem('userPhone') || "09123456789"; // Test phone number
        setIsSupervisor(testGoal.supervisor_phone_number === userPhone);
        setIsOwner(testGoal.phone_number === userPhone);
        toast.error('خطا در دریافت اطلاعات هدف');
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [id]);

  const handleSupervision = async (approve: boolean) => {
    try {
      // Implement supervision API call here
      toast.success(approve ? 'هدف با موفقیت تایید شد' : 'هدف رد شد');
    } catch (error) {
      toast.error('خطا در ثبت نظارت');
    }
  };

  const getRemainingTime = () => {
    if (!goal) return '';
    const now = Math.floor(Date.now() / 1000);
    const remaining = goal.deadline - now;
    
    if (remaining <= 0) return 'زمان به پایان رسیده';
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    
    return `${days} روز و ${hours} ساعت باقی مانده`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">هدف مورد نظر یافت نشد</p>
          <button
            onClick={() => navigate('/goals')}
            className="mt-4 flex items-center gap-2 text-red-500 hover:text-red-400"
          >
            <ArrowLeft className="w-5 h-5" />
            بازگشت به لیست اهداف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/goals')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          بازگشت به لیست اهداف
        </button>

        <div className="bg-gray-900 rounded-xl p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-800">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{goal.goal}</h1>
              {goal.description && (
                <p className="text-gray-400 mt-1">{goal.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">تاریخ سررسید</p>
                  <p>{new Date(goal.deadline * 1000).toLocaleDateString('fa-IR')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">مبلغ</p>
                  <p>{formatAmount(goal.value)} تومان</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">وضعیت</p>
                  <p className={goal.done ? 'text-green-500' : 'text-yellow-500'}>
                    {goal.done ? 'تکمیل شده' : getRemainingTime()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">ایجاد کننده</p>
                  <p>{goal.creator_first_name} {goal.creator_last_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">شماره تماس</p>
                  <p dir="ltr">{goal.phone_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">ایمیل</p>
                  <p dir="ltr">{goal.email}</p>
                </div>
              </div>
            </div>
          </div>

          {isSupervisor && !goal.done && (
            <div className="pt-6 border-t border-gray-800">
              <p className="text-lg font-medium mb-4">تایید یا رد هدف</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleSupervision(true)}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  تایید هدف
                </button>
                <button
                  onClick={() => handleSupervision(false)}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  رد هدف
                </button>
              </div>
            </div>
          )}

          {isOwner && !goal.done && (
            <div className="pt-6 border-t border-gray-800">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-200">
                  <Clock className="w-5 h-5 inline-block mr-2" />
                  {getRemainingTime()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}