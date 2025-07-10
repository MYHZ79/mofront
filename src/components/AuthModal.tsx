import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SendCodeRequest } from '../types/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goalTitle: string;
}

export function AuthModal({ isOpen, onClose, onSuccess, goalTitle }: AuthModalProps) {
  const { login } = useAuth();
  const [isOtpMode, setIsOtpMode] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpTimeout, setOtpTimeout] = useState(60);

  useEffect(() => {
    if (isOpen) {
      const fetchConfig = async () => {
        try {
          const response = await api.config.get();
          if (response.ok && response.data) {
            setOtpTimeout(response.data.otp_timeout ?? 60);
          }
        } catch (error) {
          console.error('Failed to fetch config:', error);
        }
      };
      fetchConfig();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  if (!isOpen) return null;

  const handlePhonePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(phone, password);
      if (success) {
        toast.success('ورود با موفقیت انجام شد');
        onClose();
        onSuccess();
      }
    } catch (error) {
      toast.error('خطا در ورود به حساب کاربری');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.auth.sendCode({ phone_number: phone } as SendCodeRequest);
      if (response.ok) {
        setOtpSent(true);
        setTimer(otpTimeout);
        toast.success('کد تایید ارسال شد');
      } else if (response.error === 'CODE_ALREADY_SENT') {
        setOtpSent(true);
        setTimer(otpTimeout);
      }
    } catch (error) {
      toast.error('خطا در ارسال کد تایید');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(phone, undefined, otp);
      if (success) {
        toast.success('ورود با موفقیت انجام شد');
        onClose();
        onSuccess();
      }
    } catch (error) {
      toast.error('کد وارد شده صحیح نیست');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">ورود به حساب کاربری</h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setIsOtpMode(false)}
            className={`flex-1 py-2 px-4 rounded ${
              !isOtpMode ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            ورود با رمز عبور
          </button>
          <button
            onClick={() => setIsOtpMode(true)}
            className={`flex-1 py-2 px-4 rounded ${
              isOtpMode ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            ورود با کد یکبار مصرف
          </button>
        </div>

        {!isOtpMode ? (
          <form onSubmit={handlePhonePasswordSignIn}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                شماره موبایل
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                required
                autoComplete="username"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                رمز عبور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="رمز عبور خود را وارد کنید"
                required
                autoComplete="current-password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'لطفا صبر کنید...' : 'ورود'}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                شماره موبایل
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                required
                disabled={otpSent}
              />
            </div>
            
            {otpSent && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  کد تایید
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                  placeholder="کد یکبارمصرف"
                  required
                />
              </div>
            )}
            
            {otpSent && timer > 0 && (
              <div className="text-center text-gray-500 my-4">
                زمان باقی‌مانده: {timer} ثانیه
              </div>
            )}

            {otpSent && timer === 0 && (
              <button
                onClick={handleSendOTP}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 disabled:opacity-50 my-4"
                disabled={isLoading}
              >
                {isLoading ? 'در حال ارسال...' : 'ارسال مجدد کد'}
              </button>
            )}

            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'لطفا صبر کنید...' : otpSent ? 'تایید کد' : 'دریافت کد تایید'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
