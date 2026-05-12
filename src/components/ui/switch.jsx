import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
        // MÀU NỀN TRƯỢT (TRACK) 
        // - Chế độ sáng (unchecked): màu xám (slate-300)
        // - Chế độ tối (checked): màu sáng/trắng (slate-200)
        "data-[state=unchecked]:bg-slate-300 data-[state=checked]:bg-slate-200",
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full ring-0 transition-transform shadow-sm",
          // Kích thước núm
          "group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",
          // Vị trí khi unchecked (Chế độ sáng)
          "group-data-[size=default]/switch:data-[state=unchecked]:translate-x-[1.2px]",
          "group-data-[size=sm]/switch:data-[state=unchecked]:translate-x-[1px]",
          // Vị trí khi checked (Chế độ tối) - Sẽ tự động trượt khi state thay đổi
          "group-data-[size=default]/switch:data-[state=checked]:translate-x-[14.8px]",
          "group-data-[size=sm]/switch:data-[state=checked]:translate-x-[11px]",
          // MÀU NÚM GẠT (THUMB)
          // - Chế độ sáng (unchecked): trắng (bg-white)
          // - Chế độ tối (checked): đen/xám đậm (slate-800)
          "data-[state=unchecked]:bg-white data-[state=checked]:bg-slate-800"
        )} />
    </SwitchPrimitive.Root>
  );
}

export { Switch }