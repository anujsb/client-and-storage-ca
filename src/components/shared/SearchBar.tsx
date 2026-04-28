"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function SearchBar({ placeholder = "Search...", onSearch }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 w-full max-w-md">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder={placeholder}
          className="pl-10 rounded-xl border-border-base bg-white h-11 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-border-base text-text-muted hover:bg-bg-main">
        <SlidersHorizontal className="w-4 h-4" />
      </Button>
    </div>
  );
}
