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
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-900">No clients yet</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          You haven't added any clients to your firm. Get started by creating your first client profile.
        </p>
        <div className="mt-6">
          <Link href="/clients/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700">Add New Client</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[100px] font-semibold">Code</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">PAN</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="hidden md:table-cell font-semibold">Added On</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-slate-50 transition-colors">
              <TableCell className="font-medium text-indigo-600">{client.clientCode}</TableCell>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell className="text-slate-600">{client.pan}</TableCell>
              <TableCell className="text-slate-600">{client.phone || "—"}</TableCell>
              <TableCell className="hidden md:table-cell text-slate-500">
                {new Intl.DateTimeFormat("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(client.createdAt))}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase">Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/clients/${client.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/clients/${client.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Client
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
