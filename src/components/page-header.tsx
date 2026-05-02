import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Fragment } from "react"

interface BreadcrumbEntry {
    label: string
    href?: string
}

interface PageHeaderProps {
    items: BreadcrumbEntry[]
    actions?: React.ReactNode
}


export function PageHeader({ items, actions }: PageHeaderProps) {
    return (
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 bg-transparent sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                    {items.map((item, i) => {
                        const isLast = i === items.length - 1
                        return (
                            <Fragment key={i}>
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className="font-semibold text-sm text-foreground">
                                            {item.label}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink
                                            href={item.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {item.label}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator />}
                            </Fragment>
                        )
                    })}
                </BreadcrumbList>
            </Breadcrumb>
            {actions && (
                <div className="ml-auto flex items-center gap-2">{actions}</div>
            )}
        </header>
    )
}