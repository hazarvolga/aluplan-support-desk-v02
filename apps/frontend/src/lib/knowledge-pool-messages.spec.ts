import { describe, expect, it } from 'vitest';
import tr from '../../messages/tr.json';
import en from '../../messages/en.json';
import de from '../../messages/de.json';

describe('Knowledge Pool crawler messages', () => {
    it.each([
        ['tr', tr],
        ['en', en],
        ['de', de],
    ])('defines the public crawler notice in the active admin namespace for %s', (_locale, messages) => {
        const crawler = messages.admin.knowledge_pool.crawler;

        expect(crawler.public_notice_title).toBeTruthy();
        expect(crawler.public_notice_desc).toBeTruthy();
    });
});
