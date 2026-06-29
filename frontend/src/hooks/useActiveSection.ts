'use client'

import { useState, useEffect } from 'react'

/**
 * Tracks which section ID is currently in the visible portion of the viewport.
 * Uses IntersectionObserver with a rootMargin that fires when a section
 * enters the upper ~30% of the screen — natural for reading.
 */
export function useActiveSection(ids: string[]): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '')

  useEffect(() => {
    if (ids.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      // Top offset: clear of the sticky navbar.
      // Bottom cutoff at -70%: only the top 30% of the viewport fires the hook,
      // so the active item advances as you scroll down, not when you reach the bottom.
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [ids])

  return activeId
}
