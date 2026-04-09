import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './parser';

describe('Markdown Parser', () => {
    it('見出し1 (#) を <h1> タグに変換できるか', () => {
        const input = '# Hello TypeScript';
        const expected = '<h1>Hello TypeScript</h1>';
        expect(parseMarkdown(input)).toBe(expected);
    });

    it('太字 (**) を <strong> タグに変換できるか', () => {
        const input = 'This is **bold** text.';
        const expected = 'This is <strong>bold</strong> text.';
        expect(parseMarkdown(input)).toBe(expected);
    });
});