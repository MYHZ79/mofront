import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Target, Calendar, DollarSign, User, Mail, Phone, Clock, CheckCircle, XCircle, ArrowLeft, Quote, ArrowRight, Shield, Flag } from 'lucide-react';
import { TwitterShareButton, TwitterIcon, TelegramShareButton, TelegramIcon, WhatsappShareButton, WhatsappIcon, LinkedinShareButton, LinkedinIcon } from 'react-share';
import toast from 'react-hot-toast';
import { ErrorState } from '../components/ErrorState';
import { Goal, ViewGoalRequest, SuperviseGoalRequest } from '../types/api';
import { formatAmount, toTomans, CONFIG } from '../config/constants';
import { api } from '../config/api';
import { formatDistanceToNow, differenceInSeconds, addHours, subHours } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

export function GoalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState(0);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [supervisionDescription, setSupervisionDescription] = useState('');
  const shareUrl = window.location.href;
  const shareTitle = goal ? `هدف من در موتیو: ${goal.goal}` : '';
  const { user, isLoading: isAuthLoading } = useAuth(); // Get isLoading from useAuth
  console.log(user)
  const hasFetchedGoal = useRef(false);

  useEffect(() => {
    const fetchGoal = async () => {
      if (hasFetchedGoal.current) return;
      hasFetchedGoal.current = true;

      try {
        const response = await api.goals.view({ goal_id: parseInt(id!) } as ViewGoalRequest);
        if (response.ok && response.data) {
          setGoal(response.data);
          // Check if user is loaded before accessing phone_number
          if (user?.phone_number) {
            setIsSupervisor(response.data.supervisor_phone_number === user.phone_number);
            setIsOwner(response.data.supervisor_phone_number !== user.phone_number);
          }
        } else {
          setGoal(null);
          toast.error(response.error || 'خطا در دریافت اطلاعات هدف');
          if (isSupervisor) navigate('/goals');
        }
      } catch (error) {
        setGoal(null);
        setIsSupervisor(false);
        setIsOwner(false);
        toast.error('خطا در دریافت اطلاعات هدف');
        if (isSupervisor) navigate('/goals');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch goal if auth is not loading
    if (!isAuthLoading) {
      fetchGoal();
    }
  }, [id, user?.phone_number, isAuthLoading]); // Add isAuthLoading to dependency array

  useEffect(() => {
    if (!goal || goal.done || goal.supervised_at || goal.deadline === undefined) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      if (goal.deadline != undefined){
        const remaining = goal.deadline - now;
        setRemaining(remaining)

        if (remaining <= 0) {
          setCountdown('زمان به پایان رسیده');
          return;
        }
        
        const days = Math.floor(remaining / (24 * 60 * 60));
        const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((remaining % (60 * 60)) / 60);
        const seconds = remaining % 60;

        let countdownString = '';
        if (days > 0) {
          countdownString += `${days} روز `;
        }
        if (hours > 0) {
          countdownString += `${hours} ساعت `;
        }
        if (minutes > 0) {
          countdownString += `${minutes} دقیقه `;
        }
        if (seconds > 0) {
          countdownString += `${seconds} ثانیه`;
        }

        setCountdown(countdownString.trim());
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [goal]);

  const handleSupervision = async (approve: boolean) => {
    try {
      const response = await api.goals.supervise({
        goal_id: parseInt(id!),
        done: approve,
        description: supervisionDescription || undefined
      } as SuperviseGoalRequest);
      
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

  // Use isAuthLoading to show loading state while auth is loading
  if (loading || isAuthLoading) {
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
            <ArrowRight className="w-5 h-5" />
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: goal.goal,
    description: goal.description,
    startDate: goal.created_at ? new Date(goal.created_at * 1000).toISOString() : undefined,
    endDate: goal.deadline ? new Date(goal.deadline * 1000).toISOString() : undefined,
    eventStatus: goal.done ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled',
    organizer: {
      '@type': 'Person',
      name: `${goal.creator_first_name} ${goal.creator_last_name}`,
    },
  };

  const deadlineDate = goal.deadline ? new Date(goal.deadline * 1000) : null;
  const supervisionTimeoutHours = CONFIG.SUPERVISION_TIMEOUT_HOURS;
  const supervisionWindowStart = deadlineDate && supervisionTimeoutHours !== undefined
    ? subHours(deadlineDate, supervisionTimeoutHours)
    : null;
  const now = new Date();
  const isInSupervisionWindow = supervisionWindowStart && deadlineDate && now >= supervisionWindowStart && now <= deadlineDate;

  const formatSupervisionTime = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8" dir="rtl">
      <SEO
        title={`${goal.goal} - موتیو`}
        description={goal.description || ''}
      />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/goals')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowRight className="w-5 h-5" />
          بازگشت به لیست اهداف
        </button>

        <div className="bg-gray-900 rounded-xl p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-gray-800">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{goal.goal}</h1>
              </div>
            </div>
            
            {/* <div className="flex items-center gap-2 justify-start md:justify-center">
              <TwitterShareButton url={shareUrl} title={shareTitle}>
                <button className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center hover:bg-blue-400/40 transition-colors">
                  <TwitterIcon size={30} bgStyle={{fill:'none'}}/>
                </button>
              </TwitterShareButton>
              <LinkedinShareButton url={shareUrl} title={shareTitle}>
                <button className="w-10 h-10 bg-blue-700/20 rounded-lg flex items-center justify-center hover:bg-blue-700/40 transition-colors">
                  <LinkedinIcon size={30} bgStyle={{fill:'none'}}/>
                </button>
              </LinkedinShareButton>
              <TelegramShareButton url={shareUrl} title={shareTitle}>
                <button className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/40 transition-colors">
                  <TelegramIcon size={30} bgStyle={{fill:'none'}}/>
                </button>
              </TelegramShareButton>
              <WhatsappShareButton  url={shareUrl} title={shareTitle}>
                <button className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center hover:bg-green-500/40 transition-colors">
                  <WhatsappIcon size={30} bgStyle={{fill:'none'}}/>
                </button>
              </WhatsappShareButton>
            </div> */}
          </div>

          {goal.description && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-2">
                <Quote className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-400 mt-1">{goal.description}</p>
              </div>
            </div>
          )}

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
                  <p>{goal.value !== undefined ? formatAmount(toTomans(goal.value)) : 'N/A'} تومان</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">وضعیت</p>
                  <p className={(goal.done || goal.supervised_at || remaining <0) ? 'text-green-500' : 'text-yellow-500'}>
                    {(goal.done || goal.supervised_at || remaining <0) ? 'به پایان رسیده' : 'در حال انجام'}
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

          {!goal.supervised_at && remaining >= 0 && countdown ? (
            <div className="bg-yellow-500/10 rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-yellow-500">{countdown}</p>
              {remaining >= 0 && <p className="text-yellow-200 mt-2">تا پایان مهلت</p>}
            </div>
          ) : (
            <div className={`${goal.done ? 'bg-green-800/50' : 'bg-red-800/50'} rounded-lg p-6 space-y-4`}>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold">نتیجه نظارت</h3>
              </div>

              {goal.supervised_at ? (
                <>
                  <div className="flex bg-gray-500/20 rounded-lg p-3 text-center items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${goal.done ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p>{goal.done ? 'ناظر انجام هدف را تایید کرده است' : 'ناظر انجام هدف را رد کرد'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">زمان نظارت</p>
                      <p>{new Date(goal.supervised_at * 1000).toLocaleDateString('fa-IR')}</p>
                    </div>
                  </div>

                  {goal.supervisor_description && (
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-400">توضیحات ناظر:</p>
                      <p className="mt-2">{goal.supervisor_description}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex bg-gray-500/20 rounded-lg p-3 text-center items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <p>هدف نظارت نشده است</p>
                </div>
              )}
            </div>
          )}


          {isSupervisor && !goal.supervised_at &&  remaining >= 0 && (
            <div className="pt-6 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400 mb-4" />
                <div>
                  <p className="text-lg font-medium mb-4">ثبت نظارت</p>
                </div>
              </div>

              {isInSupervisionWindow ? (
                <>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
                    <div className="flex gap-2">
                      <Flag className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <div className="text-sm text-yellow-200">
                        شما به عنوان ناظر این هدف انتخاب شده‌اید. لطفاً تا پایان روز {goal.deadline ? new Date(goal.deadline * 1000).toLocaleDateString('fa-IR') : 'N/A'} وضعیت پیشرفت این هدف را ثبت کنید.  
                        <br />
                        شما میتوانید علاوه بر ثبت نظارت، توضیحاتی برای مالک هدف ثبت کنید تا بازخورد شما برای او شفاف باشد. 
                      </div>
                    </div>
                  </div>
                  <textarea
                    value={supervisionDescription}
                    onChange={(e) => setSupervisionDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                    placeholder="توضیحات خود را وارد کنید"
                    rows={4}
                  />
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
                </>
              ) : (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                  <div className="flex gap-2">
                    <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="text-sm text-blue-200">
                      زمان نظارت بر این هدف از تاریخ {formatSupervisionTime(supervisionWindowStart)} تا {formatSupervisionTime(deadlineDate)} می‌باشد.
                      <br />
                      لطفاً در این بازه زمانی برای ثبت نظارت اقدام کنید.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
