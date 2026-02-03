import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown, Check } from "lucide-react"

const SelectContext = React.createContext({})

const Select = ({ children, value, onValueChange }) => {
    const [open, setOpen] = React.useState(false)

    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative inline-block text-left w-full md:w-auto">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = ({ className, children, ...props }) => {
    const { open, setOpen } = React.useContext(SelectContext)
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

const SelectValue = ({ placeholder }) => {
    const { value } = React.useContext(SelectContext)
    return <span>{value || placeholder}</span>
}

const SelectContent = ({ className, children }) => {
    const { open, setOpen } = React.useContext(SelectContext)

    if (!open) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
            />
            <div className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1",
                className
            )}>
                <div className="p-1">
                    {children}
                </div>
            </div>
        </>
    )
}

const SelectItem = ({ value: itemValue, children, className }) => {
    const { value, onValueChange, setOpen } = React.useContext(SelectContext)
    const isSelected = value === itemValue

    return (
        <div
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            onClick={() => {
                onValueChange(itemValue)
                setOpen(false)
            }}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            {children}
        </div>
    )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
