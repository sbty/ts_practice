import { expect, test } from 'vitest';
import { add } from './math';

test('1 + 2 は 3になるべき', () => {
    // expect() で与えた結果が、toBe() の期待値と一致するかをチェックする
    expect(add(1, 2)).toBe(3);
});