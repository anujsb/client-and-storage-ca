"use client";

import { useState, useEffect } from "react";
import { StorageTreeNode } from "@/types/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, Folder, FolderOpen, MoreVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function StorageTree() {
    const [tree, setTree] = useState<StorageTreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Dialog states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [addParentId, setAddParentId] = useState<string | null>(null);
    const [addName, setAddName] = useState("");
    const [addLabel, setAddLabel] = useState("");
    
    const [editNodeId, setEditNodeId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editLabel, setEditLabel] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTree();
    }, []);

    const fetchTree = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/storage-locations");
            if (!res.ok) throw new Error("Failed to fetch storage locations");
            const data = await res.json();
            setTree(data);
        } catch (error) {
            toast.error("Could not load storage locations.");
        } finally {
            setIsLoading(false);
        }
    };

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
            fetchTree();
        } catch (error) {
            toast.error("Error adding location");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditNode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim() || !editNodeId) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/storage-locations/${editNodeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editName.trim(),
                    levelLabel: editLabel.trim() || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to update location");

            toast.success("Location updated successfully");
            setEditNodeId(null);
            setIsEditOpen(false);
            fetchTree();
        } catch (error) {
            toast.error("Error updating location");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNode = async (nodeId: string) => {
        if (!confirm("Are you sure you want to delete this location and all its sub-locations? Documents in these locations will lose their specific location assignment.")) {
            return;
        }

        try {
            const res = await fetch(`/api/storage-locations/${nodeId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete location");

            toast.success("Location deleted successfully");
            fetchTree();
        } catch (error) {
            toast.error("Error deleting location");
        }
    };

    const openAddDialog = (parentId: string | null = null) => {
        setAddParentId(parentId);
        setAddName("");
        setAddLabel("");
        setIsAddOpen(true);
    };

    const openEditDialog = (node: StorageTreeNode) => {
        setEditNodeId(node.id);
        setEditName(node.name);
        setEditLabel(node.levelLabel || "");
        setIsEditOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48 bg-white rounded-[24px] border border-border-base shadow-soft">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-[24px] border border-border-base shadow-soft">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-brand-900">Storage Hierarchy</h3>
                <Button 
                    onClick={() => openAddDialog(null)}
                    className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-9 px-4"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Root Location
                </Button>
            </div>

            {tree.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border-base rounded-xl">
                    <p className="text-text-muted mb-4">No storage locations defined yet.</p>
                    <Button variant="outline" onClick={() => openAddDialog(null)} className="rounded-xl border-border-base">
                        Start Building Hierarchy
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {tree.map(node => (
                        <TreeNode 
                            key={node.id} 
                            node={node} 
                            onAddChild={() => openAddDialog(node.id)}
                            onEdit={() => openEditDialog(node)}
                            onDelete={() => handleDeleteNode(node.id)}
                            onAddChildNode={openAddDialog}
                            onEditNode={openEditDialog}
                            onDeleteNode={handleDeleteNode}
                        />
                    ))}
                </div>
            )}

            {/* Add Node Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="rounded-[24px]">
                    <DialogHeader>
                        <DialogTitle>{addParentId ? "Add Sub-Location" : "Add Root Location"}</DialogTitle>
                        <DialogDescription>
                            Create a new storage location in your firm's hierarchy.
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

            {/* Edit Node Dialog */}
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

// Helper component for recursive rendering
function TreeNode({ 
    node, 
    onAddChild, 
    onEdit, 
    onDelete,
    onAddChildNode,
    onEditNode,
    onDeleteNode
}: { 
    node: StorageTreeNode, 
    onAddChild: () => void,
    onEdit: () => void,
    onDelete: () => void,
    onAddChildNode?: (parentId: string) => void,
    onEditNode?: (node: StorageTreeNode) => void,
    onDeleteNode?: (id: string) => void,
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="space-y-1">
            <div className="flex items-center group py-2 px-2 hover:bg-brand-50 rounded-xl transition-colors border border-transparent hover:border-brand-100">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-6 h-6 flex items-center justify-center shrink-0 mr-1 text-text-muted hover:text-brand-600"
                    disabled={!hasChildren}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    ) : (
                        <div className="w-4 h-4" /> // Placeholder for alignment
                    )}
                </button>
                
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {hasChildren ? (
                        isExpanded ? <FolderOpen className="w-4 h-4 text-brand-500" /> : <Folder className="w-4 h-4 text-brand-500" />
                    ) : (
                        <Folder className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-medium text-text-dark truncate">{node.name}</span>
                    {node.levelLabel && (
                        <span className="text-xs bg-bg-main px-2 py-0.5 rounded text-text-muted border border-border-base">
                            {node.levelLabel}
                        </span>
                    )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                <MoreVertical className="w-4 h-4 text-text-muted" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem onClick={onAddChild} className="cursor-pointer rounded-lg">
                                <Plus className="w-4 h-4 mr-2" /> Add Sub-location
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onEdit} className="cursor-pointer rounded-lg">
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="cursor-pointer rounded-lg text-red-600 focus:text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="ml-5 pl-4 border-l border-border-base space-y-1">
                    {node.children.map(child => (
                        <TreeNode 
                            key={child.id} 
                            node={child} 
                            onAddChild={() => onAddChildNode?.(child.id)}
                            onEdit={() => onEditNode?.(child)}
                            onDelete={() => onDeleteNode?.(child.id)}
                            onAddChildNode={onAddChildNode}
                            onEditNode={onEditNode}
                            onDeleteNode={onDeleteNode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
