import { useEffect, useState } from 'react'
import { useCategories } from '../context/CategoryContext'

const API_URL = 'http://localhost:3000/api'

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

function CategoryManagement() {
  // Shared category data
  const { categories, categoryItems, refreshCategories } = useCategories()
  // Add Category state
  const [newCategory, setNewCategory] = useState('')
  const [error, setError] = useState('')

  // Edit Category state
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedName, setEditedName] = useState('')
  const [editError, setEditError] = useState('')

  // Delete Category state
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

  // Load categories from the backend
  useEffect(() => {
    void refreshCategories()
  }, [refreshCategories])

  // Add a category
  const handleAddCategory = async () => {
    const categoryName = newCategory.trim()

    if (!categoryName) {
      setError('Category name is required.')
      return
    }

    const alreadyExists = categories.some(
      (category) =>
        category.toLowerCase() === categoryName.toLowerCase()
    )

    if (alreadyExists) {
      setError('This category already exists.')
      return
    }

    try {
      await request('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: categoryName }),
      })

      await refreshCategories()
      setNewCategory('')
      setError('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not add the category.',
      )
    }
  }

  // Start editing a category
  const handleEditClick = (index: number) => {
    setEditingIndex(index)
    setEditedName(categories[index])
    setEditError('')
  }

  // Save the edited category
  const handleSaveEdit = async () => {
    if (editingIndex === null) return

    const categoryName = editedName.trim()

    if (!categoryName) {
      setEditError('Category name is required.')
      return
    }

    const alreadyExists = categories.some(
      (category, index) =>
        index !== editingIndex &&
        category.toLowerCase() === categoryName.toLowerCase()
    )

    if (alreadyExists) {
      setEditError('This category already exists.')
      return
    }

    const categoryItem = categoryItems[editingIndex]

    if (!categoryItem) return

    try {
      await request(`/categories/${categoryItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: categoryName }),
      })

      await refreshCategories()
      setEditingIndex(null)
      setEditedName('')
      setEditError('')
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : 'Could not update the category.',
      )
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditedName('')
    setEditError('')
  }

  // Open delete confirmation
  const handleDeleteClick = (index: number) => {
    setDeletingIndex(index)
  }

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (deletingIndex === null) return

    const categoryItem = categoryItems[deletingIndex]

    if (categoryItem) {
      try {
        await request(`/categories/${categoryItem.id}`, {
          method: 'DELETE',
        })

        await refreshCategories()
      } catch (err) {
        window.alert(
          err instanceof Error ? err.message : 'Could not delete the category.',
        )
      }
    }

    setDeletingIndex(null)

    // Reset editing
    setEditingIndex(null)
    setEditedName('')
    setEditError('')
  }

  // Cancel deletion
  const handleCancelDelete = () => {
    setDeletingIndex(null)
  }

    return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-xl font-bold text-[#212529]">
          Category Management
        </h1>

        <p className="mt-1 text-sm text-[#6c757d]">
          View and manage your product categories.
        </p>
      </div>

      {/* Add Category Card */}
      <div className="rounded-lg border border-[#e9ecef] bg-white p-6">

        <h2 className="mb-4 text-base font-semibold text-[#212529]">
          Add New Category
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter category name"
            aria-label="New category name"
            value={newCategory}
            onChange={(e) => {
              setNewCategory(e.target.value)
              setError('')
            }}
            className="flex-1 rounded-md border border-[#ced4da] px-3 py-2 text-sm outline-none focus:border-[#0d6efd]"
          />

          <button
            type="button"
            onClick={handleAddCategory}
            className="rounded-md bg-[#0d6efd] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0b5ed7]"
          >
            + Add Category
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-[#dc3545]">
            {error}
          </p>
        )}
      </div>

      {/* Category List Card */}
      <div className="rounded-lg border border-[#e9ecef] bg-white p-6">

        <h2 className="mb-4 text-base font-semibold text-[#212529]">
          Product Categories ({categories.length})
        </h2>

        <div className="divide-y divide-[#e9ecef]">

          {categories.map((category, index) => (
            <div key={index} className="py-3">

              {editingIndex === index ? (

                /* Edit Mode */
                <div>
                  <div className="flex items-center gap-3">

                    <input
                      type="text"
                      value={editedName}
                      aria-label={`Edit ${category}`}
                      onChange={(e) => {
                        setEditedName(e.target.value)
                        setEditError('')
                      }}
                      className="flex-1 rounded-md border border-[#ced4da] px-3 py-2 text-sm outline-none focus:border-[#0d6efd]"
                    />

                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="rounded-md bg-[#198754] px-4 py-2 text-sm font-semibold text-white hover:bg-[#157347]"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-md border border-[#ced4da] px-4 py-2 text-sm text-[#495057] hover:bg-[#f8f9fa]"
                    >
                      Cancel
                    </button>
                  </div>

                  {editError && (
                    <p className="mt-2 text-sm text-[#dc3545]">
                      {editError}
                    </p>
                  )}
                </div>

              ) : (

                /* Normal List Mode */
                <div className="flex items-center justify-between">

                  <span className="text-sm text-[#343a40]">
                    {category}
                  </span>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() => handleEditClick(index)}
                      className="rounded-md border border-[#ced4da] px-4 py-2 text-sm text-[#495057] hover:bg-[#f8f9fa]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(index)}
                      className="rounded-md border border-[#dc3545] px-4 py-2 text-sm text-[#dc3545] hover:bg-[#fff5f5]"
                    >
                      Delete
                    </button>

                  </div>
                </div>
              )}

            </div>
          ))}

        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            aria-describedby="delete-category-description"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >

            <h2
              id="delete-category-title"
              className="text-lg font-bold text-[#212529]"
            >
              Delete Category?
            </h2>

            <p
              id="delete-category-description"
              className="mt-3 text-sm text-[#6c757d]"
            >
              Are you sure you want to delete{' '}
              <span className="font-semibold text-[#212529]">
                {categories[deletingIndex]}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-[#dc3545]">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded-md border border-[#ced4da] px-4 py-2 text-sm text-[#495057] hover:bg-[#f8f9fa]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-md bg-[#dc3545] px-4 py-2 text-sm font-semibold text-white hover:bg-[#bb2d3b]"
              >
                Yes, Delete
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default CategoryManagement