"use client";

import { useEffect, useState, useCallback } from "react";
import { FilingRecordTable } from "@/components/filings/FilingRecordTable";

interface FilingRecord {
    id: string;
    periodLabel: string;
    dueDate: string;
    status: any;
    filedDate: string | null;
    acknowledgmentNo: string | null;
    notes: string | null;
    filingType: { id: string; code: string; category: string; name: string; frequency: string; requiresAckNo: boolean };
    client: { id: string; name: string; clientCode: string };
}

export function UpcomingFilingsPanel() {
    const [records, setRecords] = useState<FilingRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/filing-records/upcoming");
            if (res.ok) setRecords(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    if (isLoading) return null;
    if (records.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-[15px] font-bold text-text-dark px-1">Upcoming Filing Deadlines</h2>
            <FilingRecordTable records={records} onRefresh={fetchRecords} />
        </div>
    );
}
