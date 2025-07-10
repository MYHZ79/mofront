import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Target, Eye, Calendar, DollarSign, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoalStatusDisplay } from '../components/GoalStatusDisplay';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Goal, GetGoalsRequest, GetSupervisionsRequest } from '../types/api';
import { formatAmount, toTomans } from '../config/constants';
import { api } from '../config/api';



export function GoalsPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [supervisions, setSupervisions] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {

      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const [goalsResponse, supervisionsResponse] = await Promise.all([
          api.goals.getAll({ page: 0 } as GetGoalsRequest),
          api.goals.getSupervisions({ page: 0 } as GetSupervisionsRequest)
        ]);

        if (goalsResponse.ok && goalsResponse.data?.goals) {
          setGoals(goalsResponse.data.goals);
        } else {
          setError(goalsResponse.error || 'خطا در دریافت اهداف');
        }

        if (supervisionsResponse.ok && supervisionsResponse.data?.goals) {
          setSupervisions(supervisionsResponse.data.goals);
        } else {
          // Don't set error for supervisions failure, just log it
          console.error('Failed to load supervisions:', supervisionsResponse.error);
        }
      } catch (error) {
        setError('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderTable = (data: Goal[], title: string, icon: React.ReactNode) => (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className='w-12 h-12 bg-gray-300/10 rounded-full flex items-center justify-center'>
          {icon}
        </div>
        <h2 className="table-title">{title}</h2>
      </div>
      
      {data.length === 0 ? (
        <EmptyState
          title={title === 'اهداف من' ? 'هنوز هدفی ندارید' : 'هنوز نظارتی ندارید'}
          message={title === 'اهداف من' ? 'اولین هدف خود را ایجاد کنید و شروع به پیشرفت کنید.' : 'هنوز برای نظارت بر هدفی انتخاب نشده‌اید.'}
          actionText={title === 'اهداف من' ? 'ایجاد هدف جدید' : undefined}
          onAction={title === 'اهداف من' ? () => navigate('/create-goal') : undefined}
          icon={title === 'اهداف من' ? <Target className="w-10 h-10 text-gray-500" /> : <Shield className="w-10 h-10 text-gray-500" />}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-right py-3 px-4">عنوان</th>
                <th className="text-right py-3 px-4">مبلغ</th>
                <th className="text-right py-3 px-4">تاریخ سررسید</th>
                <th className="text-right py-3 px-4">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.goal_id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.goal_id !== undefined) {
                      navigate(`/goals/${item.goal_id}`);
                    }
                  }}
                >
                  <td className="py-4 px-4">{item.goal}</td>
                  <td className="py-4 px-4">{item.value ? formatAmount(toTomans(item.value)): 'N/A'} تومان</td>
                  <td className="py-4 px-4">
                    {item.deadline ? new Date(item.deadline * 1000).toLocaleDateString('fa-IR') : 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <GoalStatusDisplay goal={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white" dir="rtl">
        <SEO
          title="خطا - موتیو"
          description="خطا در دریافت اطلاعات"
        />
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="bg-gray-900 rounded-xl">
            <ErrorState
              title="خطا در دریافت اطلاعات"
              message={error}
              onRetry={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              onGoHome={() => navigate('/')}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8" dir="rtl">
      <SEO
        title="اهداف من - موتیو"
        description="اهداف و نظارت‌های خود را در موتیو مدیریت کنید."
      />
      <div className="max-w-6xl mx-auto space-y-8">
        {renderTable(goals, 'اهداف من', <Target className="w-6 h-6 text-red-500" />)}
        {renderTable(supervisions, 'نظارت‌های من', <Shield className="w-6 h-6 text-blue-500" />)}
      </div>
    </div>
  );
}
