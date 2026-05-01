"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { StorageTreeNode } from "@/types/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronDown, Plus, Folder, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface StorageTreeRef {
    openAddRoot: () => void;
}

interface StorageTreeProps {
    tree: StorageTreeNode[];
    selectedNodeId: string | null;
    onSelectNode: (id: string) => void;
    onTreeChange: () => void;
}

export const StorageTree = forwardRef<StorageTreeRef, StorageTreeProps>(
    function StorageTree({ tree, selectedNodeId, onSelectNode, onTreeChange }, ref) {
        const [isAddOpen, setIsAddOpen] = useState(false);
        const [addParentId, setAddParentId] = useState<string | null>(null);
        const [addName, setAddName] = useState("");
        const [addLabel, setAddLabel] = useState("");
        const [isSubmitting, setIsSubmitting] = useState(false);

        const openAddDialog = (parentId: string | null = null) => {
            setAddParentId(parentId);
            setAddName("");
            setAddLabel("");
            setIsAddOpen(true);
        };

        // Expose openAddRoot to the parent via ref
        useImperativeHandle(ref, () => ({
            openAddRoot: () => openAddDialog(null),
        }));

        const handleAddNode = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!addName.trim()) return;

            setIsSubmitting(true);
            try {
                const res = await fetch("/api/storage-locations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        parentId: addParentId,
                        name: addName.trim(),
                        levelLabel: addLabel.trim() || null,
                    }),
                });

                if (!res.ok) throw new Error("Failed to add location");

                toast.success("Location added successfully");
                setAddName("");
                setAddLabel("");
                setIsAddOpen(false);
                onTreeChange();
            } catch (error) {
                toast.error("Error adding location");
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <>
                <div className="space-y-1">
                    {tree.length === 0 ? (
                        <div className="text-center py-8 text-text-muted text-sm">
                            No locations yet. Click "Add Root Location" to begin.
                        </div>
                    ) : (
                        tree.map(node => (
                            <TreeNode
                                key={node.id}
                                node={node}
                                selectedNodeId={selectedNodeId}
                                onSelectNode={onSelectNode}
                                onAddChildNode={openAddDialog}
                            />
                        ))
                    )}
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="rounded-[24px]">
                        <DialogHeader>
                            <DialogTitle>{addParentId ? "Add Sub-Location" : "Add Root Location"}</DialogTitle>
                            <DialogDescription>
                                Create a new storage location in your firm&apos;s hierarchy.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddNode} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name *</label>
                                <Input
                                    value={addName}
                                    onChange={(e) => setAddName(e.target.value)}
                                    placeholder="e.g. Cupboard A, Shelf 2"
                                    className="rounded-xl"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Level Label (Optional)</label>
                                <Input
                                    value={addLabel}
                                    onChange={(e) => setAddLabel(e.target.value)}
                                    placeholder="e.g. Cupboard, Shelf, Drawer"
                                    className="rounded-xl"
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting || !addName.trim()} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
                                    {isSubmitting ? "Adding..." : "Add Location"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
);

function TreeNode({
    node,
    selectedNodeId,
    onSelectNode,
    onAddChildNode,
}: {
    node: StorageTreeNode,
    selectedNodeId: string | null,
    onSelectNode: (id: string) => void,
    onAddChildNode: (parentId: string) => void,
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNodeId === node.id;

    return (
        <div className="space-y-0.5">
            <div
                className={cn(
                    "flex items-center group py-1.5 px-2 rounded-lg cursor-pointer transition-colors border border-transparent",
                    isSelected ? "bg-brand-50 border-brand-100" : "hover:bg-bg-main"
                )}
                onClick={() => onSelectNode(node.id)}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="w-5 h-5 flex items-center justify-center shrink-0 mr-1 text-text-muted hover:text-brand-600"
                    disabled={!hasChildren}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="w-[14px] h-[14px]" /> : <ChevronRight className="w-[14px] h-[14px]" />
                    ) : (
                        <div className="w-[14px] h-[14px]" />
                    )}
                </button>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {hasChildren ? (
                        isExpanded ? <FolderOpen className={cn("w-4 h-4", isSelected ? "text-brand-600" : "text-brand-400")} />
                                   : <Folder className={cn("w-4 h-4", isSelected ? "text-brand-600" : "text-brand-400")} />
                    ) : (
                        <Folder className={cn("w-4 h-4", isSelected ? "text-brand-600" : "text-slate-400")} />
                    )}
                    <span className={cn(
                        "font-medium truncate text-[13px]",
                        isSelected ? "text-brand-700 font-semibold" : "text-text-dark"
                    )}>
                        {node.name}
                    </span>
                    {node.levelLabel && (
                        <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-text-muted border border-border-base hidden lg:inline-block">
                            {node.levelLabel}
                        </span>
                    )}
                </div>

                <div className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity flex items-center",
                    isSelected ? "opacity-100" : ""
                )}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-md text-brand-600 hover:text-brand-700 hover:bg-brand-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddChildNode(node.id);
                        }}
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="ml-4 pl-3 border-l border-border-base space-y-0.5">
                    {node.children.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            selectedNodeId={selectedNodeId}
                            onSelectNode={onSelectNode}
                            onAddChildNode={onAddChildNode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
