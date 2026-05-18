import { ParsedIntent } from './intent';

// Using Open-Meteo API (no API key required)
export async function getWeatherData(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return res.json();
}

export interface WeatherAnalysis {
  score: number; // -1 to 1
  explanation: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function analyzeWeather(data: any, intent: ParsedIntent): WeatherAnalysis {
  // Determine which day to look at based on timeframe
  let dayIndex = 0;
  if (intent.timeframe === 'tomorrow') {
    dayIndex = 1;
  } else if (intent.timeframe === 'weekend') {
    // Basic approximation: find first Saturday/Sunday or just look 2-3 days ahead
    // Open-Meteo daily.time is array of strings like "YYYY-MM-DD"
    const times: string[] = data.daily.time;
    const weekendIndex = times.findIndex(t => {
      const date = new Date(t);
      const day = date.getDay();
      return day === 5 || day === 6; // Friday night/Saturday
    });
    dayIndex = weekendIndex >= 0 ? weekendIndex : 0;
  } else if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(intent.timeframe)) {
    const daysMap: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
    };
    const targetDay = daysMap[intent.timeframe];
    const times: string[] = data.daily.time;
    const dayIndexMatch = times.findIndex(t => {
      const date = new Date(t);
      return date.getUTCDay() === targetDay;
    });
    dayIndex = dayIndexMatch >= 0 ? dayIndexMatch : 0;
  }

  const maxTemp = data.daily.temperature_2m_max[dayIndex]; // Fahrenheit
  const minTemp = data.daily.temperature_2m_min[dayIndex]; // Fahrenheit
  const precipProb = data.daily.precipitation_probability_max[dayIndex]; // %
  const windSpeed = data.daily.wind_speed_10m_max[dayIndex]; // mph
  const weatherCode = data.daily.weather_code[dayIndex]; // WMO code

  let score = 0;
  let explanation = '';

  const isRainy = precipProb > 40 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode);
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isSunny = [0, 1, 2].includes(weatherCode);
  const isCloudy = [3, 45, 48].includes(weatherCode);
  const isHot = maxTemp > 82;
  const isWarm = maxTemp > 68 && maxTemp <= 82;
  const isCold = maxTemp < 50;
  const isWindy = windSpeed > 15;

  switch (intent.intent) {
    case 'rain':
      score = (precipProb / 50) - 1.0;
      if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode) && score < 0) {
        score = 0;
      }
      if (precipProb >= 70) {
        explanation = `There is a high ${precipProb}% chance of precipitation.`;
      } else if (precipProb >= 30) {
        explanation = `There is a moderate ${precipProb}% chance of precipitation.`;
      } else if (score === 0) {
        explanation = `There is a slight ${precipProb}% chance of precipitation.`;
      } else {
        explanation = `It looks pretty dry with only a ${precipProb}% chance of rain.`;
      }
      break;

    case 'snow':
      if (isSnowy) {
        score = 0.9;
        explanation = `Yes, expect snow! Temperatures will be around ${Math.round(maxTemp)}°F.`;
      } else if (isCold && precipProb > 40) {
        score = 0.5;
        explanation = `It's cold (${Math.round(maxTemp)}°F) with a ${precipProb}% chance of precipitation, so snow is possible.`;
      } else {
        score = -0.9;
        explanation = `Unlikely to snow. The high is ${Math.round(maxTemp)}°F with a ${precipProb}% chance of precipitation.`;
      }
      break;

    case 'hot':
      if (isHot) {
        score = 0.9;
        explanation = `Yes, it will be quite hot with a high of ${Math.round(maxTemp)}°F!`;
      } else if (isWarm) {
        score = 0.4;
        explanation = `It will be warm, reaching ${Math.round(maxTemp)}°F, but maybe not sweltering.`;
      } else {
        score = -0.8;
        explanation = `Not hot at all. The high is only ${Math.round(maxTemp)}°F.`;
      }
      break;

    case 'cold':
      if (isCold) {
        score = 0.9;
        explanation = `Yes, it will be chilly with a high of ${Math.round(maxTemp)}°F. Bundle up!`;
      } else if (!isWarm && !isHot) {
        score = 0.3;
        explanation = `It will be cool, reaching ${Math.round(maxTemp)}°F. A light jacket might be needed.`;
      } else {
        score = -0.9;
        explanation = `Not cold at all! It will reach ${Math.round(maxTemp)}°F.`;
      }
      break;

    case 'wind':
      if (isWindy) {
        score = 0.8;
        explanation = `Yes, it will be quite windy with gusts up to ${Math.round(windSpeed)} mph.`;
      } else {
        score = -0.8;
        explanation = `Not particularly windy. Max winds around ${Math.round(windSpeed)} mph.`;
      }
      break;

    case 'cloudy':
      if (isCloudy) {
        score = 0.8;
        explanation = `Yes, expect cloudy or overcast skies.`;
      } else if (isSunny) {
        score = -0.8;
        explanation = `No, it should be pretty clear and sunny!`;
      } else {
        score = 0;
        explanation = `There might be some mixed skies or precipitation.`;
      }
      break;

    case 'clear':
      if (isSunny && !isRainy) {
        score = 0.9;
        explanation = `Yes, it looks like a clear and sunny day!`;
      } else if (isCloudy || isRainy) {
        score = -0.8;
        explanation = `No, it will likely be ${isRainy ? 'rainy' : 'cloudy'}.`;
      } else {
        score = 0;
        explanation = `It might be partly clear, but weather is mixed.`;
      }
      break;

    case 'beach':
      if (isSunny && (isHot || isWarm) && !isRainy && !isWindy) {
        score = 0.9;
        explanation = `Perfect beach weather! Sunny and ${Math.round(maxTemp)}°F.`;
      } else if (isRainy || isCold) {
        score = -0.9;
        explanation = `Not great for the beach. ${isRainy ? 'It might rain.' : 'It will be quite cool.'}`;
      } else {
        score = -0.2;
        explanation = `It's okay, but maybe a bit ${isWindy ? 'windy' : 'cloudy'} or mild (${Math.round(maxTemp)}°F).`;
      }
      break;

    case 'event':
      if (isRainy || isSnowy) {
        score = -0.8;
        explanation = `Outdoor plans might be ruined by a ${precipProb}% chance of precipitation.`;
      } else if (isWindy || isCold) {
        score = -0.3;
        explanation = `It's dry, but beware of ${isWindy ? 'wind' : 'cooler temperatures'} (${Math.round(maxTemp)}°F).`;
      } else {
        score = 0.8;
        explanation = `Great conditions for an outdoor event! High of ${Math.round(maxTemp)}°F and mostly dry.`;
      }
      break;

    case 'clothing':
      if (isRainy && isCold) {
        score = -0.8;
        explanation = `You'll need a warm coat and an umbrella! (${Math.round(maxTemp)}°F and rainy).`;
      } else if (isRainy) {
        score = -0.5;
        explanation = `Definitely bring an umbrella or rain jacket.`;
      } else if (isHot) {
        score = 0.8;
        explanation = `Shorts and a t-shirt weather! It's going to be ${Math.round(maxTemp)}°F.`;
      } else if (isCold) {
        score = -0.8;
        explanation = `Bundle up! It's chilly out there, reaching only ${Math.round(maxTemp)}°F.`;
      } else {
        score = 0;
        explanation = `Layers are a good idea. The high is ${Math.round(maxTemp)}°F.`;
      }
      break;

    case 'safety':
      if (isSnowy || isRainy || isWindy) {
        score = -0.9;
        explanation = `Please be careful. There are ${isSnowy ? 'snowy/icy' : isWindy ? 'high wind' : 'heavy precipitation'} conditions.`;
      } else if (isHot && maxTemp > 95) {
        score = -0.8;
        explanation = `Extreme heat warning! Stay hydrated and out of the sun. (${Math.round(maxTemp)}°F)`;
      } else {
        score = 0.9;
        explanation = `Conditions look safe and calm. No major hazards detected.`;
      }
      break;

    case 'travel':
      if (isSnowy || (isRainy && isWindy)) {
        score = -0.8;
        explanation = `Travel conditions are poor. Expect delays due to ${isSnowy ? 'snow' : 'wind and rain'}.`;
      } else if (isRainy) {
        score = -0.4;
        explanation = `Roads might be wet, drive carefully.`;
      } else {
        score = 0.8;
        explanation = `Good travel conditions! The weather is mostly clear.`;
      }
      break;

    case 'pet':
      if (isHot) {
        score = -0.7;
        explanation = `The pavement will be too hot for paws! Wait until evening. (${Math.round(maxTemp)}°F)`;
      } else if (isRainy || isSnowy) {
        score = -0.5;
        explanation = `Might be a quick potty break only. It's ${isSnowy ? 'snowy' : 'rainy'}.`;
      } else {
        score = 0.9;
        explanation = `Perfect weather for a walk! Temps around ${Math.round(maxTemp)}°F.`;
      }
      break;

    case 'home':
      if (isRainy) {
        score = 0.8;
        explanation = `No need to water the lawn, rain is on the way!`;
      } else if (isCold && minTemp < 32) {
        score = -0.9;
        explanation = `Frost danger! Protect your plants and pipes, it will drop to ${Math.round(minTemp)}°F.`;
      } else if (isHot && precipProb < 20) {
        score = -0.5;
        explanation = `It's hot and dry. Make sure to water the garden!`;
      } else {
        score = 0.5;
        explanation = `Conditions are mild for home and garden maintenance.`;
      }
      break;

    case 'vibe':
      if (isRainy || isCloudy) {
        score = 0.7;
        explanation = `Perfect cozy, moody weather. Grab a blanket and some tea.`;
      } else if (isSunny) {
        score = 0.8;
        explanation = `Bright and cheerful! Great golden hour potential.`;
      } else {
        score = 0;
        explanation = `Just a regular day, honestly. Vibe is neutral.`;
      }
      break;

    case 'comfort':
      if (isHot && precipProb > 30) {
        score = -0.8;
        explanation = `It might feel muggy and sticky today (${Math.round(maxTemp)}°F with some moisture).`;
      } else if (isSunny && isWarm) {
        score = 0.9;
        explanation = `Very comfortable! Great temperatures around ${Math.round(maxTemp)}°F.`;
      } else if (isCold || isWindy) {
        score = -0.6;
        explanation = `Not the most comfortable. It's quite ${isCold ? 'chilly' : 'windy'}.`;
      } else {
        score = 0.4;
        explanation = `Conditions are fairly pleasant and mild.`;
      }
      break;

    case 'general':
    default:
      if (isRainy || isWindy || isCold || isSnowy) {
        score = -0.5;
        explanation = `Expect sub-optimal weather: ${isSnowy ? 'Snowy' : isRainy ? 'Rainy' : (isWindy ? 'Windy' : 'Cold')}.`;
      } else {
        score = 0.7;
        explanation = `The weather looks fairly pleasant, reaching ${Math.round(maxTemp)}°F.`;
      }
      break;
  }

  return { score, explanation };
}
