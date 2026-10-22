
import { useEffect, useRef, useState, type MouseEvent } from 'react'

interface DeleteConfirmationDialogProps {
  productName: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

function DeleteConfirmationDialog({
  productName,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDeleting, onCancel])

  async function handleDelete() {
    if (isDeleting) return

    setIsDeleting(true)
    setError('')

    try {
      await onConfirm()
    } catch {
      setError('Failed to delete the product. Please try again.')
      setIsDeleting(false)
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isDeleting) {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="w-[380px] max-w-[calc(100vw-32px)] rounded-2xl bg-white p-6 text-center shadow-2xl transition-all"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fde8e8] text-[#ea3943]">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </div>

        <h2
          id="delete-dialog-title"
          className="text-base font-bold text-[#212529]"
        >
          Delete Product?
        </h2>

        <p
          id="delete-dialog-description"
          className="mt-2 text-xs leading-relaxed text-[#8a8f98]"
        >
          This action cannot be undone. The product{' '}
          {productName ? (
            <strong className="font-semibold text-[#212529]">
              "{productName}"
            </strong>
          ) : (
            'item'
          )}{' '}
          will be permanently removed from inventory.
        </p>

        {error && (
          <p role="alert" className="mt-3 text-xs text-[#dc3545]">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-[#e9ecef] bg-[#f8f9fa] py-2.5 text-xs font-semibold text-[#495057] transition hover:bg-[#e9ecef] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-[#ea3943] py-2.5 text-xs font-semibold text-white transition hover:bg-[#d02e37] focus:outline-none focus:ring-2 focus:ring-[#ea3943] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationDialog

