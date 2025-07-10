import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../config/api';
import { formatAmount, toTomans } from '../config/constants';
import { GetPaymentRequest, GetPaymentResponse } from '../types/api';


export function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<GetPaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedStatus = useRef(false);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    if (hasFetchedStatus.current) return;
    hasFetchedStatus.current = true;

    if (!paymentId) {
      setError('شناسه پرداخت یافت نشد');
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await api.payments.getStatus({ payment_id: parseInt(paymentId) } as GetPaymentRequest);
        if (response.ok && response.data) {
          setPaymentStatus(response.data);
        } else {
          setError(response.error || 'خطا در دریافت وضعیت پرداخت');
        }
      } catch (error) {
        setError('خطا در ارتباط با سرور');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">خطا در پرداخت</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  if (!paymentStatus) return null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <SEO
        title="وضعیت پرداخت - موتیو"
        description="وضعیت پرداخت هدف شما در موتیو."
      />
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-8">پرداخت با موفقیت انجام شد</h1>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-gray-800">
            <span className="text-gray-400">مبلغ پرداختی:</span>
            <span className="font-bold">{formatAmount(toTomans(paymentStatus.amount))} تومان</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-800">
            <span className="text-gray-400">درگاه پرداخت:</span>
            <span>{paymentStatus.pgp_name}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-800">
            <span className="text-gray-400">کد پیگیری:</span>
            <span className="font-mono">{paymentStatus.tracing_code}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              if (paymentStatus.goal_id !== undefined) {
                navigate(`/goals/${paymentStatus.goal_id}`);
              }
            }}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
          >
            مشاهده جزئیات هدف
          </button>
          
          <button
            onClick={() => navigate('/goals')}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
          >
            مشاهده لیست اهداف
          </button>
        </div>
      </div>
    </div>
  );
}
