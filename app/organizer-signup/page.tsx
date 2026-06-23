"use client"

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Eye, EyeOff, User, Mail, CheckCircle, ChevronLeft } from 'lucide-react';
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

const FormInput = memo(({ 
  icon: Icon, 
  type, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required,
  disabled,
  className = ""
}: any) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
    />
  </div>
));
FormInput.displayName = 'FormInput';

const PasswordInput = memo(({ 
  showPassword, 
  togglePassword, 
  value, 
  onChange, 
  placeholder,
  name,
  disabled
}: any) => (
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      disabled={disabled}
      minLength={8}
      className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <button
      type="button"
      onClick={togglePassword}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      tabIndex={-1}
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  </div>
));
PasswordInput.displayName = 'PasswordInput';

const EmailExistsPopup = memo(({ isOpen, onClose, onLogin }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-6 w-80 text-center shadow-xl animate-scale-in">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Already Registered</h3>
        <p className="text-sm text-gray-600 mb-6">
          This email is already registered. Please login to continue.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
          <button onClick={onLogin} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">Login</button>
        </div>
      </div>
    </div>
  );
});
EmailExistsPopup.displayName = 'EmailExistsPopup';

const AnimatedMessage = memo(({ messages }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div key={currentIndex} className="transition-all duration-700 ease-in-out opacity-100">
      {/* <h1 className="text-3xl font-bold leading-tight mb-6 text-white"> */}
      {/* <h1 className="text-2xl lg:text-3xl font-bold leading-tight mb-3 lg:mb-6 text-white text-center lg:text-left"> */}
      <h1 className="text-2xl lg:text-3xl font-bold leading-tight mb-3 lg:mb-6 text-blue text-left">
        {messages[currentIndex].title}
        <br />
        {/* hidden on mobile, visible on desktop */}
 {/* OLD: text-cyan-400 on mobile (cyan subtitle color) */}
{/* <span className="font-bold text-cyan-400 lg:font-normal lg:text-white lg:text-xl"> */}
{/* NEW: text-white on mobile to match requested change */}
<span className="font-bold text-white lg:font-normal lg:text-white lg:text-xl">
          {messages[currentIndex].subtitle}
        </span>
      </h1>
    </div>
  );
});
AnimatedMessage.displayName = 'AnimatedMessage';

const OrganizerSignup = () => {
  const messages = useMemo(() => [
    { title: "Enhance", subtitle: "visibility, credibility, & connect with new audiences" },
    { title: "Boost", subtitle: "your event outreach with multi-channel promotions" },
    { title: "Grow", subtitle: "your audience and build genuine trust" },
  ], []);

  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState({
    showPassword: false,
    showConfirmPassword: false,
    showOtpSection: false,
    showPasswordFields: false,
    showEmailExistsPopup: false,
    isSubmitting: false,
  });
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    designation: '',
    companyName: '',
    city: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const router = useRouter();

  const updateFormState = useCallback((updates: any) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  }, []);

  const handleInitialSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    updateFormState({ isSubmitting: true });
    try {
      await apiFetch("/api/auth/send-otp", { method: "POST", body: { email: formData.email }, auth: false });
      updateFormState({ showOtpSection: true });
    } catch (err: any) {
      console.error(err);
      if (err?.status === 409 && err.body?.alreadyRegistered) {
        updateFormState({ showEmailExistsPopup: true });
        return;
      }
      alert(err?.body?.message || err?.message || "Error sending OTP");
    } finally {
      updateFormState({ isSubmitting: false });
    }
  }, [formData.email, updateFormState]);

  const handleOtpVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { alert("Please enter a valid 6-digit OTP"); return; }
    updateFormState({ isSubmitting: true });
    try {
      await apiFetch("/api/auth/verify-otp", { method: "POST", body: { email: formData.email, otp }, auth: false });
      updateFormState({ showOtpSection: false });
      setCurrentStep(2);
    } catch (err: any) {
      console.error(err);
      alert(err?.body?.message || err?.message || "OTP verification failed");
    } finally {
      updateFormState({ isSubmitting: false });
    }
  }, [formData.email, otp, updateFormState]);

  const handleResendOtp = useCallback(async () => {
    try {
      await apiFetch("/api/auth/send-otp", { method: "POST", body: { email: formData.email }, auth: false });
      alert("OTP resent successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err?.body?.message || err?.message || "Error resending OTP");
    }
  }, [formData.email]);

  const handleStep2Submit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, designation, companyName, city } = formData;
    if (!fullName || !designation || !companyName || !city) { alert("Please fill in all fields"); return; }
    updateFormState({ showPasswordFields: true });
  }, [formData, updateFormState]);

  const handlePasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;
    if (password !== confirmPassword) { alert("Passwords don't match!"); return; }
    if (password.length < 8) { alert("Password must be at least 8 characters long"); return; }
    updateFormState({ isSubmitting: true });
    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        companyName: formData.companyName,
        designation: formData.designation,
        userType: "organiser",
        city: formData.city,
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });
      const data = await res.json();
      if (res.ok) { router.push("/login?registered=organizer"); return; }
      alert(data.error || data.details || "Registration failed. Please try again.");
    } catch (err) {
      console.error("Registration error:", err);
      alert("An error occurred during registration. Please try again.");
    } finally {
      updateFormState({ isSubmitting: false });
    }
  }, [formData, router, updateFormState]);

  const renderStep1 = useMemo(() => {
    if (currentStep !== 1) return null;

    return (
      <>
      
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">

          <div className="absolute inset-0 overflow-hidden">

            {/* Full-page SVG background */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1440 810"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Navy-to-blue radial gradient for top half */}
                <radialGradient id="bgGrad" cx="50%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#0040C8" />
                  <stop offset="60%" stopColor="#001878" />
                  <stop offset="100%" stopColor="#000E50" />
                </radialGradient>

                {/* Top-right dark blob gradient */}
                <radialGradient id="blobGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#001460" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#001460" stopOpacity="0" />
                </radialGradient>

                {/* Glow filter for floating dots */}
                <filter id="glow" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>

                {/* Clip path — everything above the wave stays navy */}
                <clipPath id="topClip">
                  <path d="M0,0 L1440,0 L1440,480 Q1080,320 720,430 Q360,540 0,370 Z" />
                </clipPath>
              </defs>

              {/* ── FULL WHITE BASE (bottom half) ── */}
              <rect width="1440" height="810" fill="#F0F4FF" />

              {/* ── NAVY TOP SECTION ── */}
              <rect width="1440" height="810" fill="url(#bgGrad)" clipPath="url(#topClip)" />

              {/* ── TOP-RIGHT DARK BLOB ── */}
              <ellipse cx="1300" cy="80" rx="220" ry="150" fill="url(#blobGrad)" />

              {/* ── TOP-LEFT: Concentric arc lines ── */}
              {[80, 120, 160, 200, 240, 280, 320, 360].map((r, i) => (
                <circle key={`arc-${i}`} cx="-20" cy="20" r={r}
                  fill="none" stroke="rgba(100,160,255,0.18)" strokeWidth="0.8" />
              ))}

              {/* ── TOP-LEFT: Constellation / network cluster ── */}
              <g stroke="rgba(120,180,255,0.45)" strokeWidth="1">
                <line x1="30" y1="42" x2="98" y2="20" />
                <line x1="98" y1="20" x2="158" y2="60" />
                <line x1="158" y1="60" x2="140" y2="140" />
                <line x1="66" y1="112" x2="140" y2="140" />
                <line x1="66" y1="112" x2="30" y2="42" />
                <line x1="18" y1="166" x2="66" y2="112" />
                <line x1="98" y1="20" x2="66" y2="112" strokeOpacity="0.3" />
              </g>
              {[[30,42],[98,20],[158,60],[66,112],[140,140],[18,166]].map(([cx,cy], i) => (
                <circle key={`tl-node-${i}`} cx={cx} cy={cy} r={i % 2 === 0 ? 5 : 3.2}
                  fill="#5BA8FF" fillOpacity={0.85 - i * 0.08} />
              ))}

              {/* ── TOP-CENTER: Two floating dots ── */}
              {/* Filled glowing dot */}
              <circle cx="480" cy="120" r="7" fill="#3B82F6" filter="url(#glow)" />
              {/* Outline circle below it */}
              <circle cx="480" cy="155" r="9" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.7" />

              {/* ── TOP-RIGHT: Two floating dots ── */}
              <circle cx="1380" cy="120" r="7" fill="#3B82F6" filter="url(#glow)" />
              <circle cx="1380" cy="155" r="9" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.7" />

              {/* ── RIGHT SIDE: Dashed arc ── */}
              <path
                d="M 1440,200 Q 1300,380 1440,560"
                fill="none" stroke="rgba(100,160,255,0.5)"
                strokeWidth="1.2" strokeDasharray="8 6"
              />

              {/* ── WAVE DIVIDER: white fill ── */}
              <path
                d="M0,370 Q360,540 720,430 Q1080,320 1440,480 L1440,810 L0,810 Z"
                fill="white"
              />

              {/* ── WAVE DIVIDER: bright blue stroke (inner) ── */}
              <path
                d="M0,375 Q360,545 720,435 Q1080,325 1440,485"
                fill="none" stroke="#1A6EFF" strokeWidth="6"
              />

              {/* ── WAVE DIVIDER: thinner white highlight on top of blue ── */}
              <path
                d="M0,370 Q360,540 720,430 Q1080,320 1440,480"
                fill="none" stroke="white" strokeWidth="3"
              />

              {/* ── BOTTOM-LEFT: Outlined hex/ring cluster (white area) ── */}
              <g fill="none" stroke="#3B82F6">
                <polygon points="46,548 70,562 70,590 46,604 22,590 22,562"
                  strokeOpacity="0.35" strokeWidth="1.4" />
                <polygon points="120,600 144,614 144,642 120,656 96,642 96,614"
                  strokeOpacity="0.22" strokeWidth="1.4" />
                <circle cx="60" cy="690" r="22" strokeOpacity="0.3" strokeWidth="1.2" />
                <circle cx="150" cy="730" r="14" strokeOpacity="0.4" strokeWidth="1.2" />
              </g>
              <circle cx="46" cy="576" r="3.5" fill="#3B82F6" fillOpacity="0.5" />
              <circle cx="120" cy="628" r="3" fill="#3B82F6" fillOpacity="0.35" />

              {/* ── BOTTOM-LEFT: Glowing dot + outline circle ── */}
              <circle cx="85" cy="700" r="7" fill="#3B82F6" filter="url(#glow)" />
              <circle cx="130" cy="720" r="10" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.5" />

              {/* ── BOTTOM: Light concentric lines (white area) ── */}
              {[60, 110, 160, 210].map((r, i) => (
                <circle key={`bc-${i}`} cx="720" cy="810" r={r}
                  fill="none" stroke="rgba(180,200,240,0.3)" strokeWidth="0.8" />
              ))}


            </svg>
            {/* end new background SVG */}

          </div>
          {/* end background div */}

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-8">

  {/* Hero row: text left + signup card right */}
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-10">

    {/* LEFT: Text content — fixed min-height on headline to prevent layout shift */}
    <div className="w-full text-white lg:max-w-lg lg:flex-1 lg:pr-8">

      {/* This wrapper reserves space so the signup card never shifts */}
      <div className="min-h-[140px]">
        <AnimatedMessage messages={messages} />
      </div>

      <p className="hidden lg:block mb-8 text-base leading-relaxed">
        Showcase your event to an engaged audience and build genuine trust using targeted, multi-channel
        outreach. Reach potential attendees through platforms they prefer—social media, mobile updates, our
        dynamic website, curated newsletters, and direct database access.
      </p>

      <button
        type="button"
        className="hidden lg:block rounded-full border-2 border-white bg-transparent px-7 py-2 font-semibold text-white transition-colors hover:bg-white hover:text-blue-900"
      >
        LEARN MORE
      </button>
    </div>

    {/* RIGHT: Signup card — self-start so it stays top-anchored */}
    <div className="relative mx-auto w-full max-w-md shrink-0 rounded-3xl bg-white p-6 shadow-2xl sm:p-8 lg:mx-0 lg:self-start">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        {formState.showOtpSection ? 'Verify Your Email' : "Let's get started"}
      </h2>

      {!formState.showOtpSection ? (
        <form onSubmit={handleInitialSubmit} className="space-y-5">
          <FormInput icon={User} type="text" name="fullName" value={formData.fullName}
            onChange={handleInputChange} placeholder="Enter your full name" required />
          <FormInput icon={Mail} type="email" name="email" value={formData.email}
            onChange={handleInputChange} placeholder="Enter your business email" required />
          <button type="submit" disabled={formState.isSubmitting}
            className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {formState.isSubmitting ? 'PROCESSING...' : 'PROCEED'}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <button onClick={() => updateFormState({ showOtpSection: false })}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" />Back to form
          </button>
          <div className="bg-green-500 text-white p-3 rounded-lg mb-4">
            <p className="text-sm">We have sent an OTP to <strong>{formData.email}</strong>. Please check your inbox and enter it below to verify.</p>
          </div>
          <form onSubmit={handleOtpVerify} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Enter 6-digit OTP</label>
              <input type="text" value={otp} onChange={handleOtpChange} maxLength={6} placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest text-center text-lg font-semibold" required />
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={() => updateFormState({ showOtpSection: false })}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
              <button type="submit" disabled={formState.isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {formState.isSubmitting ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          </form>
          <div className="text-center">
            <button onClick={handleResendOtp} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">Resend OTP</button>
          </div>
        </div>
      )}

      <p className="text-gray-500 text-sm mt-6 text-center">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline font-semibold transition-colors">Sign in here</a>
      </p>
    </div>
  </div>

  {/* Feature cards — Desktop only, BELOW the hero row, centered across full width */}
  <br />
  <div className="hidden lg:grid grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto w-full">
    {[
      {
        icon: (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        ),
        title: "Multi-Channel Outreach",
        desc: "Promote across social media, email, website and more.",
      },
      {
        icon: (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        title: "Engaged Audience",
        desc: "Connect with the right attendees who care about your event.",
      },
      {
        icon: (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        title: "Real Results",
        desc: "Track performance and grow your event impact.",
      },
    ].map(({ icon, title, desc }) => (
      <div key={title} className="flex flex-col items-center text-center gap-3 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-[#1a2f7a] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="font-semibold text-base text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    ))}
  </div>

</div>
          {/* Bottom Feature Cards - Mobile only */}
<div className="relative z-10 lg:hidden px-4 pb-10 pt-2">
  <p className="text-center text-xs font-bold tracking-widest text-black uppercase mb-4">
    Why choose us
  </p>
  <div className="grid grid-cols-2 gap-3">

    {/* Card 1 */}
    <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-blue-100">
      <div className="w-10 h-10 rounded-xl bg-[#1a2f7a] flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      </div>
      <div>
        <p className="text-[#0C447C] font-semibold text-[13px] leading-tight mb-1">Multi-Channel Outreach</p>
        <p className="text-[#185FA5] text-[11px] leading-relaxed">Social media, email, website & more.</p>
      </div>
    </div>

    {/* Card 2 */}
    <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-blue-100">
      <div className="w-10 h-10 rounded-xl bg-[#1a2f7a] flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <p className="text-[#0C447C] font-semibold text-[13px] leading-tight mb-1">Engaged Audience</p>
        <p className="text-[#185FA5] text-[11px] leading-relaxed">Right attendees who care about your event.</p>
      </div>
    </div>

    {/* Card 3 - full width */}
    <div className="col-span-2 flex flex-row items-center gap-4 p-4 bg-white rounded-2xl border border-blue-100">
      <div className="w-10 h-10 rounded-xl bg-[#1a2f7a] flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div>
        <p className="text-[#0C447C] font-semibold text-[13px] leading-tight mb-1">Real Results</p>
        <p className="text-[#185FA5] text-[11px] leading-relaxed">Track performance and grow your event impact with live analytics.</p>
      </div>
    </div>

  </div>
</div>

          <EmailExistsPopup
            isOpen={formState.showEmailExistsPopup}
            onClose={() => updateFormState({ showEmailExistsPopup: false })}
            onLogin={() => router.push("/login")}
          />
        </div>
      </>
    );
  }, [currentStep, formState, formData, otp, messages, handleInitialSubmit, handleOtpVerify, handleResendOtp, router, updateFormState, handleInputChange]);

  const renderStep2 = useMemo(() => {
    if (currentStep !== 2) return null;
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
          <div className="mb-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-600">Email</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="break-all font-medium text-sm">{formData.email}</span>
                <span className="flex items-center rounded-full bg-green-100 px-3 py-1 text-xs text-green-600">
                  <CheckCircle className="mr-1 h-3 w-3" />email verified
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className={`transition-opacity duration-300 ${formState.showPasswordFields ? 'opacity-50' : 'opacity-100'}`}>
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                    <FormInput type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" required disabled={formState.showPasswordFields} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Designation</label>
                    <FormInput type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Event Manager" required disabled={formState.showPasswordFields} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Company Name</label>
                  <FormInput type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Event Solutions Inc" required disabled={formState.showPasswordFields} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">City</label>
                  <FormInput type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="New York, United States" required disabled={formState.showPasswordFields} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Phone (Optional)</label>
                  <FormInput type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 234 567 8900" disabled={formState.showPasswordFields} />
                </div>
                {!formState.showPasswordFields && (
                  <button type="submit" className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Continue to Password Setup
                  </button>
                )}
              </form>
            </div>
            {formState.showPasswordFields && (
              <div className="pt-6 border-t border-gray-200">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Password</label>
                    <PasswordInput showPassword={formState.showPassword} togglePassword={() => updateFormState({ showPassword: !formState.showPassword })} value={formData.password} onChange={handleInputChange} placeholder="Enter your password (min 8 characters)" name="password" disabled={formState.isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
                    <PasswordInput showPassword={formState.showConfirmPassword} togglePassword={() => updateFormState({ showConfirmPassword: !formState.showConfirmPassword })} value={formData.confirmPassword} onChange={handleInputChange} placeholder="Enter your password again" name="confirmPassword" disabled={formState.isSubmitting} />
                  </div>
                  <div className="flex space-x-4">
                    <button type="button" onClick={() => updateFormState({ showPasswordFields: false })}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Back to Details</button>
                    <button type="submit" disabled={formState.isSubmitting}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {formState.isSubmitting ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [currentStep, formState, formData, handleStep2Submit, handlePasswordSubmit, updateFormState, handleInputChange]);

  return (
    <>
      {renderStep1}
      {renderStep2}
    </>
  );
};

export default OrganizerSignup;