export const CURRENCY = 'LKR'
export const LOCALE = 'en-LK'

export function formatPrice(price: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}