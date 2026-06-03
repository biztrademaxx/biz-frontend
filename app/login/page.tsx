"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Check, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginWithEmailPassword, consumeLogoutSuccessBanner } from "@/lib/api"
import {
  clearOAuthSignupIntentRole,
  clearOAuthSignupIntentRoleServer,
} from "@/lib/oauth-signup-intent"

export default function LoginPage() {
  const router = useRouter()
  useEffect(() => {
    clearOAuthSignupIntentRole()
    void clearOAuthSignupIntentRoleServer()
  }, [])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (consumeLogoutSuccessBanner()) {
      setLogoutDialogOpen(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const q = new URLSearchParams(window.location.search)
    if (q.get("registered") === "organizer") {
      setInfoMessage(
        "Your organizer account was created. An administrator must approve it before you can sign in. You will receive access once approved.",
      )
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setInfoMessage("")

    try {
      const result = await loginWithEmailPassword(email, password)
      const user = result.user
      const role = (user?.role || "").toString().toUpperCase()
      const userId = user?.sub ?? (user as any)?.id

      if (role === "ATTENDEE") {
        router.push(`/dashboard/${userId}`)
      } else if (role === "ORGANIZER") {
        router.push(`/organizer-dashboard/${userId}`)
      } else if (role === "SUPER_ADMIN" || role === "SUPERADMIN" || role === "SUB_ADMIN") {
        router.push("/admin-dashboard")
      } else if (role === "EXHIBITOR") {
        router.push(`/exhibitor-dashboard/${userId}`)
      } else if (role === "SPEAKER") {
        router.push(`/speaker-dashboard/${userId}`)
      } else if (role === "VENUE_MANAGER") {
        router.push("/venue-dashboard")
      } else {
        router.push("/")
      }
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      console.error("Error during Google login:", err)
      setError("Failed to login with Google.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkedInLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("linkedin", { callbackUrl: "/" })
    } catch (err) {
      console.error("Error during LinkedIn login:", err)
      setError("Failed to login with LinkedIn.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Image
                src="/logo/biztradefairs_new2.png"
              alt="TradeFairs.com Logo"
              width={150}
              height={150}
              className="h-auto w-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-600 mt-2">Sign in to your account</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 py-2.5"
              onClick={handleGoogleLogin}
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
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 py-2.5 text-[#0077b5] border-[#0077b5]/30"
              onClick={handleLinkedInLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>LinkedIn</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Credentials Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot password?
              </Link>
            </div>

            {infoMessage && (
              <Alert className="border-blue-200 bg-blue-50 text-blue-900">
                <AlertDescription>{infoMessage}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>

    <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
      <DialogContent className="overflow-hidden border-[#e8e4f0] bg-white shadow-[0_20px_50px_rgba(142,84,233,0.18)] sm:max-w-md">
        <DialogHeader className="items-center space-y-0 text-center sm:text-center">
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8E54E9]/20 to-[#4776E6]/15 text-[#5b21b6] ring-2 ring-[#8E54E9]/20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
          >
          <DialogTitle className="text-xl font-semibold text-gray-900">Account logged out</DialogTitle>
          <DialogDescription className="pt-3 text-base leading-relaxed text-gray-600">
            Stay logged in for more latest updates.
          </DialogDescription>
          </motion.div>
        </DialogHeader>
        <DialogFooter className="mt-2 sm:justify-center">
          <Button
            type="button"
            className="w-full bg-gradient-to-r from-[#8E54E9] to-[#4776E6] text-white hover:opacity-[0.96] sm:w-auto sm:min-w-[140px]"
            onClick={() => setLogoutDialogOpen(false)}
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}