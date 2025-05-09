import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Heart, DollarSign, AlertCircle, Shield } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { Toaster } from 'react-hot-toast';
import { CreateGoalPage } from './pages/CreateGoalPage';
import { GoalsPage } from './pages/GoalsPage';
import { GoalDetailsPage } from './pages/GoalDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PaymentStatusPage } from './pages/PaymentStatusPage';
import { useAuthContext } from './context/AuthContext';

function App() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [goalTitle, setGoalTitle] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigate('/create-goal', { state: { goalTitle } });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate('/create-goal', { state: { goalTitle } });
  };

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <Header onShowAuth={() => setShowAuthModal(true)} />
      <Toaster position="top-center" />
      
      <main className="pt-16">
        <Routes>
          <Route path="/create-goal" element={<CreateGoalPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/goals/:id" element={<GoalDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
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
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pb-32">
                  <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
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

              {/* Features Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/5">
                    <Target className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">هدف گذاری</h3>
                    <p className="text-gray-400">هدف خود را مشخص کنید و زمان مورد نظر برای رسیدن به آن را تعیین کنید.</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/5">
                    <Heart className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">انتخاب خیریه</h3>
                    <p className="text-gray-400">خیریه مورد نظر خود را از بین خیریه‌های معتبر انتخاب کنید.</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/5">
                    <DollarSign className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">تعیین مبلغ</h3>
                    <p className="text-gray-400">مبلغی که حاضرید برای رسیدن به هدفتان ریسک کنید را مشخص کنید.</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/5">
                    <Shield className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">انتخاب ناظر</h3>
                    <p className="text-gray-400">یک دوست یا آشنا را به عنوان ناظر انتخاب کنید تا پیشرفت شما را تایید کند.</p>
                  </div>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-4xl font-bold text-center mb-16">چطور کار می‌کند؟</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white font-bold mb-4">1</div>
                    <h3 className="text-xl font-bold mb-2">هدف و مبلغ را تعیین کنید</h3>
                    <p className="text-gray-400">هدف خود را مشخص کنید و مبلغی که حاضرید برای رسیدن به آن ریسک کنید را تعیین کنید.</p>
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white font-bold mb-4">2</div>
                    <h3 className="text-xl font-bold mb-2">ناظر و خیریه را انتخاب کنید</h3>
                    <p className="text-gray-400">یک ناظر قابل اعتماد و یک خیریه معتبر را برای همکاری انتخاب کنید.</p>
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white font-bold mb-4">3</div>
                    <h3 className="text-xl font-bold mb-2">شروع به تلاش کنید</h3>
                    <p className="text-gray-400">برای رسیدن به هدف خود تلاش کنید. در صورت موفقیت پول به شما برمی‌گردد، در غیر این صورت به خیریه اهدا می‌شود.</p>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                  <h2 className="text-4xl font-bold mb-8">همین حالا شروع کنید</h2>
                  <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                    با استفاده از این روش انگیزشی، به اهداف خود برسید و در عین حال به جامعه کمک کنید.
                  </p>
                  <button
                    onClick={() => !isAuthenticated && setShowAuthModal(true)}
                    className="px-8 py-4 bg-red-500 rounded-lg font-bold hover:bg-red-600 transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    {isAuthenticated ? 'ثبت هدف جدید' : 'ثبت نام و شروع'}
                  </button>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;