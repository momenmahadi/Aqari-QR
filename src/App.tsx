import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, Timestamp, orderBy, limit, getDocFromServer, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, OperationType, handleFirestoreError, testConnection } from './firebase';
import { Property, Lead, CustomUser, UserProfile } from './types';
import { cn, formatCurrency, formatDate } from './lib/utils';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  QrCode, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronRight, 
  LogOut, 
  LogIn, 
  LayoutDashboard,
  ExternalLink,
  Phone,
  Key,
  User as UserIcon,
  CheckCircle2,
  X,
  Search,
  Image as ImageIcon,
  ArrowLeft,
  Share2,
  Download,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

// --- Translations ---

const translations = {
  en: {
    heroTitle: 'Connect Properties to QR Codes Instantly',
    heroSubtitle: 'The modern way for real estate agents to showcase properties and collect leads. No apps required, just scan and view.',
    getStarted: 'Get Started Free',
    howItWorks: 'How it works',
    step1Title: 'Add Property',
    step1Desc: 'Upload photos and details of your property listing in seconds.',
    step2Title: 'Generate QR',
    step2Desc: 'Get a unique QR code to place on your property signage or brochures.',
    step3Title: 'Collect Leads',
    step3Desc: 'Receive instant notifications when potential buyers scan and show interest.',
    rooms: 'Rooms',
    baths: 'Baths',
    sqm: 'Sqm',
    description: 'Description',
    interested: 'Interested in this property?',
    leaveDetails: "Leave your details and we'll get back to you.",
    namePlaceholder: 'Your Name (Optional)',
    phonePlaceholder: 'Phone Number *',
    submitInterest: 'I am Interested / Contact Me',
    thankYou: 'Thank You!',
    receivedInterest: "We've received your interest. Our agent will contact you shortly.",
    whatsappUs: 'WhatsApp Us',
    dashboard: 'Dashboard',
    logout: 'Logout',
    login: 'Login',
    loginTitle: 'Agent Login',
    loginSubtitle: 'Enter your details to manage your properties.',
    loginName: 'Full Name',
    loginPhone: 'Phone Number',
    loginSubmit: 'Sign In',
    signup: 'Create Account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    email: 'Email / Username',
    password: 'Password',
    loginError: 'Invalid email or password',
    signupError: 'Error creating account. Please try again.',
    welcomeBack: 'Welcome Back',
    agentName: 'Your Full Name',
    agentPhone: 'Your Phone Number',
    myProperties: 'My Properties',
    manageListings: 'Manage your listings and view leads.',
    addProperty: 'Add Property',
    noProperties: 'No properties yet',
    startAdding: 'Start by adding your first property listing.',
    scans: 'Scans',
    viewPage: 'View Page',
    edit: 'Edit',
    delete: 'Delete',
    viewLeads: 'View Leads',
    backToDashboard: 'Back to Dashboard',
    propertyQr: 'Property QR Code',
    printQr: 'Print this QR code and place it on your property signage.',
    downloadPng: 'Download PNG',
    downloadQrCode: 'Download QR Code',
    copyLink: 'Copy Link',
    totalLeads: 'Total Leads',
    noLeads: 'No leads collected yet. Share your QR code!',
    anonymous: 'Anonymous',
    editProperty: 'Edit Property',
    addNewProperty: 'Add New Property',
    propertyTitle: 'Property Title',
    price: 'Price (SAR)',
    location: 'Location',
    roomsLabel: 'Rooms',
    bathsLabel: 'Bathrooms',
    areaLabel: 'Area (sqm)',
    descriptionLabel: 'Description',
    images: 'Property Images',
    uploadImages: 'Upload Images',
    unsupportedImage: 'One or more files are unsupported or too large.',
    save: 'Save',
    saving: 'Saving...',
    createProperty: 'Create Property',
    updateProperty: 'Update Property',
    featuredProperties: 'Featured Properties',
    viewAll: 'View All',
    quickAdd: 'Quick Add',
    newListing: 'New Listing',
    seedData: 'Seed Sample Data',
    seeding: 'Seeding...',
    typeLabel: 'Property Type',
    statusLabel: 'Status',
    sale: 'For Sale',
    rent: 'For Rent',
    apartment: 'Apartment',
    villa: 'Villa',
    office: 'Office',
    land: 'Land',
    other: 'Other',
    amenitiesLabel: 'Amenities',
    pool: 'Pool',
    gym: 'Gym',
    parking: 'Parking',
    security: 'Security',
    garden: 'Garden',
    ac: 'Air Conditioning',
    wifi: 'High-speed WiFi',
    furnished: 'Fully Furnished',
    previewQr: 'QR Preview',
    imagePreview: 'Image Preview',
    share: 'Share Property',
    copied: 'Link Copied!',
    previewOnly: 'Preview Only',
    qrWillWorkAfterSave: 'QR code will link to your property page once created.',
    searchPlaceholder: 'Search properties by title or location...',
    noSearchResults: 'No properties found matching your search.',
    backToHome: 'Back to Home',
    profile: 'Profile',
    personalProfile: 'Personal Profile',
    editProfile: 'Edit Profile',
    profilePhoto: 'Profile Photo',
    displayName: 'Display Name',
    saveProfile: 'Save Profile',
    profileUpdated: 'Profile updated successfully',
    upgradeTitle: 'Upgrade to Premium',
    upgradeSubtitle: 'Get unlimited properties, professional analytics, and custom branding.',
    payNow: 'Pay Now',
    getMoreFeatures: 'Get More Features',
  },
  ar: {
    heroTitle: 'اربط عقاراتك برموز QR فوراً',
    heroSubtitle: 'الطريقة الحديثة لوكلاء العقارات لعرض العقارات وجمع العملاء المحتملين. لا حاجة لتطبيقات، فقط امسح وشاهد.',
    getStarted: 'ابدأ مجاناً',
    howItWorks: 'كيف يعمل؟',
    upgradeTitle: 'الترقية للعضوية المميزة',
    upgradeSubtitle: 'احصل على عقارات غير محدودة، تحليلات احترافية، وتمييز لعلامتك التجارية.',
    payNow: 'ادفع الآن',
    getMoreFeatures: 'احصل على المزيد من المميزات',
    step1Title: 'أضف عقاراً',
    step1Desc: 'ارفع الصور وتفاصيل عقارك في ثوانٍ.',
    step2Title: 'أنشئ رمز QR',
    step2Desc: 'احصل على رمز QR فريد لوضعه على لوحات العقار أو الكتيبات.',
    step3Title: 'اجمع العملاء',
    step3Desc: 'تلقى إشعارات فورية عندما يمسح المشترون المحتملون الرمز ويبدون اهتمامهم.',
    rooms: 'غرف',
    baths: 'حمامات',
    sqm: 'متر مربع',
    description: 'الوصف',
    interested: 'مهتم بهذا العقار؟',
    leaveDetails: 'اترك تفاصيلك وسنتواصل معك.',
    namePlaceholder: 'الاسم (اختياري)',
    phonePlaceholder: 'رقم الهاتف *',
    submitInterest: 'أنا مهتم / تواصل معي',
    thankYou: 'شكراً لك!',
    receivedInterest: 'لقد استلمنا اهتمامك. سيتواصل معك وكيلنا قريباً.',
    whatsappUs: 'تواصل عبر واتساب',
    dashboard: 'لوحة التحكم',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    loginTitle: 'دخول الوكيل',
    loginSubtitle: 'أدخل تفاصيلك لإدارة عقاراتك.',
    loginName: 'الاسم الكامل',
    loginPhone: 'رقم الهاتف',
    loginSubmit: 'دخول',
    signup: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    email: 'البريد الإلكتروني / اسم المستخدم',
    password: 'كلمة المرور',
    loginError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    signupError: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.',
    welcomeBack: 'مرحباً بعودتك',
    agentName: 'اسمك الكامل',
    agentPhone: 'رقم هاتفك',
    myProperties: 'عقاراتي',
    manageListings: 'إدارة قوائمك وعرض العملاء المحتملين.',
    addProperty: 'إضافة عقار',
    noProperties: 'لا توجد عقارات بعد',
    startAdding: 'ابدأ بإضافة أول قائمة عقارات لك.',
    scans: 'مسحات',
    viewPage: 'عرض الصفحة',
    edit: 'تعديل',
    delete: 'حذف',
    viewLeads: 'عرض العملاء',
    backToDashboard: 'العودة للوحة التحكم',
    propertyQr: 'رمز QR للعقار',
    printQr: 'اطبع هذا الرمز وضعه على لوحة العقار.',
    downloadPng: 'تحميل PNG',
    downloadQrCode: 'تحميل رمز QR',
    copyLink: 'نسخ الرابط',
    totalLeads: 'إجمالي العملاء',
    noLeads: 'لم يتم جمع عملاء بعد. شارك رمز QR الخاص بك!',
    anonymous: 'مجهول',
    editProperty: 'تعديل العقار',
    addNewProperty: 'إضافة عقار جديد',
    propertyTitle: 'عنوان العقار',
    price: 'السعر (ر.س)',
    location: 'الموقع',
    roomsLabel: 'الغرف',
    bathsLabel: 'الحمامات',
    areaLabel: 'المساحة (متر مربع)',
    descriptionLabel: 'الوصف',
    images: 'صور العقار',
    uploadImages: 'رفع الصور',
    unsupportedImage: 'ملف واحد أو أكثر غير مدعوم أو حجمه كبير جداً.',
    save: 'حفظ',
    saving: 'جاري الحفظ...',
    createProperty: 'إنشاء العقار',
    updateProperty: 'تحديث العقار',
    featuredProperties: 'عقارات مميزة',
    viewAll: 'عرض الكل',
    quickAdd: 'إضافة سريعة',
    newListing: 'قائمة جديدة',
    seedData: 'إضافة بيانات تجريبية',
    seeding: 'جاري الإضافة...',
    typeLabel: 'نوع العقار',
    statusLabel: 'الحالة',
    sale: 'للبيع',
    rent: 'للإيجار',
    apartment: 'شقة',
    villa: 'فيلا',
    office: 'مكتب',
    land: 'أرض',
    other: 'أخرى',
    amenitiesLabel: 'المميزات',
    pool: 'مسبح',
    gym: 'نادي رياضي',
    parking: 'موقف سيارات',
    security: 'أمن',
    garden: 'حديقة',
    ac: 'تكييف',
    wifi: 'إنترنت سريع',
    furnished: 'مفروش بالكامل',
    previewQr: 'معاينة QR',
    imagePreview: 'معاينة الصورة',
    share: 'مشاركة العقار',
    copied: 'تم نسخ الرابط!',
    previewOnly: 'معاينة فقط',
    qrWillWorkAfterSave: 'سيعمل رمز QR بعد حفظ العقار.',
    searchPlaceholder: 'ابحث عن العقارات بالعنوان أو الموقع...',
    noSearchResults: 'لم يتم العثور على عقارات تطابق بحثك.',
    backToHome: 'العودة للرئيسية',
    profile: 'الملف الشخصي',
    personalProfile: 'الملف الشخصي',
    editProfile: 'تعديل الملف الشخصي',
    profilePhoto: 'الصورة الشخصية',
    displayName: 'الاسم المعروض',
    saveProfile: 'حفظ الملف الشخصي',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
  }
};

// --- Components ---


const QuickAddModal = ({ user, lang, isOpen, onClose }: { user: any, lang: 'en' | 'ar', isOpen: boolean, onClose: () => void }) => {
  const t = translations[lang];
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    type: 'apartment',
    status: 'sale',
    images: [] as string[]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const data = {
      title: formData.title,
      price: parseFloat(formData.price),
      location: formData.location,
      type: formData.type,
      status: formData.status,
      rooms: 0,
      bathrooms: 0,
      area: 0,
      description: '',
      amenities: [],
      images: formData.images,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      visits: 0
    };

    try {
      const docRef = await addDoc(collection(db, 'properties'), data);
      onClose();
      navigate(`/admin/leads/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'properties');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t.quickAdd}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t.propertyTitle}</label>
            <input 
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Modern Apartment"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t.price}</label>
              <input 
                required
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Price"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t.typeLabel}</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="apartment">{t.apartment}</option>
                <option value="villa">{t.villa}</option>
                <option value="office">{t.office}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t.location}</label>
            <input 
              required
              type="text"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="City, Area"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t.images}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                <Plus className="w-5 h-5 text-gray-400" />
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>
          </div>

          <button 
            disabled={saving}
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 mt-2"
          >
            {saving ? t.saving : t.createProperty}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AuthPage = ({ lang }: { lang: 'en' | 'ar' }) => {
  const t = translations[lang];
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        if (displayName) {
          await updateProfile(user, { displayName });
          
          try {
            // Store user profile in Firestore
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              displayName: displayName,
              role: 'user',
              email: email,
              createdAt: serverTimestamp()
            });
          } catch (profileErr) {
            console.error('Profile creation error:', profileErr);
            // Even if profile doc fails, user is created in Auth
          }
        }
        
        navigate('/admin');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/admin');
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError(lang === 'en' 
          ? 'Email/Password authentication is not enabled in your Firebase Console. Please enable it in Authentication > Sign-in method.' 
          : 'تسجيل الدخول بالبريد وكلمة المرور غير مفعل في إعدادات Firebase الخاصة بك. يرجى تفعيله في Authentication > Sign-in method.');
      } else if (err.code === 'auth/invalid-credential') {
        setError(lang === 'en'
          ? 'Invalid credentials or authentication provider not enabled. If using Google Login, ensure it is enabled in your Firebase Console and this domain is added to authorized domains.'
          : 'بيانات اعتماد غير صالحة أو أن موفر الخدمة غير مفعل. إذا كنت تستخدم جوجل، تأكد من تفعيله في Firebase وإضافة هذا الدومين للمواقع المعتمدة.');
      } else {
        setError(err.message || (isSignUp ? t.signupError : t.loginError));
      }
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create profile if it doesn't exist
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          role: 'user',
          email: user.email,
          createdAt: serverTimestamp()
        });
      }
      
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12 group">
            <div className="bg-white p-2 rounded-xl">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Aqari QR</span>
          </Link>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-bold leading-[1.1] tracking-tight mb-8">
              {isSignUp ? (lang === 'en' ? 'Create Account' : 'إنشاء حساب') : t.welcomeBack}
            </h1>
            <p className="text-xl text-emerald-100 max-w-md leading-relaxed">
              {t.heroSubtitle}
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/agent${i}/100/100`}
                  className="w-12 h-12 rounded-full border-2 border-emerald-600 object-cover"
                  alt="Agent"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Join 500+ Top Agents
              </p>
              <p className="text-xs text-emerald-100">
                Managing 2,000+ properties daily
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px] -mr-64 -mt-64 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-700 rounded-full blur-[100px] -ml-32 -mb-32 opacity-50" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-gray-50/50 relative">
        <Link 
          to="/" 
          className="absolute top-8 left-8 lg:left-12 flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {t.backToHome}
        </Link>

        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">Aqari QR</span>
            </Link>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? t.signup : t.loginSubmit}
            </h2>
            <p className="text-gray-500 mb-8">{t.loginSubtitle}</p>

            <form onSubmit={handleAuth} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 italic">
                  {error}
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    {t.loginName}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                      placeholder={t.agentName}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  {t.email}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold ml-1">@</div>
                  <input 
                    type="email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Key className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="password"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-[60px] bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 mt-4 flex items-center justify-center p-0"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  isSignUp ? t.signup : t.loginSubmit
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{lang === 'en' ? 'Or' : 'أو'}</span>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-[60px] bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm mt-6 flex items-center justify-center gap-3 active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              {lang === 'en' ? 'Continue with Google' : 'الاستمرار باستخدام جوجل'}
            </button>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 mb-2">
                {isSignUp ? t.hasAccount : t.noAccount}
              </p>
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-emerald-700 font-bold hover:underline"
              >
                {isSignUp ? t.loginSubmit : t.signup}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ user, lang, setLang }: { user: any | null, lang: 'en' | 'ar', setLang: (l: 'en' | 'ar') => void }) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const t = translations[lang];
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  const onLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Aqari QR</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            {user ? (
              <>
                <button 
                  onClick={() => setIsQuickAddOpen(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-100 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {t.newListing}
                </button>
                <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.dashboard}</span>
                </Link>
                <Link to="/profile" className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=10b981&color=fff`} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                  />
                </Link>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </>
            ) : (
              <Link 
                to="/auth"
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                {t.login}
              </Link>
            )}
          </div>
        </div>
      </div>
      {user && (
        <QuickAddModal 
          user={user} 
          lang={lang} 
          isOpen={isQuickAddOpen} 
          onClose={() => setIsQuickAddOpen(false)} 
        />
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-100 py-12">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Building2 className="w-6 h-6 text-emerald-600" />
        <span className="text-lg font-bold text-gray-900">Aqari QR</span>
      </div>
      <p className="text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Aqari QR Platform. All rights reserved.
      </p>
    </div>
  </footer>
);

// --- Pages ---

const Home = ({ lang, user }: { lang: 'en' | 'ar', user: any | null }) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
                {t.heroTitle.split('QR Codes').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="text-emerald-600">QR Codes</span>}
                  </React.Fragment>
                ))}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10" id="hero-subtitle">
                {t.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to={user ? "/admin/new" : "/admin"} 
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  {user ? <Plus className="w-5 h-5" /> : null}
                  {user ? t.addProperty : t.getStarted}
                </Link>
                <a 
                  href="#how-it-works" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all font-sans"
                >
                  {t.howItWorks}
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Upgrade/Pay Now Section */}
        <section className="pb-24 pt-4 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-emerald-950 rounded-[3rem] p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-emerald-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-20 -mr-32 -mt-32 group-hover:opacity-30 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-20 -ml-32 -mb-32 group-hover:opacity-30 transition-opacity"></div>
              
              <div className="text-center lg:text-left space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-800/50 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <CreditCard className="w-3.5 h-3.5" />
                  {t.getMoreFeatures}
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                  {t.upgradeTitle}
                </h2>
                <p className="text-emerald-100/80 text-xl max-w-xl font-medium">
                  {t.upgradeSubtitle}
                </p>
              </div>

              <div className="relative z-10 w-full lg:w-72">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] text-center shadow-xl">
                  <div className="flex items-center justify-center gap-1 text-white mb-6">
                    <span className="text-4xl font-black">$49</span>
                    <span className="text-emerald-400/60 font-bold">/lifetime</span>
                  </div>
                  <a 
                    href="https://whop.com/checkout/plan_qzmUob2BqKR6U" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-5 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-900/50 active:scale-95"
                  >
                    {t.payNow}
                  </a>
                  <p className="mt-4 text-emerald-400/40 text-xs font-bold uppercase tracking-tighter">Secure Payment Process</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.howItWorks}</h2>
              <div className="w-20 h-1.5 bg-emerald-600 mx-auto rounded-full" />
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Plus className="w-8 h-8 text-emerald-600" />,
                  title: t.step1Title,
                  desc: t.step1Desc
                },
                {
                  icon: <QrCode className="w-8 h-8 text-emerald-600" />,
                  title: t.step2Title,
                  desc: t.step2Desc
                },
                {
                  icon: <Users className="w-8 h-8 text-emerald-600" />,
                  title: t.step3Title,
                  desc: t.step3Desc
                }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const AdminDashboard = ({ user, lang }: { user: any, lang: 'en' | 'ar' }) => {
  const t = translations[lang];
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'properties'), 
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const props = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(props);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
    });

    return () => unsubscribe();
  }, [user.uid]);

  const filteredProperties = properties.filter(prop => 
    prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteDoc(doc(db, 'properties', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `properties/${id}`);
    }
  };

  const seedSampleData = async () => {
    setSeeding(true);
    const samples = [
      {
        title: 'Modern Penthouse with City View',
        price: 1250000,
        location: 'Downtown, Dubai',
        rooms: 3,
        bathrooms: 3,
        area: 280,
        description: 'Luxury penthouse featuring floor-to-ceiling windows, a private terrace, and premium finishes throughout.',
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000'],
        ownerId: user.uid,
        type: 'apartment',
        status: 'sale',
        amenities: ['pool', 'gym', 'parking', 'security'],
        createdAt: serverTimestamp(),
        visits: 0
      },
      {
        title: 'Cozy Beachfront Villa',
        price: 850000,
        location: 'Palm Jumeirah, Dubai',
        rooms: 4,
        bathrooms: 4,
        area: 350,
        description: 'Beautiful villa with direct beach access, private pool, and landscaped gardens.',
        images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1000'],
        ownerId: user.uid,
        type: 'villa',
        status: 'sale',
        amenities: ['pool', 'garden', 'parking', 'ac'],
        createdAt: serverTimestamp(),
        visits: 0
      }
    ];

    try {
      for (const sample of samples) {
        await addDoc(collection(db, 'properties'), sample);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'properties');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.myProperties}</h1>
          <p className="text-gray-500 mt-1">{t.manageListings}</p>
        </div>
        <div className="flex gap-3">
          {properties.length === 0 && !loading && (
            <button 
              onClick={seedSampleData}
              disabled={seeding}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              {seeding ? t.seeding : t.seedData}
            </button>
          )}
          <Link 
            to="/admin/new" 
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <Plus className="w-5 h-5" />
            {t.addProperty}
          </Link>
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-100 border border-emerald-500/20">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{t.upgradeTitle}</h2>
              <p className="text-emerald-50 text-sm opacity-80">{t.upgradeSubtitle}</p>
            </div>
          </div>
          <a 
            href="https://whop.com/checkout/plan_qzmUob2BqKR6U" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg shrink-0 whitespace-nowrap"
          >
            {t.payNow}
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none shadow-sm"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">{searchTerm ? t.noSearchResults : t.noProperties}</h3>
          <p className="text-gray-500 mb-8">{searchTerm ? '' : t.startAdding}</p>
          {!searchTerm && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/admin/new" 
                className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                {t.addProperty}
              </Link>
              <button 
                onClick={seedSampleData}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {seeding ? t.seeding : t.seedData}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((prop) => (
            <motion.div 
              key={prop.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000'} 
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-emerald-700">
                  {formatCurrency(prop.price)}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{prop.title}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="line-clamp-1">{prop.location}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Users className="w-3 h-3" />
                    {prop.visits || 0} {t.scans}
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      to={`/admin/leads/${prop.id}`}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                      title={t.viewLeads}
                    >
                      <Users className="w-5 h-5" />
                    </Link>
                    <Link 
                      to={`/admin/edit/${prop.id}`}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                      title={t.edit}
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(prop.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <Link 
                    to={`/p/${prop.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                  >
                    {t.viewPage}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const PropertyForm = ({ user, lang, isEdit = false }: { user: any, lang: 'en' | 'ar', isEdit?: boolean }) => {
  const t = translations[lang];
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    rooms: '',
    bathrooms: '',
    area: '',
    description: '',
    type: 'apartment',
    status: 'sale',
    amenities: [] as string[],
    images: ['']
  });

  const amenitiesList = ['pool', 'gym', 'parking', 'security', 'garden', 'ac', 'wifi', 'furnished'];

  useEffect(() => {
    if (isEdit && id) {
      const fetchProp = async () => {
        try {
          const docRef = doc(db, 'properties', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              title: data.title,
              price: data.price.toString(),
              location: data.location,
              rooms: data.rooms?.toString() || '',
              bathrooms: data.bathrooms?.toString() || '',
              area: data.area?.toString() || '',
              description: data.description || '',
              type: data.type || 'apartment',
              status: data.status || 'sale',
              amenities: data.amenities || [],
              images: data.images?.length > 0 ? data.images : ['']
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `properties/${id}`);
        } finally {
          setLoading(false);
        }
      };
      fetchProp();
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      rooms: parseInt(formData.rooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      area: parseFloat(formData.area) || 0,
      images: formData.images.filter(img => img.trim() !== ''),
      ownerId: user.uid,
      createdAt: isEdit ? undefined : serverTimestamp()
    };

    try {
      if (isEdit && id) {
        await updateDoc(doc(db, 'properties', id), data);
      } else {
        await addDoc(collection(db, 'properties'), data);
      }
      navigate('/admin');
    } catch (error) {
      handleFirestoreError(error, isEdit ? OperationType.UPDATE : OperationType.CREATE, 'properties');
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (loading) return <div className="max-w-3xl mx-auto py-20 text-center">Loading...</div>;

  const appUrl = window.location.origin;
  const propertyUrl = isEdit && id ? `${appUrl}/p/${id}` : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backToDashboard}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 lg:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {isEdit ? t.editProperty : t.addNewProperty}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.propertyTitle}</label>
                  <input 
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    placeholder="Modern Villa with Pool"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.typeLabel}</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="apartment">{t.apartment}</option>
                    <option value="villa">{t.villa}</option>
                    <option value="office">{t.office}</option>
                    <option value="land">{t.land}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.statusLabel}</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="sale">{t.sale}</option>
                    <option value="rent">{t.rent}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.price}</label>
                  <input 
                    required
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.location}</label>
                  <input 
                    required
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    placeholder="Downtown, Dubai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.roomsLabel}</label>
                  <input 
                    type="number"
                    value={formData.rooms}
                    onChange={e => setFormData({ ...formData, rooms: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.bathsLabel}</label>
                  <input 
                    type="number"
                    value={formData.bathrooms}
                    onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.areaLabel}</label>
                  <input 
                    type="number"
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    placeholder="250"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">{t.amenitiesLabel}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {amenitiesList.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                        formData.amenities.includes(amenity)
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                          : "bg-white border-gray-200 text-gray-600 hover:border-emerald-200"
                      )}
                    >
                      {t[amenity as keyof typeof t] || amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.descriptionLabel}</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none"
                  placeholder="Describe the property features..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">{t.images}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.images.filter(img => img.trim() !== '').map((img, i) => (
                    <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 group">
                      <img src={img} className="w-full h-full object-cover" alt="Property" />
                      <button 
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, idx) => idx !== i);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                    <div className="bg-emerald-100 p-2 rounded-xl group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{t.uploadImages}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files) return;
                        Array.from(files).forEach((file: File) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({
                              ...prev,
                              images: [...prev.images.filter(img => img.trim() !== ''), reader.result as string]
                            }));
                          };
                          reader.readAsDataURL(file);
                        });
                      }} 
                    />
                  </label>
                </div>
              </div>

              <button 
                disabled={saving}
                type="submit"
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                {saving ? t.saving : isEdit ? t.updateProperty : t.createProperty}
              </button>
            </form>
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t.imagePreview}</h3>
            <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-8">
              {formData.images[0] ? (
                <img 
                  src={formData.images[0]} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000')}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t.previewQr}</h3>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {t.previewOnly}
              </span>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl z-10">
                <span className="text-xs font-bold text-gray-900 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100">
                  {t.previewOnly}
                </span>
              </div>
              <QRCodeSVG 
                value={propertyUrl || formData.title || 'Property Preview'} 
                size={150}
                level="H"
                includeMargin
                className={!propertyUrl ? "opacity-50" : ""}
              />
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              {t.qrWillWorkAfterSave}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadList = ({ user, lang }: { user: any, lang: 'en' | 'ar' }) => {
  const t = translations[lang];
  const { id } = useParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !user) return;

    const fetchProp = async () => {
      const docSnap = await getDoc(doc(db, 'properties', id));
      if (docSnap.exists()) {
        setProperty({ id: docSnap.id, ...docSnap.data() } as Property);
      }
    };
    fetchProp();

    const q = query(
      collection(db, 'leads'),
      where('propertyId', '==', id),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });

    return () => unsubscribe();
  }, [id, user]);

  const appUrl = window.location.origin;
  const propertyUrl = `${appUrl}/p/${id}`;

  const downloadQR = () => {
    const svg = document.getElementById('property-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `property-qr-${id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backToDashboard}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* QR Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t.propertyQr}</h3>
            <div className="bg-gray-50 p-6 rounded-2xl mb-6 inline-block">
              <QRCodeSVG 
                id="property-qr"
                value={propertyUrl} 
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {t.printQr}
            </p>
            <div className="space-y-3">
              <button 
                onClick={downloadQR}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
              >
                <Download className="w-4 h-4" />
                {t.downloadQrCode}
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(propertyUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    {t.copyLink}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Leads Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 lg:p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t.viewLeads} {property?.title}</h2>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                {leads.length} {t.totalLeads}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t.noLeads}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        <UserIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{lead.name || t.anonymous}</h4>
                        <p className="text-sm text-gray-500">{formatDate(lead.createdAt)}</p>
                      </div>
                    </div>
                    <a 
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 font-bold rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      {lead.phone}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyLanding = ({ lang }: { lang: 'en' | 'ar' }) => {
  const t = translations[lang];
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', phone: '' });
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: property?.title || 'Aqari Property',
      text: property?.description || 'Check out this property!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying:', err);
      }
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchProp = async () => {
      try {
        console.log('Fetching property:', id);
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
        console.log('Doc exists:', docSnap.exists());
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProperty({ id: docSnap.id, ...data } as Property);
          
          // Increment visits (non-blocking)
          updateDoc(docRef, {
            visits: (data.visits || 0) + 1
          }).catch(err => console.warn('Failed to increment visits:', err));
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProp();
  }, [id]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'leads'), {
        propertyId: id,
        ownerId: property?.ownerId,
        name: leadData.name,
        phone: leadData.phone,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!property) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <Building2 className="w-20 h-20 text-gray-300 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Not Found</h1>
      <p className="text-gray-500 mb-8">The property listing you are looking for might have been removed.</p>
      <Link to="/" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl">Go Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Image Gallery */}
      <div className="relative h-[50vh] lg:h-[70vh] w-full overflow-hidden">
        <div className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
          {(property.images?.length > 0 ? property.images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000']).map((img, i) => (
            <div key={i} className="min-w-full h-full snap-center">
              <img 
                src={img} 
                alt={`${property.title} - ${i + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold">
          {property.images?.length || 1} Photos
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span className="text-lg">{property.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2"
                title={t.share}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-600">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-bold">{t.share}</span>
                  </>
                )}
              </button>
              <div className="bg-emerald-50 px-6 py-3 rounded-2xl">
                <span className="text-3xl font-black text-emerald-700">{formatCurrency(property.price)}</span>
              </div>
            </div>
          </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
            {t[property.type as keyof typeof t] || property.type}
          </div>
          <div className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
            {t[property.status as keyof typeof t] || property.status}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-50 p-4 rounded-2xl text-center">
            <Bed className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{property.rooms}</div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t.rooms}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl text-center">
            <Bath className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{property.bathrooms}</div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t.baths}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl text-center">
            <Maximize2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{property.area}</div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t.sqm}</div>
          </div>
        </div>

        <div className="prose prose-emerald max-w-none mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t.description}</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {property.description || 'No description provided for this property.'}
          </p>
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t.amenitiesLabel}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {property.amenities.map(amenity => (
                <div key={amenity} className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-gray-700">
                    {t[amenity as keyof typeof t] || amenity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Lead Form */}
          <div className="bg-emerald-600 rounded-3xl p-8 lg:p-10 text-white shadow-xl shadow-emerald-200">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{t.thankYou}</h3>
                <p className="text-emerald-50 mb-8">{t.receivedInterest}</p>
                <a 
                  href={`https://wa.me/?text=I am interested in ${property.title}`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  {t.whatsappUs}
                </a>
              </motion.div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-2">{t.interested}</h3>
                <p className="text-emerald-100 mb-8">{t.leaveDetails}</p>
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
                    <input 
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={leadData.name}
                      onChange={e => setLeadData({ ...leadData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:outline-none transition-all placeholder:text-emerald-200"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
                    <input 
                      required
                      type="tel"
                      placeholder={t.phonePlaceholder}
                      value={leadData.phone}
                      onChange={e => setLeadData({ ...leadData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:outline-none transition-all placeholder:text-emerald-200"
                    />
                  </div>
                  <button 
                    disabled={submitting}
                    type="submit"
                    className="w-full py-4 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : t.submitInterest}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ user, lang }: { user: any, lang: 'en' | 'ar' }) => {
  const t = translations[lang];
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          setProfile(data);
          setFormData({
            displayName: data.displayName || user.displayName || '',
            photoURL: data.photoURL || user.photoURL || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...profile,
        displayName: formData.displayName,
        photoURL: formData.photoURL,
        uid: user.uid,
        email: user.email,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Also update Auth profile
      await updateProfile(auth.currentUser!, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      alert(t.profileUpdated);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{t.personalProfile}</h1>
            <div className="w-20 h-1.5 bg-emerald-600 rounded-full" />
          </div>
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToDashboard}
          </Link>
        </header>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <form onSubmit={handleUpdateProfile} className="p-8 lg:p-12 space-y-10">
            {/* Avatar Selection */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-emerald-50 ring-4 ring-white shadow-xl">
                  <img 
                    src={formData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || 'User')}&background=10b981&color=fff`} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                  />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <ImageIcon className="w-8 h-8 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleProfilePhotoChange} 
                  />
                </label>
              </div>
              <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t.profilePhoto}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.displayName}</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    required
                    type="text"
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-60 cursor-not-allowed">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t.email}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">@</span>
                  <input 
                    disabled
                    type="email"
                    value={user.email}
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-2xl outline-none font-medium text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                disabled={saving}
                type="submit"
                className="w-full py-5 bg-emerald-600 text-white font-bold rounded-[1.5rem] shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {t.saveProfile}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    testConnection();
    
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar 
          user={user} 
          lang={lang} 
          setLang={setLang} 
        />
        
        <Routes>
          <Route path="/" element={<Home lang={lang} user={user} />} />
          <Route path="/auth" element={<AuthPage lang={lang} />} />
          <Route path="/p/:id" element={<PropertyLanding lang={lang} />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} lang={lang} /> : <Home lang={lang} user={user} />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={user ? <AdminDashboard user={user} lang={lang} /> : <Home lang={lang} user={user} />} />
          <Route path="/admin/new" element={user ? <PropertyForm user={user} lang={lang} /> : <Home lang={lang} user={user} />} />
          <Route path="/admin/edit/:id" element={user ? <PropertyForm user={user} lang={lang} isEdit /> : <Home lang={lang} user={user} />} />
          <Route path="/admin/leads/:id" element={user ? <LeadList user={user} lang={lang} /> : <Home lang={lang} user={user} />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}
