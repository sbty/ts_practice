import { describe, expect, it } from 'vitest';
import { WeatherResponseSchema } from './weather';

describe('Weather API Response Validator', () => {
    it('正しい構成のJSONが入ってきたらパスする', () => {
        const mockData = { current_weather: { temperature: 20.5, windspeed: 5.0, time: "2024-04-09T10:00" } };
        const result = WeatherResponseSchema.parse(mockData);
        expect(result.current_weather.temperature).toBe(20.5);
    });

    it('不正なデータ（数値が入るべきところに文字列）だとエラーを出す', () => {
        const badData = { current_weather: { temperature: "暑い", windspeed: 5.0, time: "2024-04-09T10:00" } };
        expect(() => WeatherResponseSchema.parse(badData)).toThrow();
    });
});
