import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 rounded-[20px] border py-1 text-base text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "border-input bg-[var(--input-fill)] dark:bg-input/30",
        ghost:
          "border-transparent bg-transparent hover:bg-muted/50 dark:hover:bg-muted/30",
        filled:
          "border-transparent bg-muted dark:bg-muted/50",
      },
      size: {
        xs: "h-6 px-2 text-xs",
        sm: "h-7 px-2 text-[0.8rem]",
        default: "h-8 px-2.5 text-sm",
        lg: "h-9 px-3 text-sm",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      align: "left",
    },
  }
)

function Input({
  className,
  type,
  variant,
  size: inputSize,
  align,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ variant, size: inputSize, align, className }),
      )}
      {...props}
    />
  )
}

export { Input, inputVariants }
