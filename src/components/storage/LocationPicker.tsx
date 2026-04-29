"use client";

import { useState, useEffect } from "react";
import { StorageTreeNode } from "@/types/storage";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface LocationPickerProps {
    selectedLocationId?: string | null;
    onSelectLocation: (locationId: string | null, locationName: string | null) => void;
    triggerText?: string;
}

export function LocationPicker({ selectedLocationId, onSelectLocation, triggerText = "Select Location" }: LocationPickerProps) {
    const [tree, setTree] = useState<StorageTreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen && tree.length === 0) {
            fetchTree();
        }
    }, [isOpen]);

    const fetchTree = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/storage-locations");
            if (res.ok) {
                const data = await res.json();
                setTree(data);
            }
        } catch (error) {
            console.error("Failed to load storage locations");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (node: StorageTreeNode) => {
        onSelectLocation(node.id, node.name);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl">
                    <Folder className="mr-2 h-4 w-4 text-text-muted" />
                    {selectedLocationId ? triggerText : <span className="text-text-muted">{triggerText}</span>}
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[24px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Select Storage Location</DialogTitle>
                    <DialogDescription>
                        Choose where this document is physically stored.
                    </DialogDescription>
                </DialogHeader>

                <div className="pt-4">
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start mb-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            onSelectLocation(null, null);
                            setIsOpen(false);
                        }}
                    >
                        Clear Selection
                    </Button>

                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                        </div>
                    ) : tree.length === 0 ? (
                        <div className="text-center py-8 text-text-muted">
                            No storage locations defined.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {tree.map(node => (
                                <PickerTreeNode 
                                    key={node.id} 
                                    node={node} 
                                    onSelect={handleSelect} 
                                    selectedId={selectedLocationId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PickerTreeNode({ 
    node, 
    onSelect,
    selectedId,
}: { 
    node: StorageTreeNode; 
    onSelect: (node: StorageTreeNode) => void;
    selectedId?: string | null;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;

    return (
        <div className="space-y-1">
            <div className={`flex items-center group py-2 px-2 rounded-xl transition-colors cursor-pointer border border-transparent
                ${isSelected ? 'bg-brand-50 border-brand-200' : 'hover:bg-bg-main hover:border-border-base'}
            `}>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="w-6 h-6 flex items-center justify-center shrink-0 mr-1 text-text-muted hover:text-brand-600"
                    disabled={!hasChildren}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    ) : (
                        <div className="w-4 h-4" /> 
                    )}
                </button>
                
                <div 
                    className="flex items-center gap-2 flex-1 min-w-0"
                    onClick={() => onSelect(node)}
                >
                    {hasChildren ? (
                        isExpanded ? <FolderOpen className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-brand-400'}`} /> 
                                   : <Folder className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-brand-400'}`} />
                    ) : (
                        <Folder className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                    )}
                    <span className={`font-medium truncate ${isSelected ? 'text-brand-700' : 'text-text-dark'}`}>
                        {node.name}
                    </span>
                    {node.levelLabel && (
                        <span className="text-xs bg-bg-main px-2 py-0.5 rounded text-text-muted border border-border-base">
                            {node.levelLabel}
                        </span>
                    )}
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="ml-5 pl-4 border-l border-border-base space-y-1">
                    {node.children.map(child => (
                        <PickerTreeNode 
                            key={child.id} 
                            node={child} 
                            onSelect={onSelect}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
