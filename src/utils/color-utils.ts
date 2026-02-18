
// ----------------------------------------------------------------------

export function stringToColor(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 80%)`; // Pastel colors
}

export function stringToDarkColor(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 30%)`; // Darker version for text
}
