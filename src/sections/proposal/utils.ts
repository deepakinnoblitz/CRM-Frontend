export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
    return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}
