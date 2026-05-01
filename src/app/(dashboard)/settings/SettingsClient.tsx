"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Settings2, Bell, Tag, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateFirmProfile, updatePreferences } from "./actions";

interface FirmProfile {
    name: string;
    gstin: string;
    email: string;
    phone: string;
    address: string;
}

interface Preferences {
    emailAlerts: boolean;
    overdueAlerts: boolean;
    paymentAlerts: boolean;
    defaultTaskView: string;
}

interface SettingsClientProps {
    initialFirmProfile: FirmProfile;
    initialPreferences: Preferences;
}

export function SettingsClient({ initialFirmProfile, initialPreferences }: SettingsClientProps) {
    const [firmProfile, setFirmProfile] = useState<FirmProfile>(initialFirmProfile);
    const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
    
    const [isSavingProfile, startSavingProfile] = useTransition();
    const [isSavingPrefs, startSavingPrefs] = useTransition();

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        startSavingProfile(async () => {
            const res = await updateFirmProfile(firmProfile);
            if (res.success) {
                toast.success("Firm profile updated successfully.");
            } else {
                toast.error(res.error || "Failed to update profile.");
            }
        });
    };

    const handleSavePreferences = (e: React.FormEvent) => {
        e.preventDefault();
        startSavingPrefs(async () => {
            const res = await updatePreferences(preferences);
            if (res.success) {
                toast.success("Preferences updated successfully.");
            } else {
                toast.error(res.error || "Failed to update preferences.");
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-border-base shadow-sm overflow-hidden">
            <Tabs defaultValue="profile" className="w-full flex flex-col md:flex-row">
                {/* Left Sidebar for Tabs */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border-base bg-slate-50/50">
                    <TabsList className="flex flex-row md:flex-col h-auto w-full bg-transparent p-3 gap-1 overflow-x-auto rounded-none">
                        <TabsTrigger 
                            value="profile" 
                            className="w-auto md:w-full justify-start px-4 py-3 text-sm font-semibold rounded-xl data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border-base whitespace-nowrap"
                        >
                            <Building2 className="w-4 h-4 mr-3" />
                            Firm Profile
                        </TabsTrigger>
                        <TabsTrigger 
                            value="preferences" 
                            className="w-auto md:w-full justify-start px-4 py-3 text-sm font-semibold rounded-xl data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border-base whitespace-nowrap"
                        >
                            <Settings2 className="w-4 h-4 mr-3" />
                            Preferences
                        </TabsTrigger>
                        <TabsTrigger 
                            value="tags" 
                            className="w-auto md:w-full justify-start px-4 py-3 text-sm font-semibold rounded-xl data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border-base whitespace-nowrap"
                        >
                            <Tag className="w-4 h-4 mr-3" />
                            Custom Tags
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 p-6 lg:p-8 min-h-[500px]">
                    <TabsContent value="profile" className="m-0 focus-visible:outline-none">
                        <div className="max-w-2xl">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Firm Profile</h3>
                                <p className="text-sm text-slate-500">Manage your firm's identity and contact details.</p>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firmName" className="text-slate-600">Firm Name</Label>
                                        <Input 
                                            id="firmName" 
                                            value={firmProfile.name} 
                                            onChange={e => setFirmProfile({...firmProfile, name: e.target.value})}
                                            className="h-11 bg-slate-50"
                                            disabled={isSavingProfile}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gstin" className="text-slate-600">GSTIN / Registration Number</Label>
                                        <div className="relative">
                                            <Input 
                                                id="gstin" 
                                                value={firmProfile.gstin} 
                                                onChange={e => setFirmProfile({...firmProfile, gstin: e.target.value})}
                                                className="h-11 bg-slate-50 pr-10 uppercase"
                                                disabled={isSavingProfile}
                                            />
                                            <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-600">Contact Email</Label>
                                        <Input 
                                            id="email" 
                                            type="email"
                                            value={firmProfile.email} 
                                            onChange={e => setFirmProfile({...firmProfile, email: e.target.value})}
                                            className="h-11 bg-slate-50"
                                            disabled={isSavingProfile}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-slate-600">Contact Phone</Label>
                                        <Input 
                                            id="phone" 
                                            value={firmProfile.phone} 
                                            onChange={e => setFirmProfile({...firmProfile, phone: e.target.value})}
                                            className="h-11 bg-slate-50"
                                            disabled={isSavingProfile}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-slate-600">Firm Address</Label>
                                    <Input 
                                        id="address" 
                                        value={firmProfile.address} 
                                        onChange={e => setFirmProfile({...firmProfile, address: e.target.value})}
                                        className="h-11 bg-slate-50"
                                        disabled={isSavingProfile}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <Button type="submit" disabled={isSavingProfile} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-soft min-w-[120px]">
                                        {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {isSavingProfile ? "Saving..." : "Save Profile"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="m-0 focus-visible:outline-none">
                        <div className="max-w-2xl">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Application Preferences</h3>
                                <p className="text-sm text-slate-500">Configure notifications and default behaviors.</p>
                            </div>

                            <form onSubmit={handleSavePreferences} className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        Notification Settings
                                    </h4>
                                    
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Email Alerts for Checkouts</p>
                                            <p className="text-xs text-slate-500">Get notified when a physical file is checked out or returned.</p>
                                        </div>
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={preferences.emailAlerts} 
                                                onChange={e => setPreferences({...preferences, emailAlerts: e.target.checked})}
                                                disabled={isSavingPrefs}
                                                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Overdue Task Reminders</p>
                                            <p className="text-xs text-slate-500">Receive daily summaries of tasks that have missed their due date.</p>
                                        </div>
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={preferences.overdueAlerts} 
                                                onChange={e => setPreferences({...preferences, overdueAlerts: e.target.checked})}
                                                disabled={isSavingPrefs}
                                                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Payment Dues Alerts</p>
                                            <p className="text-xs text-slate-500">Alerts for pending client payments.</p>
                                        </div>
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={preferences.paymentAlerts} 
                                                onChange={e => setPreferences({...preferences, paymentAlerts: e.target.checked})}
                                                disabled={isSavingPrefs}
                                                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <Button type="submit" disabled={isSavingPrefs} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-soft min-w-[150px]">
                                        {isSavingPrefs ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {isSavingPrefs ? "Saving..." : "Save Preferences"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </TabsContent>

                    <TabsContent value="tags" className="m-0 focus-visible:outline-none">
                        <div className="max-w-2xl">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Custom Tags & Filing</h3>
                                <p className="text-sm text-slate-500">Standardize your document and task tags for easier search.</p>
                            </div>
                            
                            <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
                                <h4 className="text-sm font-bold text-amber-800 mb-2">Coming Soon</h4>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    The ability to fully customize your firm's default filing types (beyond the standard ITR, GST, TDS, Audit) and document tags is currently in development. You can continue to use the "Custom" filing type field on individual tasks.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
