import { IconHandMove } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

type BrandHandMoveIconProps = React.ComponentProps<typeof IconHandMove>

export function BrandHandMoveIcon({
  className,
  stroke = 1.5,
  ...props
}: BrandHandMoveIconProps) {
  return <IconHandMove stroke={stroke} className={cn(className)} {...props} />
}
