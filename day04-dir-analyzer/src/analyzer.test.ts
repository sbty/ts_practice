import { describe, expect, it } from 'vitest';
import { calculateTotalSize } from './analyzer';

describe('Directory Analyzer', () => {
    it('存在しないパスを渡した時、エラーを投げること', async () => {
        const dummyPath = './絶対に存在しない隠されしフォルダ';

        // await が絡むエラーのテストは、rejects.toThrow() を使います
        await expect(calculateTotalSize(dummyPath)).rejects.toThrow();
    });
});