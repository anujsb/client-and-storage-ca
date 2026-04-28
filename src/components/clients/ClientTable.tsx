"use client";

import { Client } from "@/types/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-border-base rounded-[24px] shadow-soft">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-brand-500" />
        </div>
        <h3 className="text-lg font-bold text-text-dark">No clients yet</h3>
        <p className="text-[14px] text-text-muted mt-2 max-w-sm">
          You haven't added any clients to your firm. Get started by creating your first client profile.
        </p>
        <div className="mt-8">
          <Link href="/clients/new">
            <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 h-11">
              Add New Client
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-border-base overflow-hidden bg-white shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="bg-bg-main/50 hover:bg-bg-main/50 border-b border-border-light">
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Client Code</TableHead>
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Full Name</TableHead>
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">PAN Number</TableHead>
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4">Phone</TableHead>
            <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-6 py-4 hidden md:table-cell">Added On</TableHead>
            <TableHead className="w-10 px-6 py-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-bg-main/30 border-b border-border-light last:border-0 transition-colors group">
              <TableCell className="px-6 py-4">
                <span className="inline-flex items-center text-[12px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                  {client.clientCode}
                </span>
              </TableCell>
              <TableCell className="px-6 py-4 font-semibold text-text-dark">{client.name}</TableCell>
              <TableCell className="px-6 py-4 text-text-muted font-mono text-[13px]">{client.pan}</TableCell>
              <TableCell className="px-6 py-4 text-text-muted text-[13px]">{client.phone || <span className="text-border-base">—</span>}</TableCell>
              <TableCell className="px-6 py-4 hidden md:table-cell text-text-muted text-[13px]">
                {new Intl.DateTimeFormat("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(client.createdAt))}
              </TableCell>
              <TableCell className="px-6 py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-bg-main transition-all">
                      <MoreHorizontal className="w-4 h-4 text-text-muted" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-2 rounded-xl border-border-base shadow-soft">
                    <DropdownMenuLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2 py-1.5">Options</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border-light my-1" />
                    <DropdownMenuItem asChild className="rounded-lg gap-2 cursor-pointer py-2">
                      <Link href={`/clients/${client.id}`}>
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">View details</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg gap-2 cursor-pointer py-2">
                      <Link href={`/clients/${client.id}/edit`}>
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-medium">Edit client</span>
                      </Link>
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

