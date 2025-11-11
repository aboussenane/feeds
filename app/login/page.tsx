"use client"

import { useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import HCaptcha from "@hcaptcha/react-hcaptcha"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha>(null)
  
  // Create client lazily only when component mounts (not during build)
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      // During SSR/build, return null - will be initialized on client
      return null as ReturnType<typeof createClient> | null
    }
    return createClient()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError("Supabase client not initialized")
      return
    }
    
    // Require captcha for both sign up and login
    if (!captchaToken) {
      setError("Please complete the captcha verification")
      return
    }
    
    // Validate password match for sign up
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match. Please try again.")
      return
    }
    
    setLoading(true)
    setError("")

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            captchaToken: captchaToken || undefined,
          },
        })
        if (error) throw error
        // Show success message
        setError("Check your email to confirm your account!")
        // Reset captcha and passwords after successful sign up
        captchaRef.current?.resetCaptcha()
        setCaptchaToken(null)
        setPassword("")
        setConfirmPassword("")
      } else {
        // Login - captcha required
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            captchaToken: captchaToken || undefined,
          },
        })
        if (error) {
          // Provide more specific error messages
          const errorMsg = error.message.toLowerCase()
          if (errorMsg.includes('500') || errorMsg.includes('internal server error')) {
            throw new Error('Authentication service error. Please check Supabase dashboard logs or try again later.')
          }
          throw error
        }
        if (!data.session) {
          throw new Error('Login failed: No session created')
        }
        // Reset captcha after successful login
        captchaRef.current?.resetCaptcha()
        setCaptchaToken(null)
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      // Better error handling with more context
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase()
        if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
          setError('Invalid email or password. Please try again.')
        } else if (errorMessage.includes('email not confirmed') || errorMessage.includes('email_not_confirmed')) {
          setError('Please check your email and confirm your account before logging in.')
        } else if (errorMessage.includes('captcha') || errorMessage.includes('captcha_failed') || errorMessage.includes('captcha verification')) {
          setError('Captcha verification failed. Please complete the captcha and try again.')
        } else if (errorMessage.includes('500') || errorMessage.includes('internal server error')) {
          setError('Server error during login. Please check Supabase dashboard logs or try again later.')
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      // Reset captcha on error
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? "Sign Up" : "Login"}</CardTitle>
            <CardDescription>
              {isSignUp
                ? "Create an account to start hosting feeds"
                : "Enter your credentials to access your feeds"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-destructive">Passwords do not match</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Verification</Label>
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => {
                    setCaptchaToken(null)
                    setError("Captcha verification failed. Please try again.")
                  }}
                />
              </div>

              {error && (
                <div className={`text-sm p-3 rounded-md ${
                  error.includes("Check your email")
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={
                  loading || 
                  !captchaToken || 
                  (isSignUp && (password !== confirmPassword || !confirmPassword))
                }
              >
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError("")
                    setPassword("")
                    setConfirmPassword("")
                    setCaptchaToken(null)
                    // Reset captcha when switching modes
                    if (captchaRef.current) {
                      captchaRef.current.resetCaptcha()
                    }
                  }}
                  className="text-primary hover:underline"
                >
                  {isSignUp
                    ? "Already have an account? Login"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

