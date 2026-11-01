import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type InventoryContextValue = {
  inventoryVersion: number
  refreshInventory: () => void
}

const InventoryContext = createContext<InventoryContextValue | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventoryVersion, setInventoryVersion] = useState(0)
  const refreshInventory = useCallback(() => setInventoryVersion((v) => v + 1), [])
  const value = useMemo(
    () => ({ inventoryVersion, refreshInventory }),
    [inventoryVersion, refreshInventory]
  )
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) throw new Error('useInventory must be used inside InventoryProvider')
  return context
}
