"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type FeedStyles = {
  fontFamily?: string | null
  fontColor?: string | null
  secondaryTextColor?: string | null
  cardBgColor?: string | null
  cardBorderColor?: string | null
  feedBgColor?: string | null
  buttonColor?: string | null
  buttonSecondaryColor?: string | null
}

type FeedStylesContextType = {
  styles: FeedStyles | null
  setStyles: (styles: FeedStyles | null) => void
}

const FeedStylesContext = createContext<FeedStylesContextType>({
  styles: null,
  setStyles: () => {},
})

export function FeedStylesProvider({ 
  children,
  initialStyles 
}: { 
  children: ReactNode
  initialStyles?: FeedStyles | null
}) {
  const [styles, setStyles] = useState<FeedStyles | null>(initialStyles || null)

  return (
    <FeedStylesContext.Provider value={{ styles, setStyles }}>
      {children}
    </FeedStylesContext.Provider>
  )
}

export function useFeedStyles() {
  return useContext(FeedStylesContext)
}

