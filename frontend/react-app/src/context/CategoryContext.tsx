
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

interface CategoryContextType {
  categories: string[]
  setCategories: React.Dispatch<React.SetStateAction<string[]>>
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
)

export function CategoryProvider({
  children,
}: {
  children: ReactNode
}) {
  const [categories, setCategories] = useState([
    'Dry Goods',
    'Dairy',
    'Oils & Fats',
    'Canned & Dry',
  ])

  return (
    <CategoryContext.Provider value={{ categories, setCategories }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)

  if (!context) {
    throw new Error(
      'useCategories must be used inside CategoryProvider',
    )
  }

  return context
}
