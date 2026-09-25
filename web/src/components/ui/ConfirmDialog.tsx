import { ActionButton } from './ActionButton'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirming?: boolean
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirming = false,
  confirmLabel = 'تأكيد',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="dialog-card dialog-card--small"
        role="alertdialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">تأكيد الإجراء</span>
            <h3>{title}</h3>
          </div>
        </div>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <ActionButton variant="ghost" onClick={onCancel}>إلغاء</ActionButton>
          <ActionButton variant="primary" onClick={onConfirm} disabled={confirming}>
            {confirming ? 'جارِ التنفيذ…' : confirmLabel}
          </ActionButton>
        </div>
      </section>
    </div>
  )
}
