"use client";

import { useState, useTransition, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Files, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { Suspense } from "react";

type Tab = "login" | "signup";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<Tab>("login");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam === "signup") setTab("signup");
    }, [searchParams]);

    function handleLogin() {
        setError("");
        startTransition(async () => {
            const res = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid email or password");
                return;
            }

            router.push("/dashboard");
            router.refresh();
        });
    }

    function handleSignup() {
        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: form.email,
                        password: form.password,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error ?? "Failed to create account");
                    return;
                }

                setSuccess("Account created successfully! Redirecting...");
                
                // Auto login after signup
                const loginRes = await signIn("credentials", {
                    email: form.email,
                    password: form.password,
                    redirect: false,
                });

                if (loginRes?.error) {
                    setTab("login");
                    return;
                }

                router.push("/dashboard");
                router.refresh();
            } catch {
                setError("Something went wrong. Please try again.");
            }
        });
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans overflow-hidden">
            {/* Left Side: Branding & Info */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 p-12 lg:p-20 flex-col justify-between relative overflow-hidden">
                <Link href="/" className="flex items-center gap-2 relative z-10 group">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-900/20 group-hover:scale-105 transition-transform">
                        CF
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">CA FileTrack</span>
                </Link>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-8">
                        The ultimate management <br />
                        <span className="text-brand-500 text-3xl lg:text-4xl">portal for CA Professionals.</span>
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 shrink-0">
                                <Files className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Centralized Tracking</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Manage documents, tasks, and client files in one unified workspace.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Secure & Compliant</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Multi-tenant isolation ensuring your data never crosses paths with others.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 pt-12 border-t border-white/10 flex items-center justify-between">
                    <p className="text-xs text-slate-500">© 2026 CA FileTrack Systems</p>
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">System Online</span>
                    </div>
                </div>

                {/* Decorative background circle */}
                <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-brand-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-20 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link href="/" className="flex md:hidden items-center gap-2 mb-12 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg">
                            CF
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">CA FileTrack</span>
                    </Link>

                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                            {tab === "login" ? "Sign In" : "Create Account"}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {tab === "login" 
                                ? "Access your firm's dashboard" 
                                : "Join hundreds of firms already tracking smarter."}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                        <button
                            onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                                tab === "login" ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                                tab === "signup" ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <Input
                                type="email"
                                placeholder="name@firm.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                disabled={isPending}
                                className="h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    disabled={isPending}
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all pr-12 shadow-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {tab === "signup" && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    disabled={isPending}
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-none"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                {success}
                            </div>
                        )}

                        <Button
                            onClick={tab === "login" ? handleLogin : handleSignup}
                            disabled={isPending || !form.email || !form.password || (tab === "signup" && !form.confirmPassword)}
                            className="w-full h-14 rounded-2xl bg-brand-600 hover:bg-brand-700 text-lg font-black shadow-lg shadow-brand-100 transition-all active:scale-[0.98] mt-4"
                        >
                            {isPending ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                tab === "login" ? "Sign In" : "Get Started"
                            )}
                        </Button>

                        <p className="text-center text-slate-400 text-xs mt-8">
                            {tab === "login" 
                                ? "Don't have an account? Reach out to your administrator." 
                                : "By signing up, you agree to our Terms of Service."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
