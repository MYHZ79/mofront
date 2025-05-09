import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, AlertCircle, Calendar, DollarSign, Shield, ChevronRight, ChevronLeft, Target, ArrowLeft } from 'lucide-react';
import DatePicker from '@hassanmojab/react-modern-calendar-datepicker';
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";
import toast from 'react-hot-toast';
import { CONFIG, formatAmount, isValidIranianMobile, validateDeadline } from '../config/constants';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface GoalData {
  title: string;
  description: string;
  deadline: string;
  amount: string;
  supervisor: string;
  observer: string;
}

interface DayObject {
  year: number;
  month: number;
  day: number;
}

// Convert Persian date to Gregorian
const toGregorianDate = (day: DayObject): Date => {
  // Persian calendar offset is approximately 622 years
  const persianYear = day.year + 622;
  const date = new Date();
  date.setFullYear(persianYear);
  date.setMonth(day.month - 1);
  date.setDate(day.day);
  return date;
};

// Convert Gregorian date to Persian
const toPersianDate = (date: Date): DayObject => {
  return {
    year: date.getFullYear() - 622,
    month: date.getMonth() + 1,
    day: date.getDate()
  };
};

// Get minimum and maximum dates in Persian calendar
const getMinMaxDates = () => {
  const today = new Date();
  const minDate = new Date(today.getTime() + (CONFIG.GOAL_DEADLINE.MIN_DAYS * 24 * 60 * 60 * 1000));
  const maxDate = new Date(today.getTime() + (CONFIG.GOAL_DEADLINE.MAX_DAYS * 24 * 60 * 60 * 1000));
  
  return {
    min: toPersianDate(minDate),
    max: toPersianDate(maxDate)
  };
};

// Get default date (3 days from now)
const getDefaultDate = (): DayObject => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return toPersianDate(date);
};

export function CreateGoalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTitle = location.state?.goalTitle || '';
  const { min: minimumDate, max: maximumDate } = getMinMaxDates();
  const defaultDate = getDefaultDate();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [goalData, setGoalData] = useState<GoalData>({
    title: initialTitle,
    description: '',
    deadline: toGregorianDate(defaultDate).toISOString().split('T')[0],
    amount: formatAmount(CONFIG.GOAL_AMOUNT.MIN),
    supervisor: '',
    observer: '',
  });
  
  const [selectedDay, setSelectedDay] = useState<DayObject>(defaultDate);
  const [errors, setErrors] = useState<Partial<GoalData>>({});
  const [amountInput, setAmountInput] = useState(CONFIG.GOAL_AMOUNT.MIN.toString());

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
            newErrors.deadline = `تاریخ باید بین ${CONFIG.GOAL_DEADLINE.MIN_DAYS} روز و ${CONFIG.GOAL_DEADLINE.MAX_DAYS} روز آینده باشد`;
          }
        }
        break;

      case 3:
        const amount = Number(amountInput);
        if (!amount) {
          newErrors.amount = 'مبلغ اجباری است';
        } else if (amount < CONFIG.GOAL_AMOUNT.MIN || amount > CONFIG.GOAL_AMOUNT.MAX) {
          newErrors.amount = `مبلغ باید بین ${formatAmount(CONFIG.GOAL_AMOUNT.MIN)} و ${formatAmount(CONFIG.GOAL_AMOUNT.MAX)} تومان باشد`;
        }
        break;

      case 4:
        if (!isValidIranianMobile(goalData.supervisor)) {
          newErrors.supervisor = 'شماره موبایل معتبر نیست';
        }
        break;

      case 5:
        if (!isValidIranianMobile(goalData.observer)) {
          newErrors.observer = 'شماره موبایل معتبر نیست';
        } else if (goalData.observer === goalData.supervisor) {
          newErrors.observer = 'ناظر نمی‌تواند با سرپرست یکسان باشد';
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
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue) {
      const amount = parseInt(numericValue);
      setAmountInput(amount.toString());
      setGoalData({
        ...goalData,
        amount: formatAmount(amount),
      });
    } else {
      setAmountInput('');
      setGoalData({
        ...goalData,
        amount: '',
      });
    }
  };

  const handleSubmit = async () => {
    toast.success('در حال انتقال به درگاه پرداخت...');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">عنوان هدف</label>
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
                onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="جزئیات بیشتر درباره هدف خود را وارد کنید"
                rows={4}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">تاریخ سررسید</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                <style>
                  {`
                    .DatePicker {
                      width: 100%;
                    }
                    .DatePicker__input {
                      width: 100%;
                      padding: 0.5rem 2.5rem 0.5rem 1rem;
                      border-radius: 0.5rem;
                      background: rgba(255, 255, 255, 0.1);
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      color: white;
                    }
                    .DatePicker__input:focus {
                      outline: none;
                      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.5);
                    }
                    .Calendar {
                      background: #1f2937;
                      border: 1px solid rgba(255, 255, 255, 0.1);
                      border-radius: 0.5rem;
                      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                      color: white;
                    }
                    .Calendar__day {
                      color: white !important;
                    }
                    .Calendar__day.-selected {
                      background-color: #ef4444 !important;
                      color: white !important;
                    }
                    .Calendar__day:hover {
                      background-color: rgba(239, 68, 68, 0.2) !important;
                    }
                    .Calendar__monthYear {
                      color: white !important;
                    }
                    .Calendar__monthSelector, .Calendar__yearSelector {
                      background: #1f2937 !important;
                    }
                    .Calendar__monthSelector button, .Calendar__yearSelector button {
                      color: white !important;
                    }
                    .Calendar__monthSelector button:hover, .Calendar__yearSelector button:hover {
                      background-color: rgba(239, 68, 68, 0.2) !important;
                    }
                    .Calendar__monthText, .Calendar__yearText {
                      color: white !important;
                    }
                    .Calendar__monthArrow, .Calendar__yearArrow {
                      border-color: white !important;
                    }
                    .Calendar__yearSelectorText {
                      color: white !important;
                    }
                  `}
                </style>
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
                تاریخ سررسید باید بین {CONFIG.GOAL_DEADLINE.MIN_DAYS} روز و {CONFIG.GOAL_DEADLINE.MAX_DAYS} روز از امروز باشد.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">مبلغ (تومان)</label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={goalData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-left"
                  placeholder="مثال: 1,000,000"
                  dir="ltr"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                مبلغ باید بین {formatAmount(CONFIG.GOAL_AMOUNT.MIN)} و {formatAmount(CONFIG.GOAL_AMOUNT.MAX)} تومان باشد.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">شماره موبایل سرپرست</label>
              <div className="relative">
                <Shield className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={goalData.supervisor}
                  onChange={(e) => setGoalData({ ...goalData, supervisor: e.target.value })}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-left"
                  placeholder="مثال: 09123456789"
                  maxLength={11}
                  dir="ltr"
                />
              </div>
              {errors.supervisor && (
                <p className="mt-1 text-sm text-red-500">{errors.supervisor}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                سرپرست شما باید یک شماره موبایل ایرانی معتبر داشته باشد.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">شماره موبایل ناظر</label>
              <div className="relative">
                <Shield className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={goalData.observer}
                  onChange={(e) => setGoalData({ ...goalData, observer: e.target.value })}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-left"
                  placeholder="مثال: 09123456789"
                  maxLength={11}
                  dir="ltr"
                />
              </div>
              {errors.observer && (
                <p className="mt-1 text-sm text-red-500">{errors.observer}</p>
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

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">خلاصه هدف</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-400">عنوان هدف</dt>
                  <dd className="mt-1 text-lg">{goalData.title}</dd>
                </div>
                {goalData.description && (
                  <div>
                    <dt className="text-sm text-gray-400">توضیحات</dt>
                    <dd className="mt-1">{goalData.description}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-400">تاریخ سررسید</dt>
                  <dd className="mt-1">{new Date(goalData.deadline).toLocaleDateString('fa-IR')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">مبلغ</dt>
                  <dd className="mt-1">{goalData.amount} تومان</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">شماره موبایل سرپرست</dt>
                  <dd className="mt-1 font-mono">{goalData.supervisor}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">شماره موبایل ناظر</dt>
                  <dd className="mt-1 font-mono">{goalData.observer}</dd>
                </div>
              </dl>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              پرداخت و شروع چالش
              <DollarSign className="w-5 h-5" />
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ChevronRight className="w-5 h-5" />
          بازگشت
        </button>

        <div className="flex items-center justify-center mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
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
                {i + 1}
              </div>
              {i < 5 && (
                <div
                  className={`h-0.5 w-4 ${
                    i + 1 < currentStep ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
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
            {currentStep < 6 && (
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