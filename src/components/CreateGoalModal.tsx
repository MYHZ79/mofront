import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar, DollarSign, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { CONFIG, formatAmount, isValidIranianMobile, validateDeadline } from '../config/constants';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoalTitle: string;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface GoalData {
  title: string;
  description: string;
  deadline: string;
  amount: string;
  supervisor: string;
  observer: string;
}

export function CreateGoalModal({ isOpen, onClose, initialGoalTitle }: CreateGoalModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [goalData, setGoalData] = useState<GoalData>({
    title: initialGoalTitle,
    description: '',
    deadline: '',
    amount: '',
    supervisor: '',
    observer: '',
  });
  const [errors, setErrors] = useState<Partial<GoalData>>({});

  if (!isOpen) return null;

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
        const amount = Number(goalData.amount.replace(/[^0-9]/g, ''));
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
          newErrors.observer = 'ناظر نمی‌تواند با مالک هدف یکسان باشد';
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
    setCurrentStep((prev) => (prev > 1 ? (prev - 1) as Step : prev));
  };

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    setGoalData({
      ...goalData,
      amount: numericValue ? formatAmount(parseInt(numericValue)) : '',
    });
  };

  const handleSubmit = async () => {
    // Here you would implement the payment flow
    toast.success('در حال انتقال به درگاه پرداخت...');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">عنوان هدف</label>
              <input
                type="text"
                value={goalData.title}
                onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="مثال: ترک سیگار"
              />
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
                <input
                  type="date"
                  value={goalData.deadline}
                  onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })}
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  min={new Date(Date.now() + (CONFIG.GOAL_DEADLINE.MIN_DAYS * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
                  max={new Date(Date.now() + (CONFIG.GOAL_DEADLINE.MAX_DAYS * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
                />
              </div>
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                تاریخ سررسید باید حداقل {CONFIG.GOAL_DEADLINE.MIN_DAYS} روز و حداکثر {CONFIG.GOAL_DEADLINE.MAX_DAYS} روز از امروز باشد.
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
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="مثال: 1,000,000"
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
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="مثال: 09123456789"
                  maxLength={11}
                />
              </div>
              {errors.supervisor && (
                <p className="mt-1 text-sm text-red-500">{errors.supervisor}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                ناظر شما باید یک شماره موبایل ایرانی معتبر داشته باشد.
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
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="مثال: 09123456789"
                  maxLength={11}
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
                  <dt className="text-sm text-gray-400">شماره موبایل ناظر</dt>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full mx-auto relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
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