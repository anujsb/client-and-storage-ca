"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DocumentsClient() {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/documents");
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            } else {
                toast.error("Failed to load documents");
            }
        } catch (error) {
            toast.error("An error occurred while loading documents");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white p-5 rounded-[24px] border border-border-base shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Document Code / Name</label>
                            <Input placeholder="e.g. C-0001-D-01" className="rounded-xl h-10" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Client</label>
                            <Select>
                                <SelectTrigger className="rounded-xl h-10">
                                    <SelectValue placeholder="All Clients" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Clients</SelectItem>
                                    <SelectItem value="c1">TechFlow Industries</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Doc Type</label>
                            <Select>
                                <SelectTrigger className="rounded-xl h-10">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="audit">Audit</SelectItem>
                                    <SelectItem value="tax">Tax</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-1/3 space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Status</label>
                            <Select>
                                <SelectTrigger className="rounded-xl h-10">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="in_office">In Office</SelectItem>
                                    <SelectItem value="checked_out">Checked Out</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end h-full pt-6">
                            <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-10 px-6">
                                Search
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[24px] border border-border-base shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-border-light flex items-center justify-between">
                        <h3 className="text-base font-bold text-brand-900 tracking-tight">Document Inventory</h3>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="rounded-xl h-9 px-4 text-text-dark border-border-base shadow-sm hidden md:flex">
                                <Printer className="w-4 h-4 mr-2" />
                                Print Labels
                            </Button>
                            <DocumentForm onSuccess={fetchDocuments} />
                        </div>
                    </div>
                    
                    {isLoading ? (
                        <div className="p-8 text-center text-text-muted">Loading documents...</div>
                    ) : (
                        <DocumentTable documents={documents} />
                    )}
                </div>
            </div>

            {/* Right Column: Tracking & Checkouts Feed */}
            <div className="space-y-6">
                <div className="bg-white rounded-[24px] border border-border-base shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <h3 className="font-bold text-brand-900 tracking-tight">Tracking & Checkouts</h3>
                    </div>
                    <p className="text-xs text-text-muted mb-6">Recent document movements</p>
                    
                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-base before:to-transparent">
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-amber-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0" />
                            <div className="w-full pl-8">
                                <div className="bg-white p-3 rounded-xl border border-border-base shadow-sm">
                                    <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-text-muted uppercase">
                                        <span className="text-amber-600">Checked Out</span>
                                        <span>Today, 10:30 AM</span>
                                    </div>
                                    <div className="text-brand-600 font-semibold text-xs">C-0001-D-02</div>
                                    <div className="text-brand-900 font-bold text-[13px] mb-2 leading-tight">Incorporation Certificate</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-[9px] font-bold text-brand-700">RM</div>
                                        <span className="text-xs text-text-dark font-medium">by Rahul M.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0" />
                            <div className="w-full pl-8">
                                <div className="bg-white p-3 rounded-xl border border-border-base shadow-sm">
                                    <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-text-muted uppercase">
                                        <span className="text-green-600">Checked In</span>
                                        <span>Yesterday, 4:15 PM</span>
                                    </div>
                                    <div className="text-brand-600 font-semibold text-xs">C-0089-D-04</div>
                                    <div className="text-brand-900 font-bold text-[13px] mb-2 leading-tight">Q2 Bank Statements</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-[9px] font-bold text-brand-700">PS</div>
                                        <span className="text-xs text-text-dark font-medium">by Priya S.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0" />
                            <div className="w-full pl-8">
                                <div className="bg-white p-3 rounded-xl border border-border-base shadow-sm bg-red-50/30">
                                    <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-text-muted uppercase">
                                        <span className="text-red-600">Marked Missing</span>
                                        <span>Nov 05, 09:00 AM</span>
                                    </div>
                                    <div className="text-brand-600 font-semibold text-xs">C-0042-D-05</div>
                                    <div className="text-brand-900 font-bold text-[13px] mb-2 leading-tight">Original Title Deed</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">SA</div>
                                        <span className="text-xs text-text-muted font-medium">System Audit</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full mt-4 rounded-xl text-text-dark font-semibold h-10 border-border-base">
                        View Full History Log
                    </Button>
                </div>
            </div>
        </div>
    );
}
