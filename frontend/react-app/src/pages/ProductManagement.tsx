
import { useState } from 'react'

type Product = {
  id: number
  name: string
  category: string
  price: number
  minimumStock: number
}

const categories = [
  'Fruits',
  'Vegetables',
  'Dairy',
  'Beverages',
  'Bakery',
  'Other',
]

function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

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
    <div className="product-management">
      <div className="product-header">
        <div>
          <h1>Product Management</h1>
          <p>Manage your grocery products and stock levels.</p>
        </div>

        <button
          type="button"
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
                        className="delete-button"
                        onClick={() => setDeletingProduct(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
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

              <div className="form-field">
                <label htmlFor="productCategory">Category</label>
                <select
                  id="productCategory"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

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
