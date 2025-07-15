import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { X, AlertCircle, Calendar, DollarSign, Shield, ChevronRight, ChevronLeft, Target, ArrowLeft, Contact, Check, Clock, Gift, ListTodo } from 'lucide-react';
import DatePicker from '@hassanmojab/react-modern-calendar-datepicker';
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";
import toast from 'react-hot-toast';
import { CONFIG, formatAmount, isValidIranianMobile, validateDeadline, numberToPersianWords, toRials, toTomans, DayObject, toGregorianDate, toPersianDate } from '../config/constants';
import { api } from '../config/api';
import { useAuth } from '../hooks/useAuth'; // Import useAuth
import { SetGoalRequest } from '../types/api';

interface CreateGoalPageProps {
  configLoaded: boolean;
}

type Step = 1 | 2 | 3 | 4 | 5;

interface GoalData {
  title: string;
  description: string;
  deadline: string;
  amount: string;
  supervisor: string;
}

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
  const now = new Date();
  const iranOffsetMinutes = 3.5 * 60;
  const localOffsetMinutes = now.getTimezoneOffset();
  const utcTime = now.getTime() + (localOffsetMinutes * 60 * 1000);
  const iranCurrentTime = new Date(utcTime + (iranOffsetMinutes * 60 * 1000));

  // Calculate the exact timestamps for min and max allowed deadlines
  const minAllowedTimestamp = iranCurrentTime.getTime() + ((CONFIG.GOAL_DEADLINE.min_goal_hours + 24) * 60 * 60 * 1000);
  const maxAllowedTimestamp = iranCurrentTime.getTime() + (CONFIG.GOAL_DEADLINE.max_goal_hours * 60 * 60 * 1000);

  // The minimum selectable date in the picker should be the day that contains minAllowedTimestamp
  const minDateForPicker = new Date(minAllowedTimestamp);
  // The maximum selectable date in the picker should be the day that contains maxAllowedTimestamp
  const maxDateForPicker = new Date(maxAllowedTimestamp);

  return {
    min: toPersianDate(minDateForPicker),
    max: toPersianDate(maxDateForPicker)
  };
};

export function CreateGoalPage({ configLoaded }: CreateGoalPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTitle = location.state?.goalTitle || '';

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const { user, isLoading } = useAuth();
  const [consentChecked, setConsentChecked] = useState(false);
  const [goalData, setGoalData] = useState<GoalData>({
    title: initialTitle,
    description: '',
    deadline: '', // Initialize empty, will be set in useEffect
    amount: '',
    supervisor: '',
  });
  
  const [selectedDay, setSelectedDay] = useState<DayObject | null>(null); // Initialize null
  const [errors, setErrors] = useState<Partial<GoalData>>({});
  const [amountInput, setAmountInput] = useState('');
  const [minimumDate, setMinimumDate] = useState<DayObject | null>(null);
  const [maximumDate, setMaximumDate] = useState<DayObject | null>(null);

  useEffect(() => {
    if (configLoaded) {
      const { min, max } = getMinMaxDates();
      setMinimumDate(min);
      setMaximumDate(max);
      // Set initial deadline to the minimum allowed date
      setGoalData(prev => ({
        ...prev,
        deadline: toGregorianDate(min).toISOString().split('T')[0],
      }));
      setSelectedDay(min);
    }
  }, [configLoaded]);

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
            const minDays = Math.ceil(CONFIG.GOAL_DEADLINE.min_goal_hours / 24);
            const maxDays = Math.floor(CONFIG.GOAL_DEADLINE.max_goal_hours / 24);
            newErrors.deadline = `تاریخ باید بین ${minDays} تا ${maxDays+1} روز آینده باشد`;
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
    const supervisorCheckDate = new Date(deadlineDate.getTime() - (CONFIG.SUPERVISION_TIMEOUT_HOURS * 60 * 60 * 1000));

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
              <p className="text-gray-400">شما هدف «{goalData.title}» را با مبلغ تعهد مالی {formatAmount(parseInt(amountInput))} تومان ثبت میکنید.</p>
            </div>
          </div>

          <div className="relative flex items-start mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-500"><DollarSign className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <h3 className="font-bold">پرداخت مبلغ</h3>
              </div>
              <p className="text-gray-400"> مبلغ پرداختی به  امانت نزد موتیو نگهداری می‌شود.</p>
            </div>
          </div>

          <div className="relative flex items-start mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-500"><Shield className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-red-500 mb-2">
        
                <h3 className="font-bold">تعیین ناظر</h3>
              </div>
              <p className="text-gray-400">ناظر انتخابی شما با شماره {goalData.supervisor} مسئول تایید انجام هدف خواهد بود.</p>
            </div>
          </div>

          <div className="relative flex items-start mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-500/20 text-yellow-500"><Clock className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                
                <h3 className="font-bold">اطلاع‌رسانی به ناظر</h3>
              </div>
              <p className="text-gray-400">در پایان روز {supervisorCheckDate.toLocaleDateString('fa-IR')} ({CONFIG.SUPERVISION_TIMEOUT_HOURS} ساعت قبل از سررسید هدف) پیامک نظارت برای ناظر ارسال خواهد شد.</p>
            </div>
          </div>

          <div className="relative flex items-start mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/20 text-green-500"><Calendar className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-green-500 mb-2">
            
                <h3 className="font-bold">سررسید هدف</h3>
              </div>
              <p className="text-gray-400"> ناظر هدف تا پایان روز سررسید ({deadlineDate.toLocaleDateString('fa-IR')}) مهلت دارد که انجام هدف را تایید یا رد کند.</p>
            </div>
          </div>

          <div className="relative flex items-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-500"><Gift className="w-5 h-5" /></div>
            <div className="mr-3 text-right">
              <div className="flex items-center gap-2 text-blue-500 mb-2">
               
                <h3 className="font-bold">نتیجه</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400"><span className="text-green-500">در صورت تایید انجام هدف توسط ناظر:</span><br /> مبلغ {formatAmount(parseInt(amountInput)-CONFIG.GOAL_CREATION_FEE)} تومان به حساب شما بازگردانده می‌شود. (کارمزد ثبت هدف: {formatAmount(CONFIG.GOAL_CREATION_FEE)} تومان)</p>
                <p className="text-gray-400"><span className="text-red-500">در صورت رد انجام هدف یا عدم پاسخ توسط ناظر: </span><br />این مبلغ توسط موتیو به خیریه اهدا خواهد شد.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mt-8">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="consent" className="text-sm text-gray-300 leading-relaxed cursor-pointer">
                  <span className="font-medium text-blue-300">تأیید می‌کنم که مراحل انجام هدف را مطالعه کرده‌ام و با شرایط موافقم. همچنین صحت اطلاعات وارد شده مورد تایید من است.</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!consentChecked}
          className={`w-full py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${
            consentChecked 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transform hover:scale-[1.02]' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          پرداخت و شروع چالش
        </button>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">هدفت چیه؟</h2>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div className="text-right">
                    <h3 className="font-bold text-blue-400 mb-2">تعریف هدف</h3>
                    <p className="text-blue-200 text-sm leading-relaxed">
                      هدفت رو به صورت واضح و مشخص بنویس. مثلاً "خواندن 3 کتاب"، "کاهش ۱۰ کیلو وزن"، "ترک سیگار" یا "تمرین روزانه ورزش". 
                      هدف باید واقع‌بینانه باشه تا ناظر بتونه به راحتی وضعیت انجامش رو تشخیص بده.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
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
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">تا کی باید به هدفت برسی؟ </h2>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div className="text-right">
                    <h3 className="font-bold text-green-400 mb-2">تعیین تاریخ سررسید</h3>
                    <p className="text-green-200 text-sm leading-relaxed">
                      یک تاریخ واقع‌بینانه برای رسیدن به هدفت انتخاب کن. نه خیلی کوتاه که غیرممکن باشه، نه خیلی طولانی که انگیزه‌ت رو از دست بدی. 
                      در روز سررسید، ناظر انتخابی تو باید تأیید کنه که آیا به هدفت رسیدی یا نه؟
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-lg font-bold mb-2">تاریخ سررسید</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                {minimumDate && maximumDate && selectedDay && (
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
                )}
              </div>
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                تاریخ سررسید باید بین {Math.ceil(CONFIG.GOAL_DEADLINE.min_goal_hours / 24)} تا {Math.ceil(CONFIG.GOAL_DEADLINE.max_goal_hours / 24)+1} روز آینده باشد.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">چقدر برات ارزش داره؟</h2>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div className="text-right">
                    <h3 className="font-bold text-yellow-400 mb-2">تعهد مالی</h3>
                    <p className="text-yellow-200 text-sm leading-relaxed">
                      مبلغ رو طوری انتخاب کن که انگیزه‌ت برای رسیدن به هدف رو بالا ببره. اگر موفق بشی، پولت برمی‌گرده. 
                      اگر موفق نشی یا ناظر تأیید نکنه، این مبلغ به خیریه اهدا میشه. پس یه مبلغ انتخاب کن که واقعاً برات مهم باشه!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
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
              {/* <p className="mt-2 text-sm text-gray-400">
                مبلغ باید بین {formatAmount(CONFIG.GOAL_AMOUNT.min_goal_value)} و {formatAmount(CONFIG.GOAL_AMOUNT.max_goal_value)} تومان باشد.
              </p> */}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">چه کسی باید پیشرفتت رو بررسی کنه؟</h2>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                  <div className="text-right">
                    <h3 className="font-bold text-purple-400 mb-2">انتخاب ناظر</h3>
                    <p className="text-purple-200 text-sm leading-relaxed">
                      یک فرد معتمد رو انتخاب کن که بتونه صادقانه قضاوت کنه آیا به هدفت رسیدی یا نه؟ می‌تونه دوست، خانواده، همکار یا حتی مربی باشه. 
                      مهم اینه که این شخص بتونه پیشرفت تو رو ببینه و در روز سررسید تصمیم بگیره. ناظر باید شماره موبایل فعال داشته باشه.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
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
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">آماده‌ای شروع کنی؟</h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <ListTodo className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div className="text-right">
                    <h3 className="font-bold text-red-400 mb-2">مرور نهایی</h3>
                    <p className="text-red-200 text-sm leading-relaxed">
                      همه چیز آماده‌ست! حالا وقتشه که تعهدت رو نهایی کنی. بعد از پرداخت، هدفت فعال میشه و باید تا روز سررسید بهش برسی. 
                      موفقیت یا شکست، انتخاب با توئه. آماده‌ای این چالش رو بپذیری؟
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
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
        description="هدفت رو مشخص کن، تعهد بده، انجامش بده!"
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
