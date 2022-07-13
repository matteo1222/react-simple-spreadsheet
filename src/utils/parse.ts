export function parseCellInputValue(cellInputValue: string) {
  if (Number.isNaN(Number(cellInputValue))) {
    return cellInputValue
  }
  return Number(cellInputValue)
}