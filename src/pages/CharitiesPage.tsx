import React from 'react';
import { SEO } from '../components/SEO';
import { Heart, ExternalLink, Globe, Users, Target, DollarSign, Shield, CheckCircle, ArrowRight, Gift, Sparkles } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useCharities } from '../context/CharitiesContext'; // Import useCharities

export function CharitiesPage() {
  const { charities, isLoadingCharities, charitiesError, fetchCharities } = useCharities(); // Use the context hook

  if (isLoadingCharities) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (charitiesError) {
    return (
      <div className="min-h-screen bg-black text-white" dir="rtl">
        <SEO
          title="خطا - موتیو"
          description="خطا در دریافت اطلاعات خیریه‌ها"
        />
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="bg-gray-900 rounded-xl">
            <ErrorState
              title="خطا در دریافت اطلاعات"
              message={charitiesError}
              onRetry={() => {
                fetchCharities(); // Re-fetch charities on retry
              }}
              onGoHome={() => window.location.href = '/'}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" dir="rtl">
      <SEO
        title="خیریه‌ها - موتیو"
        description="لیست خیریه‌هایی که در صورت عدم موفقیت در اهداف، کمک‌های مالی به آن‌ها اهدا می‌شود."
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/20">
            <Heart className="w-10 h-10 text-white" />
          </div> */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            خیریه‌ها
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            در صورتی که به هدفتون نرسید، در پایان همان ماه مبلغ تعهد شده به انتخاب شما به یکی از خیریه‌های معتبر زیر اهدا خواهد شد.
          </p>
        </div>

        {/* Process Explanation
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-blue-300">چطور کار می‌کنه؟</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Target className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-green-300 mb-2">۱. تعیین هدف</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  شما هدفی تعیین می‌کنید و مبلغی را به عنوان تعهد مالی پرداخت می‌کنید.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-300 mb-2">۲. نظارت</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  ناظر انتخابی شما در روز سررسید، انجام هدف را بررسی و تایید یا رد می‌کند.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Gift className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <h3 className="font-bold text-pink-300 mb-2">۳. اهدا</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  در صورت عدم موفقیت، مبلغ به یکی از خیریه‌های معتبر اهدا می‌شود.
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Charities List */}
        {charities.length === 0 ? (
          <div className="bg-gray-900 rounded-xl">
            <EmptyState
              title="خیریه‌ای یافت نشد"
              message="در حال حاضر هیچ خیریه‌ای در سیستم ثبت نشده است."
              icon={<Heart className="w-10 h-10 text-gray-500" />}
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {charities.map((charity, index) => (
              <div
                key={charity.id || index}
                className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-900/20"
              >
                {charity.image && (
                  <div className="w-16 h-16 bg-gray-800/50 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                    <img
                      src={charity.image}
                      alt={`لوگو ${charity.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-8 h-8 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></div>';
                        }
                      }}
                    />
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-3 text-white">
                  {charity.name || 'نام خیریه'}
                </h3>
                
                <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                  {charity.description || 'توضیحات خیریه در دسترس نیست.'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">فعال</span>
                  </div>
                  
                  {charity.website && (
                    <a
                      href={charity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium group"
                    >
                      <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      وب‌سایت
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        
                {/* Trust Section */}
        <div className="mt-16 mb-16 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-300">تضمین شفافیت</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-white mb-3">انتخاب خیریه‌ها</h3>
              <p className="text-gray-300 leading-relaxed">
                همه خیریه‌ها دارای مجوزهای لازم بوده و فعالیت‌های آن‌ها قابل پیگیری است.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-3">گزارش‌دهی</h3>
              <p className="text-gray-300 leading-relaxed">
                تمامی کمک های اهدایی ثبت و گزارش می‌شود تا شما از مصرف صحیح کمک‌هایتان مطمئن باشید.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
