import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const API_URL = 'http://localhost:3000/api'

export interface CategoryItem {
  id: number
  name: string
}

interface CategoryContextType {
  categories: string[]
  categoryError: string
  categoryItems: CategoryItem[]
  refreshCategories: () => Promise<void>
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
)

export function CategoryProvider({
  children,
}: {
  children: ReactNode
}) {
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([])
  const [categoryError, setCategoryError] = useState('')

  const refreshCategories = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setCategoryError('You are not logged in. Please log in again.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))

        setCategoryError(
          `Could not load categories (HTTP ${response.status}): ${
            body.error || body.message || 'Unknown error'
          }`,
        )
        return
      }

      const data: CategoryItem[] = await response.json()

      setCategoryError('')

      // Oldest first, so new categories appear at the bottom of the list
      setCategoryItems(
        [...data]
          .sort((a, b) => a.id - b.id)
          .map((item) => ({ id: item.id, name: item.name })),
      )
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategoryError(
        'Cannot reach the server (http://localhost:3000). Is the backend running?',
      )
    }
  }, [])

  const categories = useMemo(
    () => categoryItems.map((item) => item.name),
    [categoryItems],
  )

  return (
    <CategoryContext.Provider
      value={{ categories, categoryError, categoryItems, refreshCategories }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCategories() {
  const context = useContext(CategoryContext)

  if (!context) {
    throw new Error(
      'useCategories must be used inside CategoryProvider',
    )
  }

  return context
}
