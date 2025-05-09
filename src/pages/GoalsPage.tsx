import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Eye, Calendar, DollarSign, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Goal } from '../types/goal';
import { formatAmount } from '../config/constants';

// Test data for goals
const testGoals: Goal[] = [
  {
    goal_id: 1,
    goal: "ترک سیگار",
    description: "قصد دارم در مدت ۳۰ روز سیگار را کاملاً ترک کنم",
    value: 2000000,
    deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
    supervisor_phone_number: "09123456789",
    supervisor_email: "supervisor@example.com",
    done: false,
    created_at: Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60), // 5 days ago
  },
  {
    goal_id: 2,
    goal: "نوشتن کتاب",
    description: "تکمیل نگارش کتاب در موضوع برنامه‌نویسی",
    value: 5000000,
    deadline: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 days from now
    supervisor_phone_number: "09198765432",
    supervisor_email: "book.supervisor@example.com",
    done: false,
    created_at: Math.floor(Date.now() / 1000) - (10 * 24 * 60 * 60), // 10 days ago
  }
];

// Test data for supervisions
const testSupervisions: Goal[] = [
  {
    goal_id: 3,
    goal: "یادگیری زبان انگلیسی",
    description: "رسیدن به سطح B2 در مدت ۳ ماه",
    value: 3000000,
    deadline: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days from now
    supervisor_phone_number: "09123456789",
    supervisor_email: "english.teacher@example.com",
    done: false,
    created_at: Math.floor(Date.now() / 1000) - (15 * 24 * 60 * 60), // 15 days ago
  }
];

export function GoalsPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [supervisions, setSupervisions] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsResponse, supervisionsResponse] = await Promise.all([
          fetch('https://imotiv.ir/api/getGoals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ page: 0 }),
          }),
          fetch('https://imotiv.ir/api/getSupervisions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ page: 0 }),
          }),
        ]);

        const goalsData = await goalsResponse.json();
        const supervisionsData = await supervisionsResponse.json();

        if (goalsData.ok) {
          setGoals(goalsData.data.goals);
        } else {
          // Use test data if API fails
          setGoals(testGoals);
        }
        if (supervisionsData.ok) {
          setSupervisions(supervisionsData.data.goals);
        } else {
          // Use test data if API fails
          setSupervisions(testSupervisions);
        }
      } catch (error) {
        // Use test data if API fails
        setGoals(testGoals);
        setSupervisions(testSupervisions);
        toast.error('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderTable = (data: Goal[], title: string, icon: React.ReactNode) => (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-right py-3 px-4">عنوان</th>
              <th className="text-right py-3 px-4">مبلغ</th>
              <th className="text-right py-3 px-4">تاریخ سررسید</th>
              <th className="text-right py-3 px-4">وضعیت</th>
              <th className="text-right py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.goal_id}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/goals/${item.goal_id}`)}
              >
                <td className="py-4 px-4">{item.goal}</td>
                <td className="py-4 px-4">{formatAmount(item.value)} تومان</td>
                <td className="py-4 px-4">
                  {new Date(item.deadline * 1000).toLocaleDateString('fa-IR')}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.done
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {item.done ? 'تکمیل شده' : 'در حال انجام'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <button
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/goals/${item.goal_id}`);
                    }}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {renderTable(goals, 'اهداف من', <Target className="w-6 h-6 text-red-500" />)}
        {renderTable(supervisions, 'نظارت‌های من', <Shield className="w-6 h-6 text-blue-500" />)}
      </div>
    </div>
  );
}