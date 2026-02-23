import * as React from "react"
import { cn } from "@/lib/utils"

interface WireframeBorderProps extends React.HTMLAttributes<HTMLDivElement> {
    showCorners?: boolean
    scanline?: boolean
}

export function WireframeBorder({
    className,
    children,
    showCorners = true,
    scanline = false,
    ...props
}: WireframeBorderProps) {
    return (
        <div
            className={cn(
                "relative border border-border bg-card",
                showCorners && "wireframe-corner wireframe-corner-tl wireframe-corner-tr wireframe-corner-bl wireframe-corner-br",
                className
            )}
            {...props}
        >
            {scanline && <div className="scanline-overlay" />}
            {children}
        </div>
    )
}
