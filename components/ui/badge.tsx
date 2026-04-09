import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-white/40 focus-visible:ring-white/30 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-all duration-200 overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'backdrop-blur-md border-transparent bg-white text-primary-foreground [a&]:hover:bg-white/85',
        secondary:
          'backdrop-blur-md border border-white/15 bg-white/12 text-secondary-foreground [a&]:hover:bg-white/18',
        destructive:
          'backdrop-blur-md border-transparent bg-destructive text-primary-foreground [a&]:hover:bg-destructive/85 focus-visible:ring-destructive/30',
        outline:
          'backdrop-blur-md border border-white/15 text-foreground [a&]:hover:bg-white/12 [a&]:hover:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
