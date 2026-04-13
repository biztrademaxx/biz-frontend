"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, Search, ChevronDown, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("visitor")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    companyName: "",
    phone: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", { ...formData, userType, isLogin })
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-lg">BZ</div>
              <span className="ml-2 text-lg font-semibold text-gray-900">TradeFairs.com</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-1 cursor-pointer">
                <span className="text-gray-700">Explore</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="What are you looking for ?"
                  className="w-80 pl-4 pr-10 py-2 bg-blue-600 text-white placeholder-blue-200 border-blue-600"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-200" />
              </div>

              <Link href="/events" className="text-gray-700 hover:text-blue-600">
                Top 10 Must Visit
              </Link>
              <Link href="/speakers" className="text-gray-700 hover:text-blue-600">
                Speakers
              </Link>
              <span className="text-gray-700 cursor-pointer">AddEvent</span>

              {/* Country Selector */}
              <div className="flex items-center space-x-2 border border-gray-300 rounded px-2 py-1">
                <div className="w-6 h-4 bg-gradient-to-b from-orange-500 via-white to-green-500 rounded-sm"></div>
                <span className="text-sm">IND</span>
                <ChevronDown className="w-3 h-3" />
              </div>

              {/* User Avatar */}
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-4">
            <h1 className="text-2xl font-semibold text-gray-900">{isLogin ? "Welcome" : "Create Account"}</h1>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Type Selector */}
            <Tabs value={userType} onValueChange={setUserType} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                <TabsTrigger value="visitor" className="text-xs px-2 py-2">
                  Visitor
                </TabsTrigger>
                <TabsTrigger value="exhibitor" className="text-xs px-2 py-2">
                  Exhibitor
                </TabsTrigger>
                <TabsTrigger value="organiser" className="text-xs px-2 py-2">
                  Organiser
                </TabsTrigger>
                <TabsTrigger value="speaker" className="text-xs px-2 py-2">
                  Speaker
                </TabsTrigger>
                <TabsTrigger value="venue" className="text-xs px-2 py-2">
                  Venue
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Fields */}
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>

                  {(userType === "exhibitor" || userType === "organiser" || userType === "venue") && (
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400">🏢</div>
                      <Input
                        type="text"
                        name="companyName"
                        placeholder="Company Name"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400">📱</div>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password for Registration */}
              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              )}

              {/* Forgot Password Link */}
              {isLogin && (
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5">
                {isLogin ? "Log in" : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-transparent"
                onClick={() => handleSocialLogin("google")}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-transparent"
                onClick={() => handleSocialLogin("linkedin")}
              >
                <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </Button>
            </div>

            {/* Toggle Login/Register */}
            <div className="text-center">
              <p className="text-sm text-gray-600">{isLogin ? "Have no account yet?" : "Already have an account?"}</p>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2 bg-transparent"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Registration" : "Log in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Worldwide Footprint</h2>

          {/* Partner Logos */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-500">PARTNER {index}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hardware Acceleration Banner */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center space-x-3 text-sm">
          <span>Improve performance by enabling hardware acceleration</span>
          <Button variant="link" className="text-blue-400 p-0 h-auto">
            Learn more
          </Button>
          <button className="text-gray-400 hover:text-white">✕</button>
        </div>
      </div>
    </div>
  )
}
