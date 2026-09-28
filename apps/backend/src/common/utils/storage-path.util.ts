import { NotFoundException } from '@nestjs/common';
import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export function normalizeStorageKey(value: string | string[] | undefined): string {
    const key = Array.isArray(value) ? value.join('/') : value;
    if (!key || /[\\\x00-\x1f]/.test(key) || key.split('/').some(segment => !segment || segment === '.' || segment === '..')) {
        throw new NotFoundException('File not found');
    }
    return key;
}

export function publicLogoKey(value: string | string[] | undefined): string {
    const key = normalizeStorageKey(value);
    if (!/^brand\/logos\/[^/]+\.(png|jpe?g|gif|svg|webp)$/i.test(key)) {
        throw new NotFoundException('File not found');
    }
    return key;
}

export async function openLocalStorageFile(localPath: string, key: string) {
    let file: fs.FileHandle | undefined;
    try {
        const base = await fs.realpath(path.resolve(localPath));
        const target = path.resolve(base, normalizeStorageKey(key));
        if (!target.startsWith(base + path.sep) || await fs.realpath(target) !== target) {
            throw new NotFoundException('File not found');
        }
        file = await fs.open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
        const stats = await file.stat();
        if (!stats.isFile()) throw new NotFoundException('File not found');
        return { file, stats };
    } catch (_error) {
        await file?.close();
        throw new NotFoundException('File not found');
    }
}
