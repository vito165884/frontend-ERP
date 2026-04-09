import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-gray-500 selection:bg-blue-600 selection:text-white bg-white/5 border border-white/10 h-9 w-full min-w-0 rounded-md px-3 py-2 text-sm transition-all duration-150 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'hover:border-white/15 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:bg-white/8',
        'aria-invalid:border-red-500 aria-invalid:ring-red-500/30',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
