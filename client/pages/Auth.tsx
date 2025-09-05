import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [success, setSuccess] = useState(false);

  // Validate form
  const validate = () => {
    const newErrors = { name: "", email: "", password: "" };
    let isValid = true;

    if (mode === "signup" && !form.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (mode === "signup" && form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Redirect after successful signup/login
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const submit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      
      toast.success(`${mode === "login" ? "Welcome back" : "Account created successfully! Welcome email sent."}`);
      setSuccess(true);
      
      // save session
      try {
        const { useAuth } = await import("@/store/auth");
        useAuth.getState().setSession(data.user, data.token);
      } catch {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
      }
    } catch (e: any) {
      let errorMessage = e?.message || "Something went wrong";
      if (errorMessage === "email_exists") {
        errorMessage = "This email is already registered";
      } else if (errorMessage === "invalid_credentials") {
        errorMessage = "Invalid email or password";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_600px_at_10%_-20%,hsl(var(--neon-violet)/0.15),transparent),radial-gradient(800px_500px_at_90%_10%,hsl(var(--neon-teal)/0.15),transparent)]">
      <div className="container py-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center"
            >
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-700 bg-clip-text text-transparent">
                {mode === "login" ? "Welcome Back!" : "Account Created!"}
              </h2>
              <p className="text-muted-foreground mb-4">
                {mode === "login" 
                  ? "You've successfully logged in. Redirecting to your dashboard..." 
                  : "Your account has been created successfully. A welcome email has been sent to your inbox. Redirecting to dashboard..."}
              </p>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-700"
                />
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-700 bg-clip-text text-transparent">
                  {mode === "login" ? "Welcome Back" : "Create Your Account"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "login" 
                    ? "Sign in to access your financial dashboard" 
                    : "Join thousands of users managing their finances"}
                </p>
              </div>
              
              {mode === "signup" && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      className={`w-full rounded-xl bg-background/60 border ${errors.name ? 'border-red-500' : 'border-white/10'} pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/60`} 
                      value={form.name} 
                      onChange={(e) => {
                        setForm(s => ({...s, name: e.target.value}));
                        if (errors.name) setErrors({...errors, name: ""});
                      }} 
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  <p className="text-xs text-muted-foreground mt-1">You'll receive a welcome email after creating your account.</p>
                </div>
              )}
              
              <div className="mb-4">
                <label className="text-sm font-medium mb-1 block">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    className={`w-full rounded-xl bg-background/60 border ${errors.email ? 'border-red-500' : 'border-white/10'} pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/60`} 
                    value={form.email} 
                    onChange={(e) => {
                      setForm(s => ({...s, email: e.target.value}));
                      if (errors.email) setErrors({...errors, email: ""});
                    }} 
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              
              <div className="mb-6">
                <label className="text-sm font-medium mb-1 block">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className={`w-full rounded-xl bg-background/60 border ${errors.password ? 'border-red-500' : 'border-white/10'} pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/60`} 
                    value={form.password} 
                    onChange={(e) => {
                      setForm(s => ({...s, password: e.target.value}));
                      if (errors.password) setErrors({...errors, password: ""});
                    }} 
                    placeholder={mode === "signup" ? "Min. 8 characters" : "Enter your password"}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              
              <Button 
                disabled={loading} 
                onClick={submit} 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 py-2.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                )}
              </Button>
              
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-sm text-indigo-300 hover:text-indigo-200"
                >
                  {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
