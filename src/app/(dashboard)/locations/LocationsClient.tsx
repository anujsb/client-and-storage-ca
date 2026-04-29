"use client";

import { useState, useEffect } from "react";
import { StorageTreeNode, StorageLocation } from "@/types/storage";
import { StorageTree } from "@/components/storage/StorageTree";
import { LocationDetail } from "@/components/storage/LocationDetail";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function LocationsClient() {
    const [tree, setTree] = useState<StorageTreeNode[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTree = async () => {
        try {
            const res = await fetch("/api/storage-locations");
            if (res.ok) {
                const data = await res.json();
                setTree(data);

                // Auto-select first node if none selected
                if (!selectedNodeId && data.length > 0) {
                    setSelectedNodeId(data[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch tree", error);
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    // Find the selected node and its path
    let selectedNode: StorageTreeNode | null = null;
    let breadcrumbPath: StorageTreeNode[] = [];

    const findNodeAndPath = (nodes: StorageTreeNode[], targetId: string, currentPath: StorageTreeNode[]): boolean => {
        for (const node of nodes) {
            const newPath = [...currentPath, node];
            if (node.id === targetId) {
                selectedNode = node;
                breadcrumbPath = newPath;
                return true;
            }
            if (node.children && node.children.length > 0) {
                if (findNodeAndPath(node.children, targetId, newPath)) {
                    return true;
                }
            }
        }
        return false;
    };

    if (selectedNodeId) {
        findNodeAndPath(tree, selectedNodeId, []);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Storage Locations</h1>
                    <p className="text-text-muted mt-1">Manage physical document storage hierarchy and capacity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                            placeholder="Search location or document..."
                            className="w-[280px] pl-9 rounded-xl bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-10 px-4 shadow-soft">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Root Location
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
                {/* Left Column: Tree */}
                <div className="bg-white rounded-[24px] border border-border-base shadow-soft h-[calc(100vh-200px)] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border-light flex items-center justify-between">
                        <h3 className="text-[13px] font-bold text-text-muted tracking-wider uppercase">Location Tree</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                        <StorageTree
                            tree={tree}
                            selectedNodeId={selectedNodeId}
                            onSelectNode={setSelectedNodeId}
                            onTreeChange={fetchTree}
                        />
                    </div>
                    <div className="p-3 border-t border-border-light text-center">
                        <p className="text-[11px] text-text-muted">Drag and drop to reorganize (Coming soon)</p>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="flex flex-col gap-6">
                    {selectedNode ? (
                        <LocationDetail
                            node={selectedNode}
                            breadcrumbPath={breadcrumbPath}
                            onTreeChange={fetchTree}
                        />
                    ) : (
                        <div className="bg-white rounded-[24px] border border-border-base shadow-soft p-12 text-center flex flex-col items-center justify-center h-[200px]">
                            <p className="text-text-muted">Select a location from the tree to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
