import { describe, expect, it } from 'vitest';
import { blendWithBackground, contrastRatio, passesAA, passesAALarge, relativeLuminance } from './contrast';

describe('contrast utilities', () => {
    it('calculates WCAG contrast boundaries', () => {
        expect(relativeLuminance('#000000')).toBe(0);
        expect(relativeLuminance('#ffffff')).toBe(1);
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 4);
        expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
    });

    it('validates AA thresholds', () => {
        expect(passesAA('#334155', '#f1f5f9')).toBe(true);
        expect(passesAA('#334155', '#f8fafc')).toBe(true);
        expect(passesAA('#1e293b', '#f1f5f9')).toBe(true);
        expect(passesAALarge('#ffffff', '#60a5fa')).toBe(false);
        expect(passesAA('#ffffff', '#1d4ed8')).toBe(true);
    });

    it('blends translucent colors over a background', () => {
        expect(blendWithBackground('#ffffff', 0, '#000000')).toBe('#000000');
        expect(blendWithBackground('#ffffff', 1, '#000000')).toBe('#ffffff');
        expect(blendWithBackground('#ffffff', 0.5, '#000000')).toBe('#808080');
    });
});
