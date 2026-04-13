"use client"
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Building, MapPin, CheckCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from "next/image";

const OrganizerSignup = () => {
    const messages = [
    {
      title: "Enhance",
      subtitle: "visibility, credibility, & connect with new audiences",
    },
    {
      title: "Boost",
      subtitle: "your event outreach with multi-channel promotions",
    },
    {
      title: "Grow",
      subtitle: "your audience and build genuine trust",
    },
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [textIndex, setTextIndex] = useState(0);
  // const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    designation: '',
    companyName: '',
    city: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  //   const handleInitialSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setShowOtpSection(true);
  // };
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (res.ok) {
        setShowOtpSection(true);
        setShowMessage(true);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    }
  }
  // const handleOtpVerify = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Proceed regardless of input
  //   setShowOtpSection(false);
  //   setCurrentStep(2);
  // };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      if (res.ok) {
        setShowOtpSection(false);
        setCurrentStep(2);
      } else {
        const data = await res.json();
        alert(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP");
    }
  };
  // const handleResendOtp = () => {
  //   alert("OTP resent successfully!");
  // };
  const handleResendOtp = async () => {
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (res.ok) {
        alert("OTP resent successfully!");
        setShowMessage(true);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error resending OTP");
    }
  };
  const handleBackToForm = () => {
    setShowOtpSection(false);
  };

  const handleResendEmail = () => {
    console.log('Resending verification email...');
    setShowMessage(true);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields are filled
    if (!formData.fullName || !formData.designation || !formData.companyName || !formData.city) {
      alert("Please fill in all fields");
      return;
    }
    // Show password fields with animation
    setShowPasswordFields(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    setCurrentStep(4); // Move to success screen
  };

  const handleBackToDetails = () => {
    setShowPasswordFields(false);
  };

  const handleFinalContinue = () => {
    // Redirect to dashboard or login
    console.log('Account created successfully');
  };
    useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Step 1: Initial Signup Form with OTP Section in same card
  if (currentStep === 1) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-blue-100">
        {/* Background shapes */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/40"></div>
          <div
            className="absolute inset-0 bg-[url('/organizer-signup/BG_ORG_DSH.jpg')] bg-cover bg-center"
          ></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 w-full">
          {/* Left side content */}
          <div className="flex-1 text-blue-900 pr-12 max-w-lg">
            <Link href="/" className="inline-block mb-12">
              <div className="w-50 h-40 relative">
                <Image
                  src="/logo/logo.png"
                  alt="BizTradeFairs Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Animated Text */}
            <div
              key={textIndex} // triggers animation on change
              className="transition-opacity duration-1000 ease-in-out opacity-100 animate-fade"
            >
              <h1 className="text-5xl font-bold leading-tight mb-6 text-white">
                {messages[textIndex].title}
                <br />
                <span className="font-normal text-2xl">
                  {messages[textIndex].subtitle}
                </span>
              </h1>
            </div>

            <p className="text-base mb-8 leading-relaxed text-white">
              Showcase your event to an engaged audience and build genuine trust using targeted, multi-channel outreach.
              Reach potential attendees through platforms they prefer—social media, mobile updates, our dynamic website,
              curated newsletters, and direct database access. Present your event as a credible industry opportunity.
            </p>

            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-all">
              LEARN MORE
            </button>
          </div>

          {/* Right side signup form */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm relative">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              {showOtpSection ? 'Verify Your Email' : "Let's get started"}
            </h2>

            {!showOtpSection ? (
              // Initial Form
              <form onSubmit={handleInitialSubmit} className="space-y-5">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border-b border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your business email"
                    className="w-full pl-10 pr-4 py-3 border-b border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all"
                >
                  PROCEED
                </button>
              </form>
            ) : (
              // OTP Verification Section
              <div className="space-y-5">
                {/* Back button */}
                <button
                  onClick={handleBackToForm}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to form
                </button>

                {/* Email verification message */}
                <div className="mb-4">
                  {showMessage && (
                    <div className="bg-green-500 text-white p-3 rounded-lg">
                      <p className="text-sm">
                        We have sent an OTP to <strong>{formData.email}</strong>.
                        Please check your inbox and enter it below to verify.
                      </p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleOtpVerify} className="space-y-5">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Enter 6-digit OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      placeholder="123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest text-center text-lg font-semibold"
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleBackToForm}
                      className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Verify & Continue
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <button
                    onClick={handleResendOtp} // Changed from handleResendEmail
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            <p className="text-gray-500 text-sm mt-6 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Merged Steps 2 & 3: Form Completion with Password Setup
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
          {/* Email verification status */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Email</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{formData.email}</span>
                <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  email verified
                </span>
              </div>
            </div>
          </div>

          {/* Main form container */}
          <div className="space-y-6">
            {/* Personal Details Section */}
            <div className={`transition-all duration-500 ease-in-out ${showPasswordFields ? 'opacity-50' : 'opacity-100'}`}>
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={showPasswordFields}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="Owner"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={showPasswordFields}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Apple Inc"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={showPasswordFields}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York, United States"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={showPasswordFields}
                  />
                </div>

                {!showPasswordFields && (
                  <button
                    type="submit"
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                  >
                    Continue to Password Setup
                  </button>
                )}
              </form>
            </div>

            {/* Password Fields Section - Animated */}
            <div className={`transition-all duration-700 ease-in-out overflow-hidden ${showPasswordFields
                ? 'max-h-96 opacity-100 translate-y-0'
                : 'max-h-0 opacity-0 -translate-y-4'
              }`}>
              {showPasswordFields && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="text-center mb-6">
                    {/* <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Password</h3> */}
                    {/* <div className="bg-green-500 text-white p-3 rounded-lg text-sm">
                      You have successfully verified your email. To prevent your account from unauthorized access, we recommend you to kindly set a strong password.
                    </div> */}
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password here"
                          className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Enter your password again"
                          className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleBackToDetails}
                        className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                      >
                        Back to Details
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                      >
                        Create Account
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Step 4: Success Screen
  if (currentStep === 4) {
    // popup state

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl text-center relative">

          {/* Popup overlay inside card */}
          {showPopup && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl z-20">
              <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg w-80 relative">
                <p className="font-semibold mb-4">
                  Your password has been set successfully!
                </p>
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  Ok
                </button>
              </div>
            </div>
          )}

          {/* Rest of success screen content */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span className="text-gray-600">Email Verified</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>

            <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-lg text-sm">
              You have successfully verified your email. To prevent your account from unauthorized access, we recommend you to kindly reset the password.
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-green-600 font-semibold mb-4">
              Account created successfully!
            </p>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all inline-block"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OrganizerSignup;