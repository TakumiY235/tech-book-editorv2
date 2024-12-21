'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

/**
 * Button Component Styles and Configuration
 */

// Base button styles
const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

// Button variants with their corresponding styles
const variants = {
  // Primary action button
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  // Dangerous or destructive actions
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  // Secondary or less prominent actions
  outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
  // Alternative styling
  secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  // Minimal styling
  ghost: "hover:bg-accent hover:text-accent-foreground",
  // Appears as a link
  link: "text-primary underline-offset-4 hover:underline",
}

// Button size variations
const sizes = {
  // Standard size
  default: "h-9 px-4 py-2",
  // Small size for compact layouts
  sm: "h-8 rounded-md px-3 text-xs",
  // Large size for prominent actions
  lg: "h-10 rounded-md px-8",
  // Square button for icons
  icon: "h-9 w-9",
}

/**
 * Button variants configuration using class-variance-authority
 * Combines base styles with variant and size options
 */
const buttonVariants = cva(baseStyles, {
  variants: {
    variant: variants,
    size: sizes,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

/**
 * Button component props interface
 * Extends HTML button attributes and variant props
 * @property asChild - Allows button to be rendered as a child component
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button component
 * A flexible button component with various style variants and sizes
 * 
 * @example
 * // Default button
 * <Button>Click me</Button>
 * 
 * @example
 * // Destructive button with small size
 * <Button variant="destructive" size="sm">Delete</Button>
 * 
 * @example
 * // Outline button with custom className
 * <Button variant="outline" className="custom-class">Cancel</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }