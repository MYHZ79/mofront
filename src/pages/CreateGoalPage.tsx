import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { X, AlertCircle, Calendar, DollarSign, Shield, ChevronRight, ChevronLeft, Target, ArrowLeft, Contact, Check, Clock, Gift, ListTodo } from 'lucide-react';
import DatePicker from '@hassanmojab/react-modern-calendar-datepicker';
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";
import toast from 'react-hot-toast';
import { CONFIG, formatAmount, isValidIranianMobile, validateDeadline, numberToPersianWords, toRials, toTomans } from '../config/constants';
import { api } from '../config/api';
import jalali from 'jalali-moment';
import { useAuth } from '../hooks/useAuth'; // Import useAuth
import { SetGoalRequest } from '../types/api';

type Step = 1 | 2 | 3 | 4 | 5;

interface GoalData {
  title: string;
  description: string;
  deadline: string;
  amount: string;
  supervisor: string;
}

interface DayObject {
  year: number;
  month: number;
  day: number;
}

const toGregorianDate = (day: DayObject): Date => {
  const jalaliDate = jalali.from(`${day.year}-${day.month}-${day.day}`, 'fa','YYYY/MM/DD');
  return jalaliDate.toDate();
};

const toPersianDate = (date: Date): DayObject => {
  const jalaliDate = jalali(date);
  return {
    year: jalaliDate.jYear(),
    month: jalaliDate.jMonth() + 1,
    day: jalaliDate.jDate()
  };
};

const normalizePhoneNumber = (phone: string | undefined | null): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, ''); // Remove all non-digit characters
  // Take the last 10 digits, which should be the core number for Iranian mobiles (e.g., 9123456789)
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits; // Return as is if less than 10 digits, or if it's not a standard mobile
};

const getMinMaxDates = () => {
  const today = new Date();
  const minDate = new Date(today.getTime() + (CONFIG.GOAL_DEADLINE.min_goal_hours * 60 * 60 * 1000));
  minDate.setHours(23, 59, 59, 999); // Round minDate to the end of the day

  const maxDate = new Date(today.getTime() + (CONFIG.GOAL_DEADLINE.max_goal_hours * 60 * 60 * 1000));
  maxDate.setDate(maxDate.getDate() - 1); // Set maxDate to the day before
  maxDate.setHours(23, 59, 59, 999); // Round maxDate to the end of the day

  return {
    min: toPersianDate(minDate),
    max: toPersianDate(maxDate)
  };
};

const getDefaultDate = (minDate: DayObject): DayObject => {
  return minDate;
};

export function CreateGoalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTitle = location.state?.goalTitle || '';
  const { min: minimumDate, max: maximumDate } = getMinMaxDates();
  const defaultDate = minimumDate; // getDefaultDate is no longer needed as it just returned minimumDate

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const { user, isLoading } = useAuth();
  console.log(user)
  const [goalData, setGoalData] = useState<GoalData>({
    title: initialTitle,
    description: '',
    deadline: toGregorianDate(minimumDate).toISOString().split('T')[0],
    amount: '',
    supervisor: '',
  });
  
  const [selectedDay, setSelectedDay] = useState<DayObject>(minimumDate);
  const [errors, setErrors] = useState<Partial<GoalData>>({});
  const [amountInput, setAmountInput] = useState('');

  const validateStep = (step: Step): boolean => {
    const newErrors: Partial<GoalData> = {};

    switch (step) {
      case 1:
        if (!goalData.title.trim()) {
          newErrors.title = 'عنوان هدف اجباری است';
        }
        break;

      case 2:
        if (!goalData.deadline) {
          newErrors.deadline = 'تاریخ سررسید اجباری است';
        } else {
          const date = new Date(goalData.deadline);
          if (!validateDeadline(date)) {
            newErrors.deadline = `تاریخ باید بین ${Math.floor(CONFIG.GOAL_DEADLINE.min_goal_hours / 24)+1} تا ${Math.floor(CONFIG.GOAL_DEADLINE.max_goal_hours / 24)+1} روز آینده باشد`;
          }
        }
        break;

      case 3:
        const amount = Number(amountInput);
        if (!amount) {
          newErrors.amount = 'مبلغ اجباری است';
        } else if (amount < CONFIG.GOAL_AMOUNT.min_goal_value || amount > CONFIG.GOAL_AMOUNT.max_goal_value) {
          newErrors.amount = `مبلغ باید بین ${formatAmount(CONFIG.GOAL_AMOUNT.min_goal_value)} و ${formatAmount(CONFIG.GOAL_AMOUNT.max_goal_value)} تومان باشد`;
        }
        break;

      case 4:
        if (!isValidIranianMobile(goalData.supervisor)) {
          newErrors.supervisor = 'شماره موبایل معتبر نیست';
        } else {
            const normalizedUserPhone = normalizePhoneNumber(user?.phone_number);
            const normalizedSupervisorPhone = normalizePhoneNumber(goalData.supervisor);
            if (normalizedUserPhone && normalizedUserPhone === normalizedSupervisorPhone) {
              newErrors.supervisor = 'شماره موبایل ناظر نمی‌تواند با شماره شما یکسان باشد';
            }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev < 6 ? (prev + 1) as Step : prev));
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/');
    } else {
      setCurrentStep((prev) => (prev > 1 ? (prev - 1) as Step : prev));
    }
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmountInput(numericValue);

    const amount = Number(numericValue);
    const newErrors: Partial<GoalData> = {};

    if (!amount) {
      newErrors.amount = 'مبلغ اجباری است';
    } else if (amount < CONFIG.GOAL_AMOUNT.min_goal_value || amount > CONFIG.GOAL_AMOUNT.max_goal_value) {
      newErrors.amount = `مبلغ باید بین ${formatAmount(CONFIG.GOAL_AMOUNT.min_goal_value)} و ${formatAmount(CONFIG.GOAL_AMOUNT.max_goal_value)} تومان باشد`;
    }

    setErrors(newErrors);

    setGoalData({
      ...goalData,
      amount: numericValue,
    });
  };

  const handleSupervisorChange = (value: string) => {
    setGoalData({ ...goalData, supervisor: value });
    const newErrors: Partial<GoalData> = {};
    if (!isValidIranianMobile(value)) {
      newErrors.supervisor = 'شماره موبایل معتبر نیست';
    } else {
      const normalizedUserPhone = normalizePhoneNumber(user?.phone_number);
      const normalizedSupervisorPhone = normalizePhoneNumber(value);
      if (normalizedUserPhone && normalizedUserPhone === normalizedSupervisorPhone) {
        newErrors.supervisor = 'شماره موبایل سرپرست نمی‌تواند با شماره شما یکسان باشد';
      }
    }
    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    try {
      const response = await api.goals.create({
        goal: goalData.title,
        description: goalData.description || undefined,
        value: toRials(parseInt(amountInput)), // Convert Toman to Rials before sending to backend
        deadline: Math.floor(new Date(goalData.deadline).getTime() / 1000),
        supervisor_phone_number: goalData.supervisor
      } as SetGoalRequest); // Pass SetGoalRequest object

      if (response.ok && response.data?.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        toast.error(response.error || 'خطا در ایجاد هدف');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const renderTimeline = () => {
    const deadlineDate = new Date(goalData.deadline);
    const supervisorCheckDate = new Date(deadlineDate.getTime() - (24 * 60 * 60 * 1000));

    return (
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute -translate-x-1/2 right-3 top-0 h-full w-0.5 bg-gray-800"></div>
          
          <div className="relative flex items-start mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-500"><Target className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <h3 className="font-bold">ثبت هدف</h3>
              </div>
              <p className="text-gray-400">شما هدف «{goalData.title}» را با مبلغ {formatAmount(parseInt(amountInput))} تومان ثبت کردید.</p>
            </div>
          </div>

          <div className="relative flex items-start mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-500"><DollarSign className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <h3 className="font-bold">پرداخت مبلغ</h3>
              </div>
              <p className="text-gray-400">پس از پرداخت، مبلغ {formatAmount(parseInt(amountInput))} تومان به صورت امانت نزد موتیو نگهداری می‌شود.</p>
            </div>
          </div>

          <div className="relative flex items-start mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-500"><Shield className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-red-500 mb-2">
        
                <h3 className="font-bold">تعیین ناظر</h3>
              </div>
              <p className="text-gray-400">ناظر شما با شماره {goalData.supervisor} مسئول تایید انجام هدف خواهد بود.</p>
            </div>
          </div>

          <div className="relative flex items-start mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-500/20 text-yellow-500"><Clock className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                
                <h3 className="font-bold">اطلاع‌رسانی به ناظر</h3>
              </div>
              <p className="text-gray-400">در تاریخ {supervisorCheckDate.toLocaleDateString('fa-IR')}، یک روز قبل از موعد، پیامکی برای ناظر ارسال خواهد شد.</p>
            </div>
          </div>

          <div className="relative flex items-start mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/20 text-green-500"><Calendar className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-green-500 mb-2">
            
                <h3 className="font-bold">موعد هدف</h3>
              </div>
              <p className="text-gray-400">در تاریخ {deadlineDate.toLocaleDateString('fa-IR')} ناظر باید انجام هدف را تایید کند.</p>
            </div>
          </div>

          <div className="relative flex items-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-500"><Gift className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-blue-500 mb-2">
               
                <h3 className="font-bold">نتیجه</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">در صورت تایید ناظر: مبلغ {formatAmount(parseInt(amountInput))} تومان به شما بازگردانده می‌شود.</p>
                <p className="text-gray-400">در صورت عدم تایید یا عدم پاسخ ناظر: مبلغ به خیریه اهدا خواهد شد.</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-red-500 text-white py-4 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 mt-8"
        >
          پرداخت و شروع چالش
          <DollarSign className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-bold mb-2">عنوان هدف</label>
              <div className="relative">
                <Target className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={goalData.title}
                  onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="مثال: ترک سیگار"
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">توضیحات (اختیاری)</label>
              <textarea
                value={goalData.description}
                onChange={(e) => setGoalData({ ...goalData, description: e.target.value.slice(0, 250) })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="جزئیات بیشتر درباره هدف خود را وارد کنید"
                rows={4}
              />
              <p className="mt-1 text-sm text-gray-400">{goalData.description.length}/250</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-bold mb-2">تاریخ سررسید</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                <DatePicker
                  value={selectedDay}
                  onChange={(day) => {
                    if (day) {
                      setSelectedDay(day);
                      const gregorianDate = toGregorianDate(day);
                      setGoalData({
                        ...goalData,
                        deadline: gregorianDate.toISOString().split('T')[0],
                      });
                    }
                  }}
                  inputPlaceholder="انتخاب تاریخ"
                  colorPrimary="#EF4444"
                  locale="fa"
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  shouldHighlightWeekends
                />
              </div>
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                تاریخ سررسید باید بین {Math.floor(CONFIG.GOAL_DEADLINE.min_goal_hours / 24)+1} تا {Math.floor(CONFIG.GOAL_DEADLINE.max_goal_hours / 24)+1} روز آینده باشد.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-bold mb-2">مبلغ (تومان)</label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-left"
                  placeholder="مثال: 1,000,000"
                  dir="ltr"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
              {!errors.amount && amountInput && (
                <p className="mt-1 text-sm text-gray-400">
                  {numberToPersianWords(Number(amountInput))} تومان
                </p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                مبلغ باید بین {formatAmount(CONFIG.GOAL_AMOUNT.min_goal_value)} و {formatAmount(CONFIG.GOAL_AMOUNT.max_goal_value)} تومان باشد.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-bold mb-2">شماره موبایل ناظر</label>
              <div className="relative">
                <Shield className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={goalData.supervisor}
                  onChange={(e) => handleSupervisorChange(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-left"
                  placeholder="مثال: 09123456789"
                  maxLength={11}
                  dir="ltr"
                />
              </div>
              {errors.supervisor && (
                <p className="mt-1 text-sm text-red-500">{errors.supervisor}</p>
              )}
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">نکات مهم:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>در روز سررسید، پیامکی برای ناظر ارسال خواهد شد تا هدف را تایید یا رد کند.</li>
                      <li>اگر ناظر در روز سررسید هدف را تایید یا رد نکند، مبلغ به صورت خودکار به خیریه اهدا خواهد شد.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-1">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <div className="flex justify-center">
                <h3 className="text-xl font-bold mb-6 mt-6 flex"><ListTodo className="text-yellow-500 ml-1 flex" />مراحل انجام هدف</h3>
              </div>
              {renderTimeline()}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white" dir="rtl">
      <SEO
        title="هدف جدید - موتیو"
        description="هدفت رو مشخص کن، پول بذار روش، انجامش بده!"
      />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ChevronRight className="w-5 h-5" />
          بازگشت
        </button>

        <div className="flex items-center justify-center mb-8">
          {Array.from({ length: 5 }).map((_, i) => {
            let icon;
            switch (i + 1) {
              case 1:
                icon = <Target className="w-4 h-4" />;
                break;
              case 2:
                icon = <Calendar className="w-4 h-4" />;
                break;
              case 3:
                icon = <DollarSign className="w-4 h-4" />;
                break;
              case 4:
                icon = <Shield className="w-4 h-4" />;
                break;
              case 5:
                icon = <ArrowLeft className="w-4 h-4" />;
                break;
              default:
                icon = i + 1;
            }
            return (
              <React.Fragment key={i}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i + 1 === currentStep
                      ? 'bg-red-500 text-white'
                      : i + 1 < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {icon}
                </div>
                {i < 4 && (
                  <div
                    className={`h-0.5 w-4 ${
                      i + 1 < currentStep ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          {renderStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                قبلی
              </button>
            )}
            {currentStep < 5 && (
              <button
                onClick={handleNext}
                className="mr-auto flex items-center gap-2 text-white bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                بعدی
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
