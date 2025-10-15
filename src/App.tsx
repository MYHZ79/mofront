import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Target, Heart, DollarSign, AlertCircle, Shield } from 'lucide-react';
import { SEO } from './components/SEO';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { Toaster, toast } from 'react-hot-toast';
import { CreateGoalPage } from './pages/CreateGoalPage';
import { GoalsPage } from './pages/GoalsPage';
import { GoalDetailsPage } from './pages/GoalDetailsPage';
import { CharitiesPage } from './pages/CharitiesPage';
import { ProfilePage } from './pages/ProfilePage';
import { PaymentStatusPage } from './pages/PaymentStatusPage';
import { SupervisionPage } from './pages/SupervisionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './config/api';
import { CONFIG } from './config/constants';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, checkAuth } = useAuth(); // Use the re-exported useAuth
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [goalTitle, setGoalTitle] = React.useState('');
  const [configLoaded, setConfigLoaded] = useState(false);
  const hasFetchedConfig = useRef(false);
  const [typingText, setTypingText] = useState('');
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const examples = [
    'ترک سیگار',
    'کاهش ۱۰ کیلو وزن',
    'خواندن ۵ کتاب',
    'ورزش روزانه',
    'یادگیری زبان انگلیسی',
    'شروع کسب و کار',
    'تمرین مدیتیشن',
    'نوشتن کتاب'
  ];

  useEffect(() => {
    const fetchConfig = async () => {
      if (hasFetchedConfig.current) return;
      hasFetchedConfig.current = true;

      try {
        const response = await api.config.get();
        if (response.ok && response.data) {
          CONFIG.GOAL_DEADLINE.min_goal_hours = response.data.min_goal_hours ?? CONFIG.GOAL_DEADLINE.min_goal_hours;
          CONFIG.GOAL_DEADLINE.max_goal_hours = response.data.max_goal_hours ?? CONFIG.GOAL_DEADLINE.max_goal_hours;
          CONFIG.GOAL_AMOUNT.min_goal_value = response.data.min_goal_value ? response.data.min_goal_value / 10 : CONFIG.GOAL_AMOUNT.min_goal_value;
          CONFIG.GOAL_AMOUNT.max_goal_value = response.data.max_goal_value ? response.data.max_goal_value / 10 : CONFIG.GOAL_AMOUNT.max_goal_value;
          CONFIG.OTP_TIMEOUT = response.data.otp_timeout ?? CONFIG.OTP_TIMEOUT;
          CONFIG.SUPERVISION_TIMEOUT_HOURS = response.data.supervision_timeout_hours ?? CONFIG.SUPERVISION_TIMEOUT_HOURS;
          CONFIG.GOAL_CREATION_FEE = response.data.goal_creation_fee ? response.data.goal_creation_fee / 10 : CONFIG.GOAL_CREATION_FEE;
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

  // Typing animation effect
  useEffect(() => {
    const currentExample = examples[currentExampleIndex];
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      if (typingText.length < currentExample.length) {
        timeoutId = setTimeout(() => {
          setTypingText(currentExample.slice(0, typingText.length + 1));
        }, 100 + Math.random() * 100); // Random typing speed for natural feel
      } else {
        // Finished typing, wait then start erasing
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (typingText.length > 0) {
        timeoutId = setTimeout(() => {
          setTypingText(typingText.slice(0, -1));
        }, 50);
      } else {
        // Finished erasing, move to next example
        setCurrentExampleIndex((prev) => (prev + 1) % examples.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [typingText, currentExampleIndex, isTyping, examples]);
  useEffect(() => {
    // Show the modal if not authenticated, not loading, and on the home page,
    // or if redirected to home page from a protected route.
    // The modal is only rendered on the '/' route.
    if (!isAuthenticated && !isLoading && location.pathname === '/' && !showAuthModal) {
      // Check if there's a redirect parameter, indicating a protected route access attempt
      const redirect = searchParams.get('redirect');
      if (redirect) {
        setShowAuthModal(true);
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, showAuthModal, searchParams]);

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

  const handleAuthSuccess = React.useCallback(() => {
    setShowAuthModal(false);
    const redirect = searchParams.get('redirect');
    if (redirect){
      navigate(decodeURIComponent(redirect));
    } else if (goalTitle) {
      navigate('/create-goal', { state: { goalTitle } });
    } else {
      navigate('/');
    }
  }, [isAuthenticated, navigate, searchParams, goalTitle, setShowAuthModal]);

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <main className="pt-16">
        <AuthProvider> {/* Wrap the Routes with AuthProvider */}
          <CharitiesProvider> {/* Wrap the Routes with CharitiesProvider */}
            <Header onShowAuth={() => setShowAuthModal(true)} />
            <Toaster position="top-center" />
            <Routes>
              <Route path="/create-goal" element={<ProtectedRoute element={<CreateGoalPage configLoaded={configLoaded} />} />} />
              <Route path="/goals" element={<ProtectedRoute element={<GoalsPage />} />} />
              <Route path="/goals/:id" element={<ProtectedRoute element={<GoalDetailsPage />} />} />
              <Route path="/charities" element={<CharitiesPage />} />
              <Route path="/supervisions/:id" element={<ProtectedRoute element={<SupervisionPage />} />} />
              <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
              <Route path="/payment-status" element={<ProtectedRoute element={<PaymentStatusPage />} />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/" element={
                <div className="text-white">
                  <SEO
                    title="موتیو - به اهدافت برس"
                    description="یک هدف تعیین کن. یک ناظر انتخاب کن. پول بذار روش. انجامش بده یا پولت به خیریه اهدا میشه."
                  />
                  <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                    goalTitle={goalTitle}
                  />
                  
                  {/* Hero Section */}
                  <div className="relative overflow-hidden">
                    <img
                      src="/images/hero-background.jpg"
                      alt="Background"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pb-32">
                      <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-shadow">
                          انجامش بده
                          <span className="block text-red-500">یا پولت رو از دست بده</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
                          یک هدف تعیین کن. یک ناظر انتخاب کن. تعهد مالی بده. <br />به هدفت برس و پولت رو پس بگیر <span className="text-red-500">یا</span> پولت به خیریه اهدا میشه.
                          
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
                  <h2 className="text-4xl font-bold text-center mb-16">موتیو (Motiv) چطور کار می‌کنه؟</h2>
                  <div className="grid md:grid-cols-3 gap-12">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
                        <Target className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-4">هدف‌گذاری</h3>
                      <p className="text-gray-400">
                        هدفت رو تعیین کن و موعد رسیدن بهش رو مشخص کن. انتخاب هدف محدودیتی نداره و میتونه هرچیزی باشه.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-4">انتخاب ناظر</h3>
                      <p className="text-gray-400">
                         یک ناظر معتمد انتخاب کن که پیشرفتت در هدف  رو بررسی کنه. ناظر تایید می‌کنه که آیا واقعاً به هدفت رسیدی یا نه؟
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold mb-4">تهعد مالی</h3>
                      <p className="text-gray-400">
تعهد بده که به هدفت میرسی. اگر به هدفت برسی پولت رو پس میگیری. در غیر اینصورت پولت به خیریه اهدا میشه.
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
                      به هزاران نفری بپیوندید که زندگی خودشون رو متحول کردند!                  </p>
                    <button
                    onClick={handleSubmit} 
                    className="px-8 py-4 bg-black rounded-lg font-bold hover:bg-gray-900 transition-colors flex items-center gap-2 mx-auto">
                      {isAuthenticated ? 'ثبت هدف جدید' : 'همین حالا شروع کن'}
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                </div>
              } />
            </Routes>
          </CharitiesProvider> {/* Correctly close CharitiesProvider */}
        </AuthProvider> {/* Correctly close AuthProvider */}
        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">تمامی حقوق برای موتیو محفوظ است.</p>
            {/* <div className="flex items-center gap-2 text-sm text-gray-400">
              <AlertCircle className="w-4 h-4" />
              <span>نتایج ممکن است متفاوت باشد. در صورت عدم موفقیت، پول شما به خیریه اهدا خواهد شد.</span>
            </div> */}
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
