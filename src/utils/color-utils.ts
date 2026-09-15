// ----------------------------------------------------------------------

export function stringToColor(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    // Dynamic soft pastel hue with moderate saturation and high lightness for clean modern UI
    return `hsl(${h}, 85%, 88%)`;
}

export function stringToDarkColor(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    // Dark contrast styling tailored to match the matching pastel base perfectly
    return `hsl(${h}, 70%, 35%)`;
}
