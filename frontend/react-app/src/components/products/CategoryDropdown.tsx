
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
  const { categories } = useCategories()

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
    </div>
  )
}

export default CategoryDropdown
