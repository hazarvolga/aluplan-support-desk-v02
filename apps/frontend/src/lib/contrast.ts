function normalizeHex(hex: string): string {
    const clean = hex.replace('#', '').trim();
    if (/^[0-9a-fA-F]{3}$/.test(clean)) {
        return clean.split('').map((char) => char + char).join('').toLowerCase();
    }
    if (/^[0-9a-fA-F]{6}$/.test(clean)) {
        return clean.toLowerCase();
    }
    throw new Error(`Invalid hex color: ${hex}`);
}

function channelToLinear(value: number): number {
    const normalized = value / 255;
    return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
    const normalized = normalizeHex(hex);
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);

    return (
        0.2126 * channelToLinear(red) +
        0.7152 * channelToLinear(green) +
        0.0722 * channelToLinear(blue)
    );
}

export function contrastRatio(foreground: string, background: string): number {
    const foregroundLuminance = relativeLuminance(foreground);
    const backgroundLuminance = relativeLuminance(background);
    const lighter = Math.max(foregroundLuminance, backgroundLuminance);
    const darker = Math.min(foregroundLuminance, backgroundLuminance);

    return (lighter + 0.05) / (darker + 0.05);
}

export function passesAA(foreground: string, background: string): boolean {
    return contrastRatio(foreground, background) >= 4.5;
}

export function passesAALarge(foreground: string, background: string): boolean {
    return contrastRatio(foreground, background) >= 3;
}

export function blendWithBackground(color: string, opacity: number, background: string): string {
    const clampedOpacity = Math.min(1, Math.max(0, opacity));
    const foreground = normalizeHex(color);
    const backdrop = normalizeHex(background);
    const channels = [0, 2, 4].map((offset) => {
        const fg = parseInt(foreground.slice(offset, offset + 2), 16);
        const bg = parseInt(backdrop.slice(offset, offset + 2), 16);
        return Math.round(fg * clampedOpacity + bg * (1 - clampedOpacity));
    });

    return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
