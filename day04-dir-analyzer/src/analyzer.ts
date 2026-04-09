// Node.jsが最初から持っている強力な機能（モジュール）をインポート
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 指定されたディレクトリ内のすべてのファイルサイズを再帰的に合計して返す
 * @param dirPath 調べたいフォルダのパス
 * @returns 合計サイズ（バイト数）
 */
export async function calculateTotalSize(dirPath: string): Promise<number> {
    let totalSize = 0;

    // 1. フォルダの中にある「ファイルとフォルダのリスト」を取得する
    // withFileTypes: true をつけると、それがファイルかフォルダか判別できるようになります
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    // 2. 取得したリストを1つずつチェックする
    for (const item of items) {
        // パスを結合する（例: 'C:/dev' と 'test.txt' をくっつけて 'C:/dev/test.txt'にする）
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
            // もしアイテムが「フォルダ」なら、さらにその中身を調べるために【自分自身（関数）を呼び出す】
            // これを「再帰処理 (Recursion)」と呼びます！
            totalSize += await calculateTotalSize(fullPath);
        } else {
            // もしアイテムが「ファイル」なら、そのサイズを取得して足し合わせる
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
        }
    }

    return totalSize;
}