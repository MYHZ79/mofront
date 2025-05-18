import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Calendar, DollarSign, User, Mail, Phone, Clock, CheckCircle, XCircle, ArrowLeft, Share2, MessageCircle } from 'lucide-react';
import { TwitterShareButton, TelegramShareButton, WhatsappShareButton, LinkedinShareButton } from 'react-share';
import toast from 'react-hot-toast';
import { Goal } from '../types/goal';
import { formatAmount } from '../config/constants';
import { api } from '../config/api';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { fa } from 'date-fns/locale';

export function GoalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [countdown, setCountdown] = useState('');
  const shareUrl = window.location.href;
  const shareTitle = goal ? `هدف من در موتیو: ${goal.goal}` : '';

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await api.goals.view(parseInt(id!));
        if (response.ok && response.data) {
          setGoal(response.data);
          const userPhone = localStorage.getItem('userPhone');
          if (userPhone) {
            setIsSupervisor(response.data.supervisor_phone_number === userPhone);
            setIsOwner(response.data.supervisor_phone_number !== userPhone);
          }
        } else {
          setGoal(null);
          toast.error(response.error || 'خطا در دریافت اطلاعات هدف');
        }
      } catch (error) {
        setGoal(null);
        setIsSupervisor(false);
        setIsOwner(false);
        toast.error('خطا در دریافت اطلاعات هدف');
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [id]);

  useEffect(() => {
    if (!goal || goal.done) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = goal.deadline - now;
      
      if (remaining <= 0) {
        setCountdown('زمان به پایان رسیده');
        return;
      }
      
      const days = Math.floor(remaining / (24 * 60 * 60));
      const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((remaining % (60 * 60)) / 60);
      const seconds = remaining % 60;
      
      setCountdown(`${days} روز ${hours} ساعت ${minutes} دقیقه ${seconds} ثانیه`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [goal]);

  const handleSupervision = async (approve: boolean) => {
    try {
      const response = await api.goals.supervise(parseInt(id!), approve);
      if (response.ok) {
        toast.success(approve ? 'هدف با موفقیت تایید شد' : 'هدف رد شد');
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
          <div className="flex items-center justify-between pb-6 border-b border-gray-800">
            <div className="flex items-center gap-4">
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
            
            <div className="flex items-center gap-2">
              <TelegramShareButton url={shareUrl} title={shareTitle}>
                <button className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                  <Share2 className="w-5 h-5 text-blue-500" />
                </button>
              </TelegramShareButton>
              <WhatsappShareButton url={shareUrl} title={shareTitle}>
                <button className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center hover:bg-green-500/20 transition-colors">
                  <Share2 className="w-5 h-5 text-green-500" />
                </button>
              </WhatsappShareButton>
            </div>
          </div>

          {!goal.done && countdown && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-yellow-500">{countdown}</p>
              <p className="text-yellow-200 mt-2">تا پایان مهلت</p>
            </div>
          )}

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
                  <p dir="ltr">{goal.creator_phone_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">ایمیل</p>
                  <p dir="ltr">{goal.creator_email}</p>
                </div>
              </div>
            </div>
          </div>

          {goal.supervised_at && (
            <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold">نتیجه نظارت</h3>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${goal.done ? 'bg-green-500' : 'bg-red-500'}`} />
                <p>{goal.done ? 'هدف تایید شده' : 'هدف رد شده'}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">زمان نظارت</p>
                  <p>{new Date(goal.supervised_at * 1000).toLocaleDateString('fa-IR')}</p>
                </div>
              </div>
              
              {goal.supervisor_description && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">توضیحات ناظر:</p>
                  <p className="mt-2">{goal.supervisor_description}</p>
                </div>
              )}
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
}