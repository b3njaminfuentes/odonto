import React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-border rounded-md ${className}`}
      aria-hidden="true"
    />
  )
}
