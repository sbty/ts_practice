import { z } from 'zod';

export const WeatherResponseSchema = z.object({
  current_weather: z.object({
    temperature: z.number(),
    windspeed: z.number(),
    time: z.string(),
  }),
});

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;

export async function fetchTokyoWeather(): Promise<WeatherResponse> {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true';
  const response = await fetch(url);
  const data = await response.json();

  return WeatherResponseSchema.parse(data);
}