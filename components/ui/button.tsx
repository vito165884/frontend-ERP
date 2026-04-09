import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-white/40 focus-visible:ring-white/30 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'backdrop-blur-md bg-white text-primary-foreground hover:bg-white/85 shadow-lg hover:shadow-2xl',
        destructive:
          'backdrop-blur-md bg-destructive text-primary-foreground hover:bg-destructive/85 focus-visible:ring-destructive/40 shadow-lg hover:shadow-xl',
        outline:
          'backdrop-blur-md border border-white/20 text-foreground hover:bg-white/12 hover:border-white/40 transition-all duration-200',
        secondary:
          'backdrop-blur-md bg-white/12 border border-white/15 text-secondary-foreground hover:bg-white/18 transition-all duration-200',
        ghost:
          'hover:bg-white/12 text-foreground transition-all duration-200',
        link: 'text-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
