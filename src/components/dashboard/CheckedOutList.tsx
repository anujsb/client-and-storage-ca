import { FileText, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function CheckedOutList({ documents }: { documents: any[] }) {
    if (!documents || documents.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-text-dark">All documents are safe</h4>
                <p className="text-xs text-text-muted mt-1">Nothing is currently checked out.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {documents.map(doc => {
                const daysOut = doc.checkoutDate ? Math.floor((new Date().getTime() - new Date(doc.checkoutDate).getTime()) / (1000 * 3600 * 24)) : 0;
                const isUrgent = daysOut > 7;

                return (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-border-base hover:bg-slate-50 transition-colors gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-500'}`}>
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-text-dark truncate">{doc.documentName}</div>
                                <div className="text-[11px] font-semibold text-text-muted truncate">
                                    {doc.client.clientCode} • {doc.employee?.name || "Unknown"}
                                </div>
                            </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                            <div className={`flex items-center gap-1 text-[11px] font-bold ${isUrgent ? 'text-red-500' : 'text-text-muted'}`}>
                                {isUrgent ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {doc.checkoutDate ? formatDistanceToNow(new Date(doc.checkoutDate), { addSuffix: true }) : "Unknown"}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
