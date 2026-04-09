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