import { useEffect, useRef, type PropsWithChildren } from 'react'

export function FormDialog({ title, onClose, busy, children }: PropsWithChildren<{ title: string; onClose: () => void; busy: boolean }>) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close() }, [])
  return <dialog ref={ref} className="dialog-card form-dialog" aria-label={title} onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}>
    <div className="dialog-heading"><h3>{title}</h3><button type="button" className="dialog-close" disabled={busy} onClick={onClose} aria-label="إغلاق">×</button></div>
    {children}
  </dialog>
}
