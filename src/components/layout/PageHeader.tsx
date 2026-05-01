interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-brand-900">{title}</h1>
                {description && (
                    <p className="mt-1 text-[14px] text-text-muted font-medium">{description}</p>
                )}
            </div>
            {action && <div className="shrink-0 w-full sm:w-auto">{action}</div>}
        </div>
    );
}