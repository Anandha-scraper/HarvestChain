import * as React from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  showPassword?: boolean
  onToggleVisibility?: () => void
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showPassword = false, onToggleVisibility, ...props }, ref) => {
    const [isHolding, setIsHolding] = React.useState(false)
    const [isVisible, setIsVisible] = React.useState(false)

    const handleMouseDown = () => {
      setIsHolding(true)
      setIsVisible(true)
    }

    const handleMouseUp = () => {
      setIsHolding(false)
      setIsVisible(false)
    }

    const handleMouseLeave = () => {
      setIsHolding(false)
      setIsVisible(false)
    }

    const handleTouchStart = () => {
      setIsHolding(true)
      setIsVisible(true)
    }

    const handleTouchEnd = () => {
      setIsHolding(false)
      setIsVisible(false)
    }

    const handleClick = () => {
      if (onToggleVisibility) {
        onToggleVisibility()
      }
    }

    const shouldShowPassword = isHolding ? isVisible : showPassword

    return (
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type={shouldShowPassword ? "text" : "password"}
          className={cn(
            "h-9 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors select-none"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
          tabIndex={-1}
        >
          {shouldShowPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">
            {shouldShowPassword ? "Hide password" : "Show password"}
          </span>
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }