export type Intent = 'rain' | 'snow' | 'hot' | 'cold' | 'wind' | 'cloudy' | 'clear' | 'beach' | 'event' | 'clothing' | 'safety' | 'travel' | 'pet' | 'home' | 'vibe' | 'comfort' | 'general';
export type Timeframe = 'today' | 'tomorrow' | 'weekend' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ParsedIntent {
  intent: Intent;
  timeframe: Timeframe;
}

export function parseIntent(question: string): ParsedIntent {
  const lower = question.toLowerCase();
  
  let intent: Intent = 'general';
  let timeframe: Timeframe = 'today';

  // Timeframe parsing
  if (lower.match(/\btomorrow\b/)) {
    timeframe = 'tomorrow';
  } else if (lower.match(/\b(weekend)\b/)) {
    timeframe = 'weekend';
  } else if (lower.match(/\bmonday\b/)) { timeframe = 'monday'; }
  else if (lower.match(/\btuesday\b/)) { timeframe = 'tuesday'; }
  else if (lower.match(/\bwednesday\b/)) { timeframe = 'wednesday'; }
  else if (lower.match(/\bthursday\b/)) { timeframe = 'thursday'; }
  else if (lower.match(/\bfriday\b/)) { timeframe = 'friday'; }
  else if (lower.match(/\bsaturday\b/)) { timeframe = 'saturday'; }
  else if (lower.match(/\bsunday\b/)) { timeframe = 'sunday'; }

  // Intent parsing (Ordered from most specific to least specific)
  if (lower.match(/\b(tornado|lightning|flood|danger|severe|warning|hazard|survive|die|apocalypse|curse|angry|extreme)\b/)) {
    intent = 'safety';
  } else if (lower.match(/\b(flight|road|drive|driving|commute|commuting|boat|boating|bike|biking|motorcycle|transit|ride|fly|delay)\b/)) {
    intent = 'travel';
  } else if (lower.match(/\b(dog|pet|cat|paw|walk the dog|animal)\b/)) {
    intent = 'pet';
  } else if (lower.match(/\b(lawn|garden|pipe|roof|plant|grass|water|frost danger|home|property)\b/)) {
    intent = 'home';
  } else if (lower.match(/\b(cozy|gloomy|romantic|lazy|spooky|aesthetic|sunset|golden hour|photography|vibe|mood|dramatic)\b/)) {
    intent = 'vibe';
  } else if (lower.match(/\b(sticky|humid|dry|pleasant|miserable|comfortable|ac|heater|heating|air conditioning|sweat|muggy)\b/)) {
    intent = 'comfort';
  } else if (lower.match(/\b(jacket|shorts|hoodie|coat|umbrella|wear|layer|shoes|boots|footwear|dress|clothing)\b/)) {
    intent = 'clothing';
  } else if (lower.match(/\b(barbecue|bbq|picnic|hike|run|outside|party|sport|golf|tennis|outdoor|camp|patio|grill|wedding|concert|festival|tailgate|ceremony|rooftop|social|go out)\b/)) {
    intent = 'event';
  } else if (lower.match(/\b(beach|swim|pool|surf|tan|lake|ocean|sand|fishing)\b/)) {
    intent = 'beach';
  } else if (lower.match(/\b(snow|blizzard|sleet|hail|ice|icy|frost|avalanche|freeze|freezing rain)\b/)) {
    intent = 'snow';
  } else if (lower.match(/\b(rain|wet|storm|drizzle|downpour|hurricane|thunder|typhoon|shower|precip|precipitation)\b/)) {
    intent = 'rain';
  } else if (lower.match(/\b(hot|warm|heat|boiling|scorching|sunscreen|burn|bake|sweltering)\b/)) {
    intent = 'hot';
  } else if (lower.match(/\b(cold|freezing|chilly|shiver|cool|brisk|nippy|parka)\b/)) {
    intent = 'cold';
  } else if (lower.match(/\b(wind|windy|breeze|gust|gale|blow|draft)\b/)) {
    intent = 'wind';
  } else if (lower.match(/\b(cloud|cloudy|overcast|gray|fog|foggy|mist|smog)\b/)) {
    intent = 'cloudy';
  } else if (lower.match(/\b(clear|sunny|sun|bright|blue sky|beautiful)\b/)) {
    intent = 'clear';
  }

  return { intent, timeframe };
}
