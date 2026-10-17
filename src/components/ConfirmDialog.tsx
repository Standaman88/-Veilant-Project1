type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel: string
  busy: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy,
  error,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="confirm-backdrop">
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">{title}</h3>
        <p>{message}</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="confirm-actions">
          <button className="text-button" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="primary-button destructive-button" type="button" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
