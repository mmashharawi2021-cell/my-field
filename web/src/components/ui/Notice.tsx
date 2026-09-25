import type { PropsWithChildren } from 'react'

export function Notice({ children }: PropsWithChildren) {
  return <div className="notice">{children}</div>
}
