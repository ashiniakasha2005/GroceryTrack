
import './ProductForms.css'

interface DeleteProductModalProps {
  productName: string
  onConfirm: () => void
  onCancel: () => void
}

function DeleteProductModal({
  productName,
  onConfirm,
  onCancel,
}: DeleteProductModalProps) {
  return (
    <div className="product-modal-overlay">
      <section
        className="product-modal delete-product-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        aria-describedby="delete-product-description"
      >

  <div className="delete-product-icon" aria-hidden="true">
  <svg
    viewBox="0 0 24 24"
    width="25"
    height="25"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="m19 6-1 14H6L5 6" />
    <path d="M10 11v5M14 11v5" />
  </svg>
</div>


        <h2 id="delete-product-title">Delete Product?</h2>

        <p id="delete-product-description">
          Are you sure you want to delete <strong>{productName}</strong>?
          This action cannot be undone.
        </p>

        <footer className="product-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirm-delete-button"
            onClick={onConfirm}
          >
            Delete
          </button>
        </footer>
      </section>
    </div>
  )
}

export default DeleteProductModal
