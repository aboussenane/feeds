"use client"

import { ReactNode } from "react"

type FeedStyles = {
  fontFamily?: string | null
  fontColor?: string | null
  cardBgColor?: string | null
  cardBorderColor?: string | null
  feedBgColor?: string | null
}

type StyledFeedWrapperProps = {
  styles: FeedStyles
  children: ReactNode
}

export function StyledFeedWrapper({ styles, children }: StyledFeedWrapperProps) {
  const style: React.CSSProperties = {
    fontFamily: styles.fontFamily || undefined,
    color: styles.fontColor || undefined,
    backgroundColor: styles.feedBgColor || undefined,
  }

  return (
    <div style={style} className="min-h-screen">
      {children}
    </div>
  )
}

