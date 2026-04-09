# Day 3: 非同期処理API連携と型安全（Zod）の実践

本日は「外部の天気APIからデータを取ってくるCLI」を作ります。
JavaScript（TypeScript）での開発で最も多く使われる `async/await` による非同期通信と、**外部から届いたデータが本当に予測通りの形をしているか**を検証する最強のライブラリ `Zod` の使い方を学びます！

---

## 1. フォルダの準備とZodのインストール

以下をターミナルで実行して、環境を用意します。本日は `zod` を追加でインストールします。

```powershell
cd C:\dev\ts_practice
mkdir day03-weather-cli
cd day03-weather-cli
mkdir src

# 環境ファイルの引継ぎとインストール
Copy-Item ../day01-ts-setup/package.json .
Copy-Item ../day01-ts-setup/tsconfig.json .
npm install

# 実行時バリデーションライブラリ Zod の導入
npm i zod
```

---

## 2. APIフェッチングとZodによる型チェック (実装)

`src` フォルダ内に `weather.ts` を作成し、以下をコピペします。
（今回は認証不要のパブリックAPI「Open-Meteo」を利用して東京の天気を取得します）

**📄 `src/weather.ts`**
```typescript
import { z } from 'zod';

// 1. Zodを使って「APIが返してくるJSONの仕様書（スキーマ）」を定義する
export const WeatherResponseSchema = z.object({
  current_weather: z.object({
    temperature: z.number(), // 気温は必ず数値型！
    windspeed: z.number(),
    time: z.string(),
  }),
});

// 2. TypeScriptの型定義（type）を、Zodスキーマから自動で抽出！
// 手書きで type WeatherResponse = { ... } と書かなくてよいのが超便利！
export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;

/**
 * 外部API通信 (async / await)
 */
export async function fetchTokyoWeather(): Promise<WeatherResponse> {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true';
  const response = await fetch(url);
  const data = await response.json(); // ここで返ってくる data は『any型（何が入っているか不明）』

  // 3. parse() を通すことで、構造が仕様通りかチェックする！
  // 만一APIの仕様が変わって `temperature` に文字列が入っていたらここでエラーにして防ぐ！
  return WeatherResponseSchema.parse(data);
}
```

> **💡 解説 (なぜZodが必要か)**:
> 普段私たちが書くTypeScriptの型定義（`type User = ...` など）は、プログラムを実行すると**消失**します。そのため、外（APIやDB）から来たデータが正しい形かどうかを「実行時に」チェックすることができませんでした。
> `Zod` を使うと、実行時にもバリデーションで弾きつつ、開発時のTS型としても自動で使い回せるようになります。

---

## 3. テストの作成 (安全かどうかの検証)

`src` 内に `weather.test.ts` を作成してください。
外部API通信そのものをテストに組み込むと、ネットワークエラーで落ちて「不安定なテスト(Flaky test)」になるため、今回は「Zodによるデータチェックの堅牢性」をテストします。

**📄 `src/weather.test.ts`**
```typescript
import { describe, expect, it } from 'vitest';
import { WeatherResponseSchema } from './weather';

describe('Weather API Response Validator', () => {
    it('正しい構成のJSONが入ってきたらパスする', () => {
        // ダミーデータ
        const mockData = { current_weather: { temperature: 20.5, windspeed: 5.0, time: "2024-04-09T10:00" } };
        // エラーなくパースでき、値が取得できるか
        const result = WeatherResponseSchema.parse(mockData);
        expect(result.current_weather.temperature).toBe(20.5);
    });

    it('不正なデータ（数値が入るべきところに文字列）だとエラーを出す', () => {
        // "暑い" という明らかに間違ったデータを入れてみる
        const badData = { current_weather: { temperature: "暑い", windspeed: 5.0, time: "2024-04-09T10:00" } };
        
        // toThrow() を使うと「この関数はエラーを出すはずだ」というテストになります
        expect(() => WeatherResponseSchema.parse(badData)).toThrow();
    });
});
```

実行してテストがPASSすることを確認します。
```powershell
npm run test
```

---

## 4. プログラムを実行して実際の通信を見る！

せっかくなので作成した関数を使って、実際に通信してみましょう。「動かす用」のエントリポイント機能を作ります。
`src` フォルダ内に `index.ts` を作成してください。

**📄 `src/index.ts`**
```typescript
import { fetchTokyoWeather } from './weather';

async function main() {
    console.log("🌦️ 東京の現在の天気を取得中...");
    try {
        const weather = await fetchTokyoWeather();
        console.log(`現在の東京の気温は ${weather.current_weather.temperature}℃ です！`);
    } catch (error) {
        console.error("データの取得や型チェックに失敗しました:", error);
    }
}

main();
```

これを作成したら、以下のコマンドで実行してみましょう！

```powershell
npx ts-node src/index.ts
```
> ※ `npx ts-node` は、コンパイルせずにTypeScriptのファイルをさくっと実行したい時に使う魔法のコマンドです。

気温が無事にコンソールへ出力されれば完了です！

---

## 5. Gitコミットの手順

```powershell
# ルートフォルダに移動する
cd C:\dev\ts_practice

# Day 3用の機能ブランチを切る
git checkout -b feature/day03-weather-cli

# 作業内容をステージに追加してコミット
git add day03-weather-cli
git commit -m "feat: 天気APIのデータフェッチとZodの導入"

# メインブランチに統合してPush
git checkout main
git merge feature/day03-weather-cli
git push origin main
```

以上でDay 3は終了です！お疲れ様でした💪
