"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { UploadCloud, File, FileText, CheckCircle2, AlertCircle, RefreshCw, X, FileCheck2, ArrowRight, FolderPlus } from "lucide-react";
import { parseFile } from "@/lib/import/parser";
import type { ParsedFile, FieldMapping, ImportSummary } from "@/types/import";
import type { StorageTreeNode } from "@/types/storage";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";

type ImportStep = "upload" | "mapping" | "importing" | "done";

export default function ImportClientsPage() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<FieldMapping | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [locations, setLocations] = useState<StorageTreeNode[]>([]);
  const [selectedParentLocation, setSelectedParentLocation] = useState<string>("none");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch storage locations on mount
  useEffect(() => {
    fetch("/api/storage-locations")
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.error("Failed to fetch storage locations:", err));
  }, []);

  // Helper to flatten tree for dropdown
  const getFlattenedLocations = (nodes: StorageTreeNode[], level = 0): { id: string, name: string, level: number }[] => {
    let result: { id: string, name: string, level: number }[] = [];
    nodes.forEach(node => {
      result.push({ id: node.id, name: node.name, level });
      if (node.children && node.children.length > 0) {
        result = [...result, ...getFlattenedLocations(node.children, level + 1)];
      }
    });
    return result;
  };

  // -- Step 1: Upload & Parse --
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // 1. Client-side parsing (handles CSV, TSV, Excel)
      const parsed = await parseFile(file);
      setParsedFile(parsed);

      if (parsed.fileType === "pdf") {
         toast.error("PDF support coming soon! Please use CSV or Excel for now.");
         setIsProcessing(false);
         return;
      }

      if (parsed.rows.length === 0) {
         toast.error("File appears to be empty or could not be read.");
         setIsProcessing(false);
         return;
      }

      // 2. Call AI to analyze headers
      toast.info("AI is analyzing your columns...");
      const res = await fetch("/api/import/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: parsed.headers,
          sampleRows: parsed.rows.slice(0, 5)
        }),
      });

      if (!res.ok) throw new Error("Failed to analyze columns");
      
      const data = await res.json();
      setMapping(data.mapping);
      setStep("mapping");

    } catch (err) {
      console.error(err);
      toast.error("Failed to process file. Please ensure it's a valid CSV/Excel file.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && fileInputRef.current) {
        // Trigger the input change manually
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        handleFileUpload({ target: { files: dataTransfer.files } } as any);
      }
    },
    []
  );

  // -- Step 2: Mapping Review --
  const handleMappingChange = (field: keyof FieldMapping, column: string) => {
    if (!mapping) return;
    setMapping({
      ...mapping,
      [field]: { column: column === "none" ? null : column, confidence: 100 }
    });
  };

  const handleStartImport = async () => {
    if (!parsedFile || !mapping) return;
    setStep("importing");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/import/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapping,
          rows: parsedFile.rows,
          parentLocationId: selectedParentLocation === "none" ? null : selectedParentLocation,
          duplicateResolutions: {}, // For v1, let's keep it simple: server will flag duplicates as pending_review
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      
      setSummary(data);
      setStep("done");
      toast.success("Import processing complete");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong during import");
      setStep("mapping");
    } finally {
      setIsProcessing(false);
    }
  };

  // -- Render Helpers --
  const renderUpload = () => (
    <div className="max-w-2xl mx-auto mt-8">
      <div 
        className="border-2 border-dashed border-brand-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:bg-brand-50/50 transition-colors cursor-pointer bg-white"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6">
          {isProcessing ? (
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 text-brand-600" />
          )}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {isProcessing ? "Processing File..." : "Upload your client data"}
        </h3>
        <p className="text-slate-500 mb-6 max-w-sm">
          Drag and drop your Excel (.xlsx) or CSV file here, or click to browse. We use AI to automatically map your columns.
        </p>
        <Button disabled={isProcessing} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm px-8">
          {isProcessing ? "Analyzing..." : "Select File"}
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".csv,.xlsx,.xls"
        />
      </div>

      <div className="grid grid-cols-3 gap-6 mt-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <FileText className="w-6 h-6 text-brand-500 mb-3" />
          <h4 className="font-semibold text-slate-900">Any Format</h4>
          <p className="text-sm text-slate-500 mt-1">Export from Tally, Winman, or your own Excel tracker.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-3" />
          <h4 className="font-semibold text-slate-900">AI Column Mapping</h4>
          <p className="text-sm text-slate-500 mt-1">We automatically match your columns to our system.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <FileCheck2 className="w-6 h-6 text-blue-500 mb-3" />
          <h4 className="font-semibold text-slate-900">Duplicate Check</h4>
          <p className="text-sm text-slate-500 mt-1">We verify PAN numbers to prevent duplicate entries.</p>
        </div>
      </div>
    </div>
  );

  const renderMapping = () => {
    if (!mapping || !parsedFile) return null;
    const flattenedLocations = getFlattenedLocations(locations);
    
    return (
      <div className="max-w-4xl mx-auto mt-6 flex flex-col gap-6">
        {/* Physical Storage Integration */}
        <div className="bg-white rounded-3xl border border-brand-100 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Physical Storage Folders</h3>
              <p className="text-sm text-slate-500">Automatically create filing folders for each imported client</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex-1">
               <p className="text-sm font-medium text-slate-700 mb-1">Parent Location</p>
               <p className="text-xs text-slate-500">Pick where the new client folders should be created (e.g., Cupboard A &gt; Shelf 1)</p>
            </div>
            <Select value={selectedParentLocation} onValueChange={setSelectedParentLocation}>
              <SelectTrigger className="w-full sm:w-72 rounded-xl bg-white border-slate-200">
                <SelectValue placeholder="Do not create folders" />
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl">
                <SelectItem value="none" className="text-slate-400 italic">-- Do not create folders --</SelectItem>
                {flattenedLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {'\u00A0'.repeat(loc.level * 4)} {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Review AI Mapping</h3>
              <p className="text-sm text-slate-500 mt-1">
                Found {parsedFile.rows.length} rows. Please confirm how columns match.
              </p>
            </div>
            <Button 
              onClick={handleStartImport} 
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm gap-2"
            >
              Start Import <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Our System Field</th>
                  <th className="px-6 py-4 w-1/2">Your Column Name</th>
                  <th className="px-6 py-4">AI Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(mapping) as Array<keyof FieldMapping>).map((field) => {
                  const mapData = mapping[field];
                  return (
                    <tr key={field} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900 capitalize">
                        {field} {field === 'name' && <span className="text-red-500 ml-1">*</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          value={mapData.column || "none"} 
                          onValueChange={(val) => handleMappingChange(field, val)}
                        >
                          <SelectTrigger className="w-full rounded-xl bg-white border-slate-200">
                            <SelectValue placeholder="Select column..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 rounded-xl">
                            <SelectItem value="none" className="text-slate-400 italic">-- Skip this field --</SelectItem>
                            {parsedFile.headers.map((h, i) => (
                              <SelectItem key={i} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        {mapData.column ? (
                           mapData.confidence > 80 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> High Match
                              </span>
                           ) : mapData.confidence > 40 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs font-semibold">
                                <AlertCircle className="w-3.5 h-3.5" /> Plausible
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                                Manual
                              </span>
                           )
                        ) : (
                           <span className="text-slate-400 italic text-xs">Skipped</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderImporting = () => (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <RefreshCw className="w-10 h-10 text-brand-600 animate-spin" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Importing Data...</h3>
      <p className="text-slate-500 mb-8">Please wait while we securely save your clients. Do not close this page.</p>
      <Progress value={undefined} className="h-2 w-full bg-slate-100" />
    </div>
  );

  const renderDone = () => {
    if (!summary) return null;
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-3xl font-bold text-slate-900 mb-2">Import Complete!</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          We have finished processing your file. Here's what happened:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm mb-1 font-medium">Total Rows</p>
            <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <p className="text-emerald-700 text-sm mb-1 font-medium">Imported</p>
            <p className="text-2xl font-bold text-emerald-700">{summary.imported}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <p className="text-amber-700 text-sm mb-1 font-medium">Duplicates</p>
            <p className="text-2xl font-bold text-amber-700">{summary.duplicates.length}</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <p className="text-red-700 text-sm mb-1 font-medium">Failed</p>
            <p className="text-2xl font-bold text-red-700">{summary.failed}</p>
          </div>
        </div>

        {summary.duplicates.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left flex gap-3">
             <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
             <div>
                <h4 className="text-amber-900 font-semibold mb-1">Duplicate PANs Found</h4>
                <p className="text-amber-700 text-sm">
                  We skipped {summary.duplicates.length} clients because their PAN already exists in your database. 
                  (A resolution tool for duplicates is coming in a future update).
                </p>
             </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => { setStep("upload"); setParsedFile(null); setMapping(null); setSummary(null); }}
            className="rounded-xl px-6"
          >
            Import Another File
          </Button>
          <Button 
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 shadow-sm"
            onClick={() => window.location.href = '/clients'}
          >
            View Clients
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Import Data" 
        description="Bring your clients from Tally, Winman, or Excel into the system" 
      />
      
      <div className="flex-1 px-4 sm:px-0">
        {step === "upload" && renderUpload()}
        {step === "mapping" && renderMapping()}
        {step === "importing" && renderImporting()}
        {step === "done" && renderDone()}
      </div>
    </div>
  );
}
