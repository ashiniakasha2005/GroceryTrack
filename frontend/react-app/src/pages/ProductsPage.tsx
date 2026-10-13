import ProductCatalogView from '../components/products/ProductCatalogView'
import type { Product } from '../types/product'
import { useState } from "react";
import SearchBar from "../components/SearchBar";

// Sample data copied from the Figma design, until real data is connected
const sampleProducts: Product[] = [
  { id: 1, name: 'White Sugar 1kg', categoryName: 'Dry Goods', price: 68, currentStock: 4, minStockLevel: 10, unit: 'kg' },
  { id: 2, name: 'All-Purpose Flour 1kg', categoryName: 'Dry Goods', price: 55, currentStock: 38, minStockLevel: 15, unit: 'kg' },
  { id: 3, name: 'Fresh Milk 1L', categoryName: 'Dairy', price: 89, currentStock: 2, minStockLevel: 8, unit: 'L' },
  { id: 4, name: 'Salted Butter 225g', categoryName: 'Dairy', price: 115, currentStock: 15, minStockLevel: 6, unit: 'pcs' },
  { id: 5, name: 'Cooking Oil 1L', categoryName: 'Oils & Fats', price: 72, currentStock: 3, minStockLevel: 12, unit: 'L' },
  { id: 6, name: 'Coconut Oil 500ml', categoryName: 'Oils & Fats', price: 95, currentStock: 22, minStockLevel: 8, unit: 'pcs' },
  { id: 7, name: 'Instant Noodles (pack)', categoryName: 'Canned & Dry', price: 12.5, currentStock: 7, minStockLevel: 20, unit: 'pcs' },
]

function ProductsPage() {
  const [search, setSearch] = useState("");

  const filteredProducts = sampleProducts.filter((product) =>
    product.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search products..."
      />

      {filteredProducts.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          No products found
        </p>
      ) : (
        <ProductCatalogView
          products={filteredProducts}
          onAdd={() => console.log("add")}
          onEdit={(product) => console.log("edit", product)}
          onDelete={(product) => console.log("delete", product)}
        />
      )}
    </div>
  );
}

export default ProductsPage;