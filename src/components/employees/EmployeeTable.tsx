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
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-xl">
        <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
          <UserRound className="w-7 h-7 text-indigo-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">No employees yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          Add your first employee to start assigning documents and tracking work.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-semibold text-slate-600">Name</TableHead>
            <TableHead className="font-semibold text-slate-600">Phone</TableHead>
            <TableHead className="font-semibold text-slate-600">Email</TableHead>
            <TableHead className="font-semibold text-slate-600">Files Held</TableHead>
            <TableHead className="font-semibold text-slate-600">Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium text-slate-800">
                {emp.name}
              </TableCell>
              <TableCell className="text-slate-600 text-sm">
                {emp.phone ?? <span className="text-slate-300">—</span>}
              </TableCell>
              <TableCell className="text-slate-600 text-sm">
                {emp.email ?? <span className="text-slate-300">—</span>}
              </TableCell>
              <TableCell>
                {emp.activeCheckouts > 0 ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {emp.activeCheckouts} file{emp.activeCheckouts !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-slate-400 text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={emp.isActive ? "default" : "secondary"}
                  className={
                    emp.isActive
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }
                >
                  {emp.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/employees/${emp.id}/edit`)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      disabled={deletingId === emp.id}
                      onClick={() => handleDelete(emp.id, emp.name)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
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
