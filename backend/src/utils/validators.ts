export const isNonNegativeInteger = (value: unknown): value is number =>
    typeof value === "number" && Number.isInteger(value) && value >= 0;

export const isPositiveInteger = (value: unknown): value is number =>
    typeof value === "number" && Number.isInteger(value) && value > 0;