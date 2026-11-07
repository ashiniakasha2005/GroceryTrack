import { useCallback, useEffect, useState } from 'react'
import ProductCatalogView from '../components/products/ProductCatalogView'
import ProductForm, {
  type ProductFormData,
} from '../components/products/ProductForm'
import DeleteConfirmationDialog from '../components/products/DeleteConfirmationDialog'
import type { Product } from '../types/product'
import SearchBar from '../components/SearchBar'
import { useCategories } from '../context/CategoryContext'
import { isLowStock } from '../utils/stock'

const API_URL = 'http://localhost:3000/api'

interface ApiProduct {
  id: number
  name: string
  category: string | null
  price: number | string
  stock_quantity: number | string
  minimum_stock: number | string
}

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

function toProduct(item: ApiProduct): Product {
  return {
    id: item.id,
    name: item.name,
    categoryName: item.category ?? '',
    price: Number(item.price),
    currentStock: Number(item.stock_quantity),
    minStockLevel: Number(item.minimum_stock),
    // The database does not store a unit yet
    unit: 'pcs',
  }
}

function ProductsPage() {
  const { categories, categoryItems, refreshCategories } = useCategories()
  const [products, setProducts] = useState<Product[]>([])
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const loadProducts = useCallback(async () => {
    const data: ApiProduct[] = await request('/products')

    setProducts(data.map(toProduct))
    setLoadError('')
  }, [])

  useEffect(() => {
    let cancelled = false

    request('/products')
      .then((data: ApiProduct[]) => {
        if (cancelled) return

        setProducts(data.map(toProduct))
        setLoadError('')
      })
      .catch((error) => {
        if (cancelled) return

        setLoadError(
          error instanceof Error ? error.message : 'Could not load products.',
        )
      })

    void refreshCategories()

    return () => {
      cancelled = true
    }
  }, [refreshCategories])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())

    const matchesCategory =
      categoryFilter === 'All' || product.categoryName === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Low-stock alerts are counted from ALL products, not the filtered list
  const lowStockCount = products.filter(isLowStock).length

  const emptyMessage = loadError
    ? loadError
    : products.length === 0
      ? 'No products have been added yet.'
      : 'No products match your search.'

  function closeForm() {
    setShowForm(false)
    setEditingProduct(null)
  }

  async function handleSave(data: ProductFormData) {
    const category = categoryItems.find((item) => item.name === data.category)

    if (!category) {
      throw new Error('Category not found')
    }

    if (editingProduct) {
      await request(`/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          category_id: category.id,
          price: data.price,
          minimum_stock: data.minimumStock,
        }),
      })

      if (data.currentStock !== editingProduct.currentStock) {
        await request(`/inventory/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity: data.currentStock }),
        })
      }
    } else {
      await request('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          category_id: category.id,
          price: data.price,
          stock_quantity: data.currentStock,
          minimum_stock: data.minimumStock,
        }),
      })
    }

    await loadProducts()
    closeForm()
  }

  async function handleConfirmDelete(productId: number) {
    await request(`/products/${productId}`, { method: 'DELETE' })

    await loadProducts()
    setDeletingProduct(null)
  }

  return (
    <div>
      <ProductCatalogView
        products={filteredProducts}
        totalCount={products.length}
        lowStockCount={lowStockCount}
        emptyMessage={emptyMessage}
        toolbar={
          <div className="flex items-center gap-3 rounded-[10px] border border-[#e9ecef] bg-white p-3.5">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search products..."
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
              className="h-[38px] w-[150px] shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        }
        onAdd={() => {
          setEditingProduct(null)
          setShowForm(true)
        }}
        onEdit={(product) => {
          setEditingProduct(product)
          setShowForm(true)
        }}
        onDelete={(product) => setDeletingProduct(product)}
      />

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
                    category: editingProduct.categoryName,
                    unit: editingProduct.unit ?? 'pcs',
                    price: editingProduct.price,
                    currentStock: editingProduct.currentStock,
                    minimumStock: editingProduct.minStockLevel,
                  }
                : undefined
            }
            onSave={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      {deletingProduct && (
        <DeleteConfirmationDialog
          productName={deletingProduct.name}
          onConfirm={() => handleConfirmDelete(deletingProduct.id)}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </div>
  )
}

export default ProductsPage