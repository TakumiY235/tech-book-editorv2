import * as React from "react"

interface AlertProps {
  children: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const baseClasses = "relative w-full rounded-lg border p-4"
  const variantClasses = {
    default: "bg-background text-foreground",
    destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
  }

  return (
    <div
      role="alert"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

const AlertDescription = ({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`mt-2 text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export { Alert, AlertDescription }