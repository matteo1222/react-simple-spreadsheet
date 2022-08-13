export function parseCellInputValue(cellInputValue) {
    if (cellInputValue === '')
        return cellInputValue;
    if (Number.isNaN(Number(cellInputValue))) {
        return cellInputValue;
    }
    return Number(cellInputValue);
}
