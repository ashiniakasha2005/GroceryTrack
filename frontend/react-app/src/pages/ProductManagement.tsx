
import { useEffect, useRef, useState } from 'react'
import ProductForm, {
  type ProductFormData,
} from '../components/products/ProductForm'
import DeleteConfirmationDialog from '../components/products/DeleteConfirmationDialog'

interface Product extends ProductFormData {
  id: number
import '../components/products/ProductForms.css'
import CategoryDropdown from '../components/products/CategoryDropdown'
import { useState } from 'react'

type Product = {
  id: number
  name: string
  category: string
  price: number
  minimumStock: number
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

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [minimumStock, setMinimumStock] = useState('')

  function openAddForm() {
    setEditingProduct(null)
    setName('')
    setCategory('')
    setPrice('')
    setMinimumStock('')
    setShowForm(true)
  }

  function openEditForm(product: Product) {
    lastFocusedElement.current = document.activeElement as HTMLElement
    setEditingProduct(product)
    setEditingProduct(product)
    setName(product.name)
    setCategory(product.category)
    setPrice(String(product.price))
    setMinimumStock(String(product.minimumStock))
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
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedPrice = Number(price)
    const parsedMinimumStock = Number(minimumStock)

    if (
      !name.trim() ||
      !category ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0 ||
      !Number.isInteger(parsedMinimumStock) ||
      parsedMinimumStock < 0
    ) {
      window.alert('Please enter valid product details.')
      return
    }

    if (editingProduct) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                name: name.trim(),
                category,
                price: parsedPrice,
                minimumStock: parsedMinimumStock,
              }
            : product,
        ),
      )
    } else {
      setProducts((current) => [
        ...current,
        { ...data, id: Date.now() },
      ])
      const newProduct: Product = {
        id: Date.now(),
        name: name.trim(),
        category,
        price: parsedPrice,
        minimumStock: parsedMinimumStock,
      }

      setProducts((currentProducts) => [...currentProducts, newProduct])
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
  function confirmDelete() {
    if (!deletingProduct) return

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== deletingProduct.id,
      ),
    )

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
    <div className="product-management">
      <div className="product-header">
        <div>
          <h1>Product Management</h1>
          <p>Manage your grocery products and stock levels.</p>
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
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Product
        </button>
      </div>

      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price (LKR)</th>
              <th>Minimum Stock</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-products">
                  No products added yet. Click “Add Product” to get started.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    {product.price.toLocaleString('en-LK', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>{product.minimumStock}</td>
                  <td>
                    <div className="product-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => openEditForm(product)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingProduct(product)}
                        className="rounded-md border border-[#dc3545] px-3 py-1.5 text-sm text-[#dc3545] hover:bg-[#fff5f5]"
                        className="delete-button"
                        onClick={() => setDeletingProduct(product)}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
          >
            <h2 id="product-form-title">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-field">
                <label htmlFor="productName">Product Name</label>
                <input
                  id="productName"
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <CategoryDropdown
                id="productCategory"
                value={category}
                onChange={setCategory}
                required
              />

              <div className="form-field">
                <label htmlFor="productPrice">Price (LKR)</label>
                <input
                  id="productPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="minimumStock">Minimum Stock</label>
                <input
                  id="minimumStock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter minimum stock"
                  value={minimumStock}
                  onChange={(event) =>
                    setMinimumStock(event.target.value)
                  }
                  required
                />
              </div>

              <div className="product-form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingProduct ? 'Save Changes' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingProduct && (
        <div className="modal-overlay">
          <div
            className="product-modal delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <h2 id="delete-dialog-title">Delete Product?</h2>

            <p>
              Are you sure you want to delete{' '}
              <strong>{deletingProduct.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="product-form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setDeletingProduct(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-button"
                onClick={confirmDelete}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManagement
