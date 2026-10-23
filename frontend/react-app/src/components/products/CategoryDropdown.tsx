import { useEffect } from 'react'
import { useCategories } from '../../context/CategoryContext'

interface CategoryDropdownProps {
  id: string
  value: string
  onChange: (category: string) => void
  required?: boolean
}

function CategoryDropdown({
  id,
  value,
  onChange,
  required = true,
}: CategoryDropdownProps) {
  const { categories, categoryError, refreshCategories } = useCategories()

  // Reload the category list every time the form opens
  useEffect(() => {
    void refreshCategories()
  }, [refreshCategories])

  return (
    <div className="product-form-field">
      <label htmlFor={id}>Category {required && '*'}</label>

      <select
        id={id}
        name="category"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      >
        <option value="">Select category</option>

        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {categoryError && (
        <p style={{ margin: 0, color: '#dc3545', fontSize: '11px' }}>
          {categoryError}
        </p>
      )}
    </div>
  )
}

export default CategoryDropdown
