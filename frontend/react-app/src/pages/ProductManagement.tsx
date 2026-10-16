
import { useEffect, useRef, useState } from 'react'
import ProductForm, {
  type ProductFormData,
} from '../components/products/ProductForm'
import DeleteConfirmationDialog from '../components/products/DeleteConfirmationDialog'

interface Product extends ProductFormData {
  id: number
}

function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const lastFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (showForm) {
      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') closeForm()
      }

      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }

    lastFocusedElement.current?.focus()
    lastFocusedElement.current = null
  }, [showForm])

  function openAddForm() {
    lastFocusedElement.current = document.activeElement as HTMLElement
    setEditingProduct(null)
    setShowForm(true)
  }

  function openEditForm(product: Product) {
    lastFocusedElement.current = document.activeElement as HTMLElement
    setEditingProduct(product)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingProduct(null)
  }

  async function handleSave(data: ProductFormData) {
    if (editingProduct) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? { ...data, id: product.id }
            : product,
        ),
      )
    } else {
      setProducts((current) => [
        ...current,
        { ...data, id: Date.now() },
      ])
    }

    closeForm()
  }

  async function handleConfirmDelete(productId: number) {
    setProducts((current) =>
      current.filter((product) => product.id !== productId),
    )

    setDeletingProduct(null)
  }

  function closeDeleteDialog() {
    setDeletingProduct(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#212529]">
            Product Management
          </h1>
          <p className="mt-1 text-sm text-[#6c757d]">
            Add, edit, and manage your grocery products.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-md bg-[#0d6efd] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0b5ed7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d6efd]"
        >
          + Add New Product
        </button>
      </div>

      {showForm && (
        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <ProductForm
            key={editingProduct?.id ?? 'new-product'}
            initialValues={
              editingProduct
                ? {
                    name: editingProduct.name,
                    category: editingProduct.category,
                    unit: editingProduct.unit,
                    price: editingProduct.price,
                    currentStock: editingProduct.currentStock,
                    minimumStock: editingProduct.minimumStock,
                  }
                : undefined
            }
            onSave={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[#e9ecef] bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-[#212529]">
          Products ({products.length})
        </h2>

        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#6c757d]">
            No products have been added yet.
          </p>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#e9ecef] text-[#6c757d]">
                <th className="px-3 py-3">Product Name</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Unit</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Current Stock</th>
                <th className="px-3 py-3">Minimum Stock</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#e9ecef] last:border-0"
                >
                  <td className="px-3 py-4 font-medium text-[#212529]">
                    {product.name}
                  </td>
                  <td className="px-3 py-4">{product.category}</td>
                  <td className="px-3 py-4">{product.unit}</td>
                  <td className="px-3 py-4">
                    {product.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-4">{product.currentStock}</td>
                  <td className="px-3 py-4">{product.minimumStock}</td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="rounded-md border border-[#ced4da] px-3 py-1.5 text-sm hover:bg-[#f8f9fa]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingProduct(product)}
                        className="rounded-md border border-[#dc3545] px-3 py-1.5 text-sm text-[#dc3545] hover:bg-[#fff5f5]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deletingProduct && (
        <DeleteConfirmationDialog
          productName={deletingProduct.name}
          onConfirm={() => handleConfirmDelete(deletingProduct.id)}
          onCancel={closeDeleteDialog}
        />
      )}
    </div>
  )
}

export default ProductManagement
