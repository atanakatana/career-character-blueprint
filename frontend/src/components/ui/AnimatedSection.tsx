'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedSectionProps {
  children: React.ReactNode
  delay?:     number
  className?: string
  direction?: 'up' | 'left' | 'right' | 'none'
}

export function AnimatedSection({
  children,
  delay     = 0,
  className,
  direction = 'up',
}: AnimatedSectionProps) {
  const y = direction === 'up'   ? 28 : 0
  const x = direction === 'left' ? -28 : direction === 'right' ? 28 : 0

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
