import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showHomeButton?: boolean;
  icon?: React.ReactNode;
}

export function ErrorState({ 
  title = 'خطایی رخ داده است',
  message = 'متأسفانه مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.',
  onRetry,
  onGoHome,
  showHomeButton = true,
  icon
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        {icon || <AlertCircle className="w-8 h-8 text-red-500" />}
      </div>
      
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 mb-8 max-w-md leading-relaxed">{message}</p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </button>
        )}
        
        {showHomeButton && onGoHome && (
          <button
            onClick={onGoHome}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            صفحه اصلی
          </button>
        )}
      </div>
    </div>
  );
}