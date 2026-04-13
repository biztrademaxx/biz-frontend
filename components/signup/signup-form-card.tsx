"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, Check, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const organizers = [
  { id: 1, name: "Max Events Pvt Ltd", logo: "/Organizers/maxx.png", description: "Leading event organizer" },
  { id: 2, name: "Max Exhibitions", logo: "/Organizers/maxx.png", description: "Exhibition specialists" },
  { id: 3, name: "Max Conferences", logo: "/Organizers/maxx.png", description: "Conference organizers" },
  { id: 4, name: "Max Trade Shows", logo: "/Organizers/maxx.png", description: "Trade show experts" },
  { id: 5, name: "Max Corporate Events", logo: "/Organizers/maxx.png", description: "Corporate event planners" },
  { id: 6, name: "Max Entertainment", logo: "/Organizers/maxx.png", description: "Entertainment events" },
]

export type SignupFormCardProps = {
  variant: "page" | "dialog"
  /** After successful email/password signup in dialog mode (e.g. close modal). */
  onRegistrationSuccess?: () => void
}

export function SignupFormCard({ variant, onRegistrationSuccess }: SignupFormCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userType, setUserType] = useState("visitor")
  const [selectedPlan, setSelectedPlan] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
    designation: "",
    website: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing and also all the errors
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    // Check required company name for business users
    if (isCompanyRequired() && !formData.companyName.trim()) {
      newErrors.companyName = `${getPlaceholderText()} is required`
    }

    // Validate website URL if provided
    if (formData.website && formData.website.trim()) {
      if (!formData.website.startsWith("http://") && !formData.website.startsWith("https://")) {
        newErrors.website = "Website must start with http:// or https://"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Form submitted with data:", formData)

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const requestData = {
        ...formData,
        userType,
        selectedPlan: userType === "organiser" ? selectedPlan : null,
      }

      console.log("Sending request with data:", requestData)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      console.log("Response:", response.status, data)

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message,
        })

        if (variant === "dialog") {
          onRegistrationSuccess?.()
        } else {
          setTimeout(() => {
            router.push("/")
          }, 1200)
        }
      } else {
        console.error("Registration failed:", data)
        toast({
          title: "Registration Failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        })

        // Show validation errors if available
        if (data.validationErrors) {
          const validationErrors: Record<string, string> = {}
          data.validationErrors.forEach((error: any) => {
            const field = error.path[0]
            validationErrors[field] = error.message
          })
          setErrors(validationErrors)
        }
      }
    } catch (error) {
      console.error("Network error:", error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Added Google Signup Logic
  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      console.error("Error during Google signup:", err)
      toast({
        title: "Error",
        description: "Failed to sign up with Google.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkedInSignup = () => {
    toast({
      title: "Coming Soon",
      description: "LinkedIn signup will be available soon!",
    })
  }

  const getPlaceholderText = () => {
    switch (userType) {
      case "exhibitor":
        return "Company/Organization Name"
      case "organiser":
        return "Organization/Agency Name"
      case "speaker":
        return "Company/Organization (Optional)"
      case "venue":
        return "Venue/Facility Name"
      default:
        return "Company Name (Optional)"
    }
  }

  const isCompanyRequired = () => {
    return ["exhibitor", "organiser", "venue"].includes(userType)
  }

  const pricingPlans = [
    {
      id: "basic",
      name: "Basic",
      reach: "5,000+ users",
      duration: "7 days",
      features: [
        "Email notification to 5,000+ users",
        "In-app notification banner",
        "Category-based targeting",
        "Basic analytics report",
        "7-day promotion duration",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      reach: "15,000+ users",
      duration: "14 days",
      popular: true,
      features: [
        "Email notification to 15,000+ users",
        "Featured event placement",
        "Multi-category targeting",
        "Push notifications",
        "Detailed analytics dashboard",
        "14-day promotion duration",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      reach: "50,000+ users",
      duration: "30 days",
      features: [
        "Email notification to 50,000+ users",
        "Featured event placement",
        "Multi-category targeting",
        "Social media cross-promotion",
        "Push notifications",
        "Detailed analytics dashboard",
        "30-day promotion duration",
      ],
    },
  ]

  const comparisonFeatures = [
    { feature: "Type of Listing", basic: "Standard", premium: "Featured", enterprise: "Premium Featured" },
    { feature: "Event Visibility Boost", basic: true, premium: true, enterprise: true },
    { feature: "Email Credits per month", basic: "5,000", premium: "15,000", enterprise: "50,000" },
    { feature: "Event Marked Premium", basic: false, premium: true, enterprise: true },
    { feature: "Boost Search Result", basic: false, premium: true, enterprise: true },
    { feature: "Banner on Event Search Page", basic: false, premium: false, enterprise: true },
    { feature: "Higher search ranking", basic: false, premium: true, enterprise: true },
    { feature: "Feature Showcase on Targeted Country Search Pages", basic: false, premium: false, enterprise: true },
    { feature: "Feature Showcase on Targeted City Search Pages", basic: false, premium: false, enterprise: true },
    { feature: "Feature Showcase on Targeted Industry Search Pages", basic: false, premium: false, enterprise: true },
    { feature: "Event Featured in Industry e-Newsletters bi-monthly", basic: false, premium: false, enterprise: true },
    { feature: "Event Recommendation Widget Coverage", basic: false, premium: true, enterprise: true },
    { feature: "Event Coverage on Social Channels", basic: false, premium: false, enterprise: true },
    { feature: "Priority Display Across Relevant Search Pages", basic: false, premium: false, enterprise: true },
    { feature: "Feature Showcase on Homepage", basic: false, premium: false, enterprise: true },
    { feature: "Search Infeed Slots", basic: false, premium: false, enterprise: true },
    { feature: "Top 100 Page Banner", basic: false, premium: false, enterprise: true },
    { feature: "Add-on Platform Value", basic: false, premium: true, enterprise: true },
    { feature: "Leads & Messaging", basic: "Basic", premium: "Advanced", enterprise: "Premium" },
    { feature: "Advanced Platform Features", basic: false, premium: true, enterprise: true },
    { feature: "Support", basic: "Email", premium: "Email + Chat", enterprise: "24/7 Priority" },
  ]

  const content = (
    <div className="w-full">
          <div>
            <Card className="w-full max-w-md mx-auto shadow-lg">
              <CardHeader className="text-center pb-4">
                <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* User Type Selector */}
                <Tabs value={userType} onValueChange={setUserType} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                    <TabsTrigger value="visitor" className="text-xs px-2 py-2">
                      Visitor
                    </TabsTrigger>
                    <TabsTrigger value="exhibitor" className="text-xs px-2 py-2">
                      Exhibitor
                    </TabsTrigger>
                    {/* <TabsTrigger value="organiser" className="text-xs px-2 py-2">
                      Organiser
                    </TabsTrigger> */}
                    <TabsTrigger value="speaker" className="text-xs px-2 py-2">
                      Speaker
                    </TabsTrigger>
                    <TabsTrigger value="venue" className="text-xs px-2 py-2">
                      Venue
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Social Signup Buttons - Moved to top */}
                <div className="flex grid-cols-2 gap-4 justify-center">
                  <div className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2 py-2.5"
                      onClick={handleGoogleSignup}
                      disabled={isLoading}
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
                  </div>
                  {/* <div className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2 py-2.5"
                      onClick={handleLinkedInSignup}
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      <span>LinkedIn</span>
                    </Button>
                  </div> */}
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="flex grid-cols-2 gap-1">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    {/* Email Field */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex grid-cols-2 gap-1">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Company/Organization Name */}
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        name="companyName"
                        placeholder={getPlaceholderText()}
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.companyName ? "border-red-500" : ""}`}
                        required={isCompanyRequired()}
                      />
                      {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                    </div>
                  </div>

                  {/* Designation (for business users) */}
                  {userType !== "visitor" && (
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400">💼</div>
                      <Input
                        type="text"
                        name="designation"
                        placeholder="Designation/Title"
                        value={formData.designation}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  )}

                  {/* Website (for business users) */}
                  {["exhibitor", "organiser", "venue"].includes(userType) && (
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400">🌐</div>
                      <Input
                        type="url"
                        name="website"
                        placeholder="Website (Optional)"
                        value={formData.website}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.website ? "border-red-500" : ""}`}
                      />
                      {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
                    </div>
                  )}

                  {/* Password Field */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-2 text-sm">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-gray-600">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                        Privacy Policy
                      </Link>
                    </span>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                      Log in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {userType == "organiser" && (
            <div className="py-16">
              <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Worldwide Footprint</h2>

                {/* Partner Logos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {organizers.map((organizer) => (
                    <div
                      key={organizer.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition duration-200"
                    >
                      <div className="flex items-center justify-center h-10 mb-4">
                        <img
                          src={organizer.logo || "/placeholder.svg"}
                          alt={organizer.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{organizer.name}</h3>
                        <p className="text-xs text-gray-500">{organizer.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Organiser Pricing Section - Only shown when organiser tab is selected */}
          {userType === "organiser" && (
            <div className="space-y-12">
              {/* Pricing Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">From Invisible to Unmissable</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Select a package that fits your budget and reach requirements
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricingPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.popular ? "ring-2 ring-blue-500 shadow-lg" : ""} ${selectedPlan === plan.id ? "ring-2 ring-blue-600" : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Reach:</strong> {plan.reach}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Duration:</strong> {plan.duration}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full mt-6 ${
                          selectedPlan === plan.id
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : plan.popular
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        }`}
                        disabled={isLoading}
                      >
                        {selectedPlan === plan.id ? "Selected" : "Select Package"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Plan Comparison Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-xl font-bold text-gray-900">See Plan Comparison</h3>
                  <p className="text-sm text-gray-600 mt-1">Detailed feature comparison across all plans</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Feature
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Basic
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Premium
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enterprise
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {comparisonFeatures.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.feature}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {typeof item.basic === "boolean" ? (
                              item.basic ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-gray-700">{item.basic}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {typeof item.premium === "boolean" ? (
                              item.premium ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-gray-700">{item.premium}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {typeof item.enterprise === "boolean" ? (
                              item.enterprise ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-gray-700">{item.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
    </div>
  )

  if (variant === "dialog") {
    return content
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-[calc(60vh-54px)] py-12 px-4">{content}</div>
    </div>
  )
}