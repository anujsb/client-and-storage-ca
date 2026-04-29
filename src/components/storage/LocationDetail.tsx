"use client";

import { useState } from "react";
import { StorageTreeNode } from "@/types/storage";
import { Button } from "@/components/ui/button";
import { ChevronRight, Pencil, Trash2, Printer, Server } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LocationDocumentsTable } from "./LocationDocumentsTable";

interface LocationDetailProps {
    node: StorageTreeNode;
    breadcrumbPath: StorageTreeNode[];
    onTreeChange: () => void;
}

export function LocationDetail({ node, breadcrumbPath, onTreeChange }: LocationDetailProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editLabel, setEditLabel] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEditNode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/storage-locations/${node.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editName.trim(),
                    levelLabel: editLabel.trim() || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to update location");

            toast.success("Location updated successfully");
            setIsEditOpen(false);
            onTreeChange();
        } catch (error) {
            toast.error("Error updating location");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNode = async () => {
        if (!confirm("Are you sure you want to delete this location and all its sub-locations? Documents in these locations will lose their specific location assignment.")) {
            return;
        }

        try {
            const res = await fetch(`/api/storage-locations/${node.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete location");

            toast.success("Location deleted successfully");
            onTreeChange();
        } catch (error) {
            toast.error("Error deleting location");
        }
    };

    const openEditDialog = () => {
        setEditName(node.name);
        setEditLabel(node.levelLabel || "");
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Top Detail Card */}
            <div className="bg-white rounded-[24px] border border-border-base shadow-soft p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 text-[13px] font-medium text-text-muted mb-2">
                            {breadcrumbPath.map((crumb, idx) => (
                                <div key={crumb.id} className="flex items-center gap-2">
                                    <span className={idx === breadcrumbPath.length - 1 ? "text-brand-600 font-semibold" : ""}>
                                        {crumb.name}
                                    </span>
                                    {idx < breadcrumbPath.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <Server className="w-7 h-7 text-slate-400" />
                            <h2 className="text-2xl font-bold text-brand-900 tracking-tight">{node.name}</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-xl h-9 px-3 text-text-dark border-border-base shadow-sm hidden md:flex">
                            <Printer className="w-4 h-4 mr-2" />
                            Print Labels
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={openEditDialog}
                            className="rounded-xl h-9 w-9 p-0 text-text-dark border-border-base shadow-sm"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleDeleteNode}
                            className="rounded-xl h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border-light">
                    <div>
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Capacity Overview</h3>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-semibold text-brand-900"></span>
                            <span className="font-bold text-brand-900">65% Full</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-brand-500 rounded-full w-[65%]" />
                        </div>
                        <div className="flex items-center gap-6 text-[13px] text-text-muted">
                            <p>Total Items: <span className="font-semibold text-text-dark">1,240</span></p>
                            <p>Sub-locations: <span className="font-semibold text-text-dark">{node.children?.length || 0}</span></p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Notes</h3>
                        <p className="text-[13px] text-text-dark leading-relaxed">
                            {node.levelLabel ? `This is designated as a ${node.levelLabel}. ` : ""}
                            Primary storage for active FY22-23 and FY23-24 audit files. 
                            Ensure sensitive documents are placed in locked sections.
                        </p>
                    </div>
                </div>
            </div>

            {/* Documents Table Component */}
            <LocationDocumentsTable locationId={node.id} locationName={node.name} />

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="rounded-[24px]">
                    <DialogHeader>
                        <DialogTitle>Edit Location</DialogTitle>
                        <DialogDescription>
                            Update the name or label of this storage location.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditNode} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name *</label>
                            <Input 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)} 
                                className="rounded-xl"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Level Label (Optional)</label>
                            <Input 
                                value={editLabel} 
                                onChange={(e) => setEditLabel(e.target.value)} 
                                className="rounded-xl"
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !editName.trim()} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
