import { calculateTotalSize } from './analyzer';
import * as path from 'path';

async function main() {
    // ターゲットを「初日に作った day01 のフォルダ」にしてみます
    const targetDir = path.resolve('../day01-ts-setup');
    console.log(`📂 [${targetDir}] の中身を調べています...`);

    try {
        const sizeInBytes = await calculateTotalSize(targetDir);

        // バイトだと分かりにくいので キロバイト(KB) に変換して少数第二位までに丸める
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        console.log(`✅ 合計サイズ: ${sizeInKB} KB です！`);

    } catch (error) {
        console.error("❌ エラーが発生しました:", error);
    }
}

main();