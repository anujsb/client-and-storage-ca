import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Files, Users, Briefcase, IndianRupee, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            {/* Navigation */}
            <nav className="h-20 flex items-center justify-between px-4 sm:px-8 md:px-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-200 shrink-0">
                        CF
                    </div>
                    <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">CA FileTrack</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-6">
                    <Link href="/login" className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors whitespace-nowrap">
                        Sign In
                    </Link>
                    <Button asChild size="sm" className="rounded-full px-4 sm:px-6 bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-100 text-xs sm:text-sm h-9 sm:h-10">
                        <Link href="/login?tab=signup">Get Started</Link>
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-20 pb-32 px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Zap className="w-3 h-3" /> Built for modern CA firms
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Track Every File. <br />
                        <span className="text-brand-600">Master Every Deadline.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        The ultimate management portal for Chartered Accountants. Organize clients, automate document tracking, and manage payments—all in one secure place.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-brand-600 hover:bg-brand-700 text-lg font-bold shadow-xl shadow-brand-200">
                            <Link href="/login">Start Managing for Free <ArrowRight className="ml-2 w-5 h-5" /></Link>
                        </Button>
                        <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors px-6">
                            See how it works
                        </Link>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-100/50 rounded-full blur-[120px] pointer-events-none -z-10" />
            </header>

            {/* Features Grid */}
            <section id="features" className="py-24 px-8 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Everything your firm needs</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">Designed by CA professionals, for CA professionals. Seamlessly integrated modules to keep your work flowing.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all hover:shadow-xl hover:shadow-brand-50 group">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Client Management</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Centralized database for all client records, contacts, and filing histories.</p>
                        </div>

                        <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50 group">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Files className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Document Tracking</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Know exactly where every file is. Track checkouts, check-ins, and office locations.</p>
                        </div>

                        <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all hover:shadow-xl hover:shadow-amber-50 group">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Task Automation</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Collaborative workspace for tracking returns, audits, and sub-tasks with status alerts.</p>
                        </div>

                        <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-50 group">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Payment Tracking</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Monitor outstanding fees, record payments, and manage due dates effortlessly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Security */}
            <section className="py-20 px-8 bg-slate-900 text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="max-w-lg">
                        <div className="flex items-center gap-2 text-brand-400 font-bold mb-4">
                            <ShieldCheck className="w-6 h-6" /> Secure & Compliant
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Built on Bank-Grade Security Infrastructure</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Your clients' sensitive data is protected with 256-bit encryption and multi-tenant isolation. Rest easy knowing your files are safe.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-3xl font-black mb-1">99.9%</div>
                            <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Uptime</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-3xl font-black mb-1">100%</div>
                            <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Isolated Data</div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
            </section>

            {/* CTA Section */}
            <section className="py-32 px-8">
                <div className="max-w-4xl mx-auto rounded-[40px] bg-brand-600 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-brand-200">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8 relative z-10">
                        Ready to revolutionize your firm?
                    </h2>
                    <p className="text-brand-100 text-lg mb-10 relative z-10">
                        Join hundreds of CA firms using FileTrack to streamline their operations.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="h-16 px-10 rounded-2xl text-lg font-black text-brand-600 shadow-lg relative z-10">
                        <Link href="/login?tab=signup">Get Started Now</Link>
                    </Button>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-8 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2 opacity-50 grayscale">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                            CF
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tight">CA FileTrack</span>
                    </div>
                    <p className="text-xs text-slate-400">© 2026 CA FileTrack. All rights reserved.</p>
                    <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
