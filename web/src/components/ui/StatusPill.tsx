import type { PropsWithChildren } from 'react'

type StatusPillProps = PropsWithChildren<{
  tone?: 'success' | 'neutral' | 'warning'
}>

export function StatusPill({ children, tone = 'success' }: StatusPillProps) {
  return <span className={'status-pill status-pill--' + tone}>{children}</span>
}
