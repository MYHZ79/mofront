import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Eye, Calendar, DollarSign, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Goal, GetGoalsRequest, GetSupervisionsRequest } from '../types/api';
import { formatAmount } from '../config/constants';
import { api } from '../config/api';



export function GoalsPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [supervisions, setSupervisions] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
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
          toast.error(goalsResponse.error || 'Failed to load goals');
        }

        if (supervisionsResponse.ok && supervisionsResponse.data?.goals) {
          setSupervisions(supervisionsResponse.data.goals);
        } else {
          toast.error(supervisionsResponse.error || 'Failed to load supervisions');
        }
      } catch (error) {
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
        <div className='w-12 h-12 bg-gray-300/10 rounded-full flex items-center justify-center'>
          {icon}
        </div>
        <h2 className="table-title">{title}</h2>
      </div>
      
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
                <td className="py-4 px-4">{item.value ? formatAmount(item.value): 'N/A'} تومان</td>
                <td className="py-4 px-4">
                  {item.deadline ? new Date(item.deadline * 1000).toLocaleDateString('fa-IR') : 'N/A'}
                </td>
                <td className="py-4 px-4">
                  {(() => {
                    const now = new Date().getTime() / 1000;
                    const deadline = item.deadline;
                    const isSupervised = item.supervised_at !== undefined && item.supervised_at !== null;

                    let deadlineStatusText;
                    let deadlineStatusClass;

                    if (deadline && deadline < now) {
                      deadlineStatusText = 'مهلت به پایان رسیده';
                      deadlineStatusClass = 'bg-red-500/10 text-red-500';
                    } else if (isSupervised) {
                       deadlineStatusText = 'فرآیند به پایان رسیده';
                       deadlineStatusClass = 'bg-green-500/10 text-green-500';
                    }
                     else {
                      deadlineStatusText = 'در حال انجام';
                      deadlineStatusClass = 'bg-yellow-500/10 text-yellow-500';
                    }

                    let supervisionStatusText = '';
                    let supervisionStatusClass = '';

                    if (isSupervised) {
                      supervisionStatusText = item.done ? 'نظارت: تکمیل شده' : 'نظارت: در انتظار تایید';
                      supervisionStatusClass = item.done ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500';
                    }


                    return (
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deadlineStatusClass}`}
                        >
                          {deadlineStatusText}
                        </span>
                        {isSupervised && (
                           <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${supervisionStatusClass}`}
                          >
                            {supervisionStatusText}
                          </span>
                        )}
                      </div>
                    );
                  })()}
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
