"use client"

<<<<<<< Updated upstream
import { devLog } from "@/lib/dev-log"

import { useState, useEffect, ReactNode } from "react"
=======
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Eye, EyeOff, User, Mail, CheckCircle, ChevronLeft } from 'lucide-react';
>>>>>>> Stashed changes
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

// Memoized form input components to prevent re-renders
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
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Already Registered
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          This email is already registered. Please login to continue.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onLogin}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
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
    <div
      key={currentIndex}
      className="transition-all duration-700 ease-in-out opacity-100"
    >
      {/* <h1 className="text-3xl font-bold leading-tight mb-6 text-white"> */}
      <h1 className="text-2xl lg:text-3xl font-bold leading-tight mb-3 lg:mb-6 text-white">
        {messages[currentIndex].title}
        <br />
        <span className="font-normal text-xl">
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

  // Optimized handlers
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
      await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: { email: formData.email },
        auth: false,
      });
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
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    
    updateFormState({ isSubmitting: true });

    try {
      await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: { email: formData.email, otp },
        auth: false,
      });
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
      await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: { email: formData.email },
        auth: false,
      });
      alert("OTP resent successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err?.body?.message || err?.message || "Error resending OTP");
    }
  }, [formData.email]);

  const handleStep2Submit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, designation, companyName, city } = formData;
    
    if (!fullName || !designation || !companyName || !city) {
      alert("Please fill in all fields");
      return;
    }
    
    updateFormState({ showPasswordFields: true });
  }, [formData, updateFormState]);

  const handlePasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const { password, confirmPassword } = formData;
    
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

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

      if (res.ok) {
        router.push("/login?registered=organizer")
        return
      }
      alert(data.error || data.details || "Registration failed. Please try again.")
    } catch (err) {
      console.error("Registration error:", err);
      alert("An error occurred during registration. Please try again.");
    } finally {
      updateFormState({ isSubmitting: false });
    }
  }, [formData, router, updateFormState]);

  // Memoized UI sections
  const renderStep1 = useMemo(() => {
    if (currentStep !== 1) return null;
    
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden">
  {/* Background Design */}
  <div className="absolute inset-0 overflow-hidden">
    {/* Base Background */}
    <div className="absolute inset-0 bg-[#001B70]" />

    {/* Main Glow */}
    <div
      className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.12) 45%, transparent 75%)",
        filter: "blur(30px)",
      }}
    />

    {/* Circular Rings */}
    <div className="absolute left-1/2 top-1/2 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10" />
    <div className="absolute left-1/2 top-1/2 h-[950px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10" />
    <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10" />

    {/* World Map Style Dot Pattern */}
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    />

    {/* Left Glow */}
    <div className="absolute left-[-200px] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

    {/* Right Glow */}
    <div className="absolute right-[-200px] top-[40%] h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[120px]" />

    {/* Bottom Wave */}
    <svg
      className="absolute bottom-0 left-0 w-full opacity-40"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path
        fill="rgba(59,130,246,0.5)"
        d="M0,256L80,224C160,192,320,128,480,128C640,128,800,192,960,224C1120,256,1280,256,1360,240L1440,224V320H0Z"
      />
    </svg>

    {/* Floating Dots */}
    <div className="absolute left-[8%] top-[22%] h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_20px_#60A5FA]" />
    <div className="absolute left-[28%] top-[10%] h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_20px_#60A5FA]" />
    <div className="absolute left-[75%] top-[15%] h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_20px_#60A5FA]" />
    <div className="absolute left-[90%] top-[60%] h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_20px_#60A5FA]" />
    <div className="absolute left-[55%] top-[80%] h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_20px_#60A5FA]" />

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/20" />
  </div>
        {/* <br /> <br /><br /> <br />  */}

        {/* <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10"> */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">

          {/* <div className="hidden max-w-lg flex-1 text-white lg:block lg:pr-8"> */}
          <div className="w-full text-white lg:max-w-lg lg:flex-1 lg:pr-8">
            <AnimatedMessage messages={messages} />

            {/* <p className="mb-8 text-base leading-relaxed"> */}
            <p className="mb-4 text-sm leading-relaxed lg:mb-8 lg:text-base">
              Showcase your event to an engaged audience and build genuine trust using targeted, multi-channel
              outreach. Reach potential attendees through platforms they prefer—social media, mobile updates, our
              dynamic website, curated newsletters, and direct database access.
            </p>

            <button
              type="button"
              className="rounded-full border-2 border-white bg-transparent px-7 py-2 font-semibold text-white transition-colors hover:bg-white hover:text-blue-900"
            >
              LEARN MORE
            </button>
          </div>

          {/* <p className="text-center text-sm font-medium text-white lg:hidden">
            Join BizTradeFairs — list events and reach exhibitors worldwide
          </p> */}

          <div className="relative mx-auto w-full max-w-md shrink-0 rounded-3xl bg-white p-6 shadow-2xl sm:p-8 lg:mx-0">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              {formState.showOtpSection ? 'Verify Your Email' : "Let's get started"}
            </h2>

            {!formState.showOtpSection ? (
              <form onSubmit={handleInitialSubmit} className="space-y-5">
                <FormInput
                  icon={User}
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
                
                <FormInput
                  icon={Mail}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your business email"
                  required
                />

                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formState.isSubmitting ? 'PROCESSING...' : 'PROCEED'}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <button
                  onClick={() => updateFormState({ showOtpSection: false })}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to form
                </button>

                <div className="bg-green-500 text-white p-3 rounded-lg mb-4">
                  <p className="text-sm">
                    We have sent an OTP to <strong>{formData.email}</strong>.
                    Please check your inbox and enter it below to verify.
                  </p>
                </div>

                <form onSubmit={handleOtpVerify} className="space-y-5">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Enter 6-digit OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                      maxLength={6}
                      placeholder="123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest text-center text-lg font-semibold"
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => updateFormState({ showOtpSection: false })}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formState.isSubmitting}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formState.isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            <p className="text-gray-500 text-sm mt-6 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline font-semibold transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </div>
        
        <EmailExistsPopup
          isOpen={formState.showEmailExistsPopup}
          onClose={() => updateFormState({ showEmailExistsPopup: false })}
          onLogin={() => router.push("/login")}
        />
      </div>
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
                  <CheckCircle className="mr-1 h-3 w-3" />
                  email verified
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`transition-opacity duration-300 ${formState.showPasswordFields ? 'opacity-50' : 'opacity-100'}`}>
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Full Name
                    </label>
                    <FormInput
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      disabled={formState.showPasswordFields}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Designation
                    </label>
                    <FormInput
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="Event Manager"
                      required
                      disabled={formState.showPasswordFields}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Company Name
                  </label>
                  <FormInput
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Event Solutions Inc"
                    required
                    disabled={formState.showPasswordFields}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">City</label>
                  <FormInput
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York, United States"
                    required
                    disabled={formState.showPasswordFields}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Phone (Optional)</label>
                  <FormInput
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                    disabled={formState.showPasswordFields}
                  />
                </div>

                {!formState.showPasswordFields && (
                  <button
                    type="submit"
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
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
                    <PasswordInput
                      showPassword={formState.showPassword}
                      togglePassword={() => updateFormState({ showPassword: !formState.showPassword })}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password (min 8 characters)"
                      name="password"
                      disabled={formState.isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
                    <PasswordInput
                      showPassword={formState.showConfirmPassword}
                      togglePassword={() => updateFormState({ showConfirmPassword: !formState.showConfirmPassword })}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Enter your password again"
                      name="confirmPassword"
                      disabled={formState.isSubmitting}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => updateFormState({ showPasswordFields: false })}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back to Details
                    </button>
                    <button
                      type="submit"
                      disabled={formState.isSubmitting}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
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
<<<<<<< Updated upstream
    // Outer wrapper — white background, no card border (matches design: content sits on plain white bg)
    <div className="w-full min-w-0 max-w-full space-y-4 bg-white rounded-xl p-3 sm:p-4 md:p-6">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">My Events</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track your events all in one place.</p>
      </div>

      {/* Filter section — sits inside same white container, with its own border */}
      <div className="border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3 bg-white">

        {/* Row 1: Search + Type dropdown + Filter icon */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 bg-white w-full"
            />
          </div>
          <div className="flex gap-3 items-center">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[160px] border-gray-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-gray-200 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          </div>
        </div>

        {/* Row 2: Timeline Status filter buttons */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm font-medium text-gray-600">Timeline Status:</span>
          {["all", "upcoming", "ongoing", "past"].map((status) => (
            <Button
              key={status}
              size="sm"
              onClick={() => setTimelineStatusFilter(status)}
              className={
                timelineStatusFilter === status
                  ? "bg-[#0F172A] text-white hover:bg-[#1E293B] border-[#0F172A] rounded-full px-4 text-sm"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white rounded-full px-4 text-sm"
              }
            >
              {status === "all" ? "All Timeline" : getTimelineStatusLabel(status)}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading events...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found</p>
        </div>
      )}

      {/* Events Grid + Pagination */}
      {!loading && !error && filteredEvents.length > 0 && (
        <>
          {/* 3-column grid matching design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((event: Event) => {
              const timelineColors = getTimelineStatusColor(event.timelineStatus ?? "past")
              const publicationColors = getPublicationStatusColor(event.status)
              const eventImage = getEventImage(event)
              const eventTypeLabel = getPrimaryEventType(event.eventType)
              const categoryLabels = asStringArray(event.category)
              const visibleCategories = categoryLabels.slice(0, 2)
              const hiddenCategoryCount = Math.max(0, categoryLabels.length - visibleCategories.length)

              return (
                <Card
                  key={event.id}
                  onClick={() => router.push(`/event-dashboard/${event.slug || event.id}`)}
                  className="overflow-hidden p-0 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex flex-col h-full">

                    {/* Card image section */}
                    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                      <Image
                        src={eventImage}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Publication status badge — top left */}
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className="px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm"
                          style={{
                            backgroundColor: publicationColors.bg,
                            color: publicationColors.text,
                            border: `1px solid ${publicationColors.border}`,
                          }}
                        >
                          {getPublicationStatusLabel(event.status)}
                        </span>
                      </div>

                      {/* Timeline status badge — top right */}
                      {event.timelineStatus && (
                        <div className="absolute top-3 right-3 z-10">
                          <span
                            className="px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm"
                            style={{
                              backgroundColor: timelineColors.bg,
                              color: timelineColors.text,
                              border: `1px solid ${timelineColors.border}`,
                            }}
                          >
                            {getTimelineStatusLabel(event.timelineStatus)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card content */}
                    <CardContent className="flex-1 p-5 bg-white">
                      <div className="flex flex-col justify-between h-full">
                        <div className="space-y-3">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 hover:text-[#004A96] transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1 leading-relaxed">
                            {event.description}
                          </p>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-xs">
                                {formatDate(event.startDate)} – {formatDate(event.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-xs line-clamp-1">
                                {event.venueAddress || event.location}
                                {event.city && `, ${event.city}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-800">
                                {event.leads || 0} leads
                              </span>
                            </div>
                            {visibleCategories.map((label) => (
                              <span
                                key={`footer-${label}`}
                                className="max-w-[8.5rem] truncate rounded-full border border-[#004A96]/20 bg-[#004A96]/5 px-2 py-1 text-xs font-medium text-[#004A96]"
                              >
                                {label}
                              </span>
                            ))}
                            {hiddenCategoryCount > 0 && (
                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                +{hiddenCategoryCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Footer: type + category pills + View Details */}
                        <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-100">
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                              {eventTypeLabel}
                            </span>
                            
                          </div>
                          <span className="shrink-0 text-xs font-medium text-[#004A96] group-hover:text-[#003d7a]">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-gray-200 text-gray-500 hover:text-gray-700"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  size="icon"
                  className={`h-9 w-9 text-sm font-medium ${
                    currentPage === page
                      ? "bg-[#004A96] text-white border-[#004A96] hover:bg-[#003d7a]"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-gray-200 text-gray-500 hover:text-gray-700"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
=======
    <>
      {renderStep1}
      {renderStep2}
    </>
  );
};

export default OrganizerSignup;
>>>>>>> Stashed changes
