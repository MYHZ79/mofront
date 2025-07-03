import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Target, Heart, DollarSign, AlertCircle, Shield } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { Toaster, toast } from 'react-hot-toast';
import { CreateGoalPage } from './pages/CreateGoalPage';
import { GoalsPage } from './pages/GoalsPage';
import { GoalDetailsPage } from './pages/GoalDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PaymentStatusPage } from './pages/PaymentStatusPage';
import { SupervisionPage } from './pages/SupervisionPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './config/api';
import { CONFIG } from './config/constants';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth(); // Use the re-exported useAuth
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [goalTitle, setGoalTitle] = React.useState('');
  const [configLoaded, setConfigLoaded] = useState(false);
  const hasFetchedConfig = useRef(false);

  useEffect(() => {
    const fetchConfig = async () => {
      if (hasFetchedConfig.current) return;
      hasFetchedConfig.current = true;

      try {
        const response = await api.config.get();
        if (response.ok && response.data) {
          CONFIG.GOAL_DEADLINE.min_goal_hours = response.data.min_goal_hours ?? CONFIG.GOAL_DEADLINE.min_goal_hours;
          CONFIG.GOAL_DEADLINE.max_goal_hours = response.data.max_goal_hours ?? CONFIG.GOAL_DEADLINE.max_goal_hours;
          CONFIG.GOAL_AMOUNT.min_goal_value = response.data.min_goal_value ?? CONFIG.GOAL_AMOUNT.min_goal_value;
          CONFIG.GOAL_AMOUNT.max_goal_value = response.data.max_goal_value ?? CONFIG.GOAL_AMOUNT.max_goal_value;
          CONFIG.OTP_TIMEOUT = response.data.otp_timeout ?? CONFIG.OTP_TIMEOUT;
          CONFIG.SUPERVISION_TIMEOUT_HOURS = response.data.supervision_timeout_hours ?? CONFIG.SUPERVISION_TIMEOUT_HOURS;
          setConfigLoaded(true);
        } else {
          toast.error(response.error || 'Failed to load config');
        }
      } catch (error) {
        toast.error('Error loading config');
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !isLoading && location.pathname !== '/') {
      setShowAuthModal(true);
      navigate(`/?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (isAuthenticated && redirect){
      setShowAuthModal(false);
      navigate(decodeURIComponent(redirect));
    }
  }, [isAuthenticated, navigate, location,searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigate('/create-goal', { state: { goalTitle } });
    }
  };

 const handleAuthSuccess = () => {
    console.log("this is handle auth success");
    setShowAuthModal(false);
    const redirect = searchParams.get('redirect');
    if (redirect){
      navigate(decodeURIComponent(redirect) || '/', { state: { goalTitle }});
    } else {
      navigate(goalTitle ? '/create-goal' : '/', { state: { goalTitle }});
    }
  };

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <Header onShowAuth={() => setShowAuthModal(true)} />
      <Toaster position="top-center" />
      
      <main className="pt-16">
        <AuthProvider> {/* Wrap the Routes with AuthProvider */}
          <Routes>
            <Route path="/create-goal" element={<ProtectedRoute element={<CreateGoalPage />} />} />
            <Route path="/goals" element={<ProtectedRoute element={<GoalsPage />} />} />
            <Route path="/goals/:id" element={<ProtectedRoute element={<GoalDetailsPage />} />} />
            <Route path="/supervisions/:id" element={<ProtectedRoute element={<SupervisionPage />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
            <Route path="/payment-status" element={<ProtectedRoute element={<PaymentStatusPage />} />} />
            <Route path="/" element={
              <div className="text-white">
                <AuthModal
                  isOpen={showAuthModal}
                  onClose={() => setShowAuthModal(false)}
                  onSuccess={handleAuthSuccess}
                  goalTitle={goalTitle}
                />
                
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2940"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pb-32">
                    <div className="text-center">
                      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-shadow">
                        همین الان انجامش بده
                        <span className="block text-red-500">یا به خیریه کمک کن</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
                        یک هدف تعیین کن. یک ناظر انتخاب کن. پول بذار روش. انجامش بده یا پولت به خیریه اهدا میشه.
                        به همین سادگی.
                      </p>
                      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <input
                            type="text"
                            value={goalTitle}
                            onChange={(e) => setGoalTitle(e.target.value)}
                            placeholder="هدف خود را وارد کنید"
                            className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                          />
                          <button
                            type="submit"
                            className="px-8 py-4 bg-red-500 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <ArrowLeft className="w-5 h-5" />
                            شروع کن
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

              {/* How It Works */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-4xl font-bold text-center mb-16">چطور کار می‌کند؟</h2>
                <div className="grid md:grid-cols-4 gap-12">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Target className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">هدف‌گذاری کن</h3>
                    <p className="text-gray-400">
                      مشخص کن چه چیزی می‌خوای و تا کی. دقیق و زمان‌بندی شده تعیینش کن.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">ناظر انتخاب کن</h3>
                    <p className="text-gray-400">
                      یک ناظر معتمد انتخاب کن که پیشرفتت رو تایید کنه. این تضمین می‌کنه که واقعاً به هدفت رسیدی.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">پول بذار روش</h3>
                    <p className="text-gray-400">
                      هر چقدر بیشتر ریسک کنی، انگیزه‌ت بیشتر میشه. اگر به هدفت نرسی، پولت به خیریه میره.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">تاثیر مثبت</h3>
                    <p className="text-gray-400">
                      به هدفت برس و پولت رو پس بگیر، یا با کمک به خیریه تاثیر مثبتی بذار.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-white/5 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <blockquote className="p-6 border border-white/10 rounded-lg">
                      <p className="text-lg mb-4">
                        "بالاخره بعد از ۲ سال تعلل، کتابم رو نوشتم. ناظرم هر هفته پیشرفتم رو چک می‌کرد و این باعث شد واقعاً متعهد بمونم."
                      </p>
                      <footer className="text-gray-400">- سارا ک.، نویسنده</footer>
                    </blockquote>
                    <blockquote className="p-6 border border-white/10 rounded-lg">
                      <p className="text-lg mb-4">
                        "تو ۶ ماه ۱۵ کیلو وزن کم کردم. مربی باشگاهم به عنوان ناظر انتخاب کردم و نتیجه فوق‌العاده بود."
                      </p>
                      <footer className="text-gray-400">- محمد ر.، برنامه‌نویس</footer>
                    </blockquote>
                    <blockquote className="p-6 border border-white/10 rounded-lg">
                      <p className="text-lg mb-4">
                        "ناظرم یک متخصص کسب و کار بود که هر مرحله رو با دقت بررسی می‌کرد. این باعث شد مطمئن باشم در مسیر درست حرکت می‌کنم."
                      </p>
                      <footer className="text-gray-400">- علی ط.، کارآفرین</footer>
                    </blockquote>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <div className="bg-red-500 rounded-2xl p-12">
                  <h2 className="text-4xl font-bold mb-6">آماده‌ای تعلل رو کنار بذاری؟</h2>
                  <p className="text-xl mb-8 max-w-2xl mx-auto">
                    به هزاران نفری بپیوند که با تعهد به هدفشون و نظارت یک فرد معتمد، یا موفق شدن یا به خیریه کمک کردن.
                  </p>
                  <button
                  onClick={handleSubmit} 
                  className="px-8 py-4 bg-black rounded-lg font-bold hover:bg-gray-900 transition-colors flex items-center gap-2 mx-auto">
                    {isAuthenticated ? 'ثبت هدف جدید' : 'همین حالا شروع کن'}
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <footer className="border-t border-white/10 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-gray-400">© ۲۰۲۵ همین الان انجامش بده. تمامی حقوق محفوظ است.</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>نتایج ممکن است متفاوت باشد. در صورت عدم موفقیت، پول شما به خیریه اهدا خواهد شد.</span>
                  </div>
                </div>
              </footer>
              </div>
            } />
        </Routes>
        </AuthProvider> {/* Correctly close AuthProvider */}
      </main>
    </div>
  );
}

export default App;
