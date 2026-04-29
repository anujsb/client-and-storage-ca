"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserRound, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  activeCheckouts: number;
}

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(`${name} removed successfully`);
      router.refresh();
    } catch {
      toast.error("Failed to remove employee");
    } finally {
      setDeletingId(null);
    }
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-border-base rounded-[24px] shadow-soft">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
          <UserRound className="w-8 h-8 text-brand-500" />
        </div>
        <h3 className="text-lg font-bold text-text-dark">No employees yet</h3>
        <p className="text-[14px] text-text-muted mt-2 max-w-xs">
          Add your first employee to start assigning documents and tracking work.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-border-base overflow-hidden bg-white shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="bg-bg-main/50 hover:bg-bg-main/50 border-b border-border-light">
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Name</TableHead>
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Phone</TableHead>
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Email</TableHead>
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Files Held</TableHead>
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Status</TableHead>
            <TableHead className="w-10 px-6 py-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.id} className="hover:bg-bg-main/30 border-b border-border-light last:border-0 transition-colors group">
              <TableCell className="px-6 py-4 font-semibold text-text-dark">
                {emp.name}
              </TableCell>
              <TableCell className="px-6 py-4 text-text-muted text-[13px]">
                {emp.phone ?? <span className="text-border-base">—</span>}
              </TableCell>
              <TableCell className="px-6 py-4 text-text-muted text-[13px]">
                {emp.email ?? <span className="text-border-base">—</span>}
              </TableCell>
              <TableCell className="px-6 py-4">
                {emp.activeCheckouts > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {emp.activeCheckouts} file{emp.activeCheckouts !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-border-base text-[13px]">—</span>
                )}
              </TableCell>
              <TableCell className="px-6 py-4">
                <Badge
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-[12px] font-bold flex items-center gap-1.5 w-fit border shadow-none",
                    emp.isActive
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-slate-50 text-slate-500 border-slate-100"
                  )}
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full", emp.isActive ? "bg-green-500" : "bg-slate-400")} />
                  {emp.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="px-6 py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-bg-main transition-all">
                      <MoreHorizontal className="w-4 h-4 text-text-muted" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-2 rounded-xl border-border-base shadow-soft">
                    <DropdownMenuItem
                      className="rounded-lg gap-2 cursor-pointer py-2"
                      onClick={() => router.push(`/employees/${emp.id}/edit`)}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 rounded-lg gap-2 cursor-pointer py-2"
                      disabled={deletingId === emp.id}
                      onClick={() => handleDelete(emp.id, emp.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Remove employee</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

