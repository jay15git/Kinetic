import { ImageResponse } from "next/og"

import { HandMoveMark } from "@/lib/brand/hand-move-mark"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export function generateImageMetadata() {
  return [
    {
      id: "light",
      size,
      contentType,
    },
    {
      id: "dark",
      size,
      contentType,
    },
  ]
}

export default async function AppleIcon({
  id,
}: {
  id: Promise<string>
}) {
  const theme = await id
  const isDark = theme === "dark"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark ? "#18181b" : "#eef1f4",
          borderRadius: 12,
        }}
      >
        <HandMoveMark stroke={isDark ? "#fafafa" : "#18181b"} size={120} />
      </div>
    ),
    size
  )
}
