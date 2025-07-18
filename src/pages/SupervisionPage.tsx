import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Target, Calendar, DollarSign, User, Mail, Phone, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { ErrorState } from '../components/ErrorState';
import { Goal, ViewGoalRequest, SuperviseGoalRequest, ViewGoalResponse, SuperviseGoalResponse } from '../types/api';
import { formatAmount } from '../config/constants';
import { api } from '../config/api';

export function SupervisionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [supervisionDescription, setSupervisionDescription] = useState('');
  const hasFetchedGoal = useRef(false);

  useEffect(() => {
    const fetchGoal = async () => {
      if (hasFetchedGoal.current) return;
      hasFetchedGoal.current = true;

      try {
        const response = await api.goals.view({ goal_id: parseInt(id!) } as ViewGoalRequest);
        if (response.ok && response.data) {
          setGoal(response.data);
        } else {
          setGoal(null);
          toast.error(response.error || 'خطا در دریافت اطلاعات هدف');
          navigate('/goals');
        }
      } catch (error) {
        setGoal(null);
        toast.error('خطا در دریافت اطلاعات هدف');
        navigate('/goals');
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [id, navigate]);

  const handleSupervision = async (done: boolean) => {
    try {
      const response = await api.goals.supervise({ goal_id: parseInt(id!), done: done, description: supervisionDescription || undefined } as SuperviseGoalRequest);
      if (response.ok) {
        toast.success(done ? 'هدف با موفقیت تایید شد' : 'هدف رد شد');
        navigate('/goals');
      } else {
        toast.error(response.error || 'خطا در ثبت نظارت');
      }
    } catch (error) {
      toast.error('خطا در ثبت نظارت');
    }
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
      <div className="min-h-screen bg-black text-white" dir="rtl">
        <SEO
          title="هدف یافت نشد - موتیو"
          description="هدف مورد نظر یافت نشد"
        />
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <button
            onClick={() => navigate('/goals')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            بازگشت به لیست اهداف
          </button>
          
          <div className="bg-gray-900 rounded-xl">
            <ErrorState
              title="هدف یافت نشد"
              message="هدف مورد نظر شما یافت نشد یا ممکن است حذف شده باشد."
              onRetry={() => window.location.reload()}
              onGoHome={() => navigate('/goals')}
              showHomeButton={true}
              icon={<Target className="w-8 h-8 text-red-500" />}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8" dir="rtl">
      <SEO
        title={`نظارت: ${goal.goal} - موتیو`}
        description={`نظارت بر هدف ${goal.goal}`}
      />
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
                  <p>{goal.deadline ? new Date(goal.deadline * 1000).toLocaleDateString('fa-IR') : 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">مبلغ</p>
                  <p>{goal.value !== undefined ? formatAmount(goal.value) : 'N/A'} تومان</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">وضعیت</p>
                  <p className={goal.done ? 'text-green-500' : 'text-yellow-500'}>
                    {goal.done ? 'تکمیل شده' : 'در حال انجام'}
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

          <div className="pt-6 border-t border-gray-800">
            <p className="text-lg font-medium mb-4">ثبت نظارت</p>
            <textarea
              value={supervisionDescription}
              onChange={(e) => setSupervisionDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="توضیحات خود را وارد کنید"
              rows={4}
            />
            <div className="flex gap-4 mt-4">
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
        </div>
      </div>
    </div>
  );
}
