'use client';

import { useState } from 'react';
import { MapPin, CloudRain, Thermometer, Plane, Home, Smile, Shirt } from 'lucide-react';
import Magic8Ball from './Magic8Ball';
import { parseIntent } from '@/lib/intent';
import { getWeatherData, analyzeWeather } from '@/lib/weather';
import { getResponse } from '@/lib/8ball';

export default function WeatherForm() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string, explanation: string } | null>(null);
  const [error, setError] = useState('');
  const [locationMode, setLocationMode] = useState<'auto' | 'default'>('default');
  const [coords, setCoords] = useState<{ lat: number, lon: number } | null>(null);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocationMode('auto');
        },
        () => {
          // If denied, fallback to default
          setLocationMode('default');
        }
      );
    }
  };

  const submitQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const userLat = coords?.lat ?? 40.7128;
      const userLon = coords?.lon ?? -74.0060;

      // 1. Fetch real weather data from Open-Meteo
      const weatherData = await getWeatherData(userLat, userLon);

      // 2. Parse the user's intent
      const intent = parseIntent(question);

      // 3. Analyze weather data against the intent
      const analysis = analyzeWeather(weatherData, intent);

      // 4. Map the score to a Magic 8-Ball response
      const answer = getResponse(analysis.score);

      // Add a slight delay to mimic the ball "thinking" and let the animation play
      setTimeout(() => {
        setResult({ answer: answer, explanation: analysis.explanation });
        setIsLoading(false);
      }, 2000);

    } catch (err) {
      setTimeout(() => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const taxonomyCategories = [
    { icon: <CloudRain size={18} className="text-blue-400" />, title: "Precipitation", examples: "Rain, snow, storms" },
    { icon: <Thermometer size={18} className="text-orange-400" />, title: "Temperature", examples: "Hot, freezing, shorts weather" },
    { icon: <Smile size={18} className="text-yellow-400" />, title: "Vibe & Comfort", examples: "Cozy, humid, pleasant" },
    { icon: <Home size={18} className="text-green-400" />, title: "Home & Pets", examples: "Dog walks, lawn watering" },
    { icon: <Plane size={18} className="text-indigo-400" />, title: "Travel & Safety", examples: "Delays, road conditions" },
    { icon: <Shirt size={18} className="text-pink-400" />, title: "Clothing", examples: "Jackets, layers, umbrella" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 relative">
      {/* 8-Ball visual */}
      <Magic8Ball isShaking={isLoading} answer={result?.answer || null} onShake={submitQuestion} />

      {/* Results / Error space */}
      <div className="h-16 flex items-center justify-center text-center px-4 w-full">
        {result?.explanation ? (
          <p className="text-gray-300 italic animate-fade-in text-lg font-medium tracking-wide">
            {result.explanation}
          </p>
        ) : error ? (
          <p className="text-red-400 font-medium">{error}</p>
        ) : isLoading ? (
          <p className="text-gray-400 animate-pulse italic">Consulting the weather spirits...</p>
        ) : (
          <p className="text-gray-500 italic">Ask a question to begin.</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col items-center bg-gray-900 rounded-xl border border-gray-700 shadow-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all p-1">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            className="w-full bg-transparent text-white px-6 py-4 outline-none placeholder:text-gray-500 text-center text-lg"
            disabled={isLoading}
          />
          <p className="text-gray-400 text-sm mb-3 mt-1 animate-pulse">
            👆 Shake what ya mamma gave ya
          </p>
        </div>
      </form>

      {/* Geolocation toggle */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={requestLocation}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${locationMode === 'auto'
            ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
            : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
        >
          <MapPin size={14} />
          {locationMode === 'auto' ? 'Using precise location' : 'Use my location'}
        </button>
      </div>

      {/* Types of Questions Area */}
      {!result && !isLoading && (
        <div className="w-full mt-8 animate-fade-in">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 text-center mb-6 font-semibold">
            What you can ask about
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {taxonomyCategories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-300 flex flex-col items-center text-center cursor-default group"
              >
                <div className="bg-gray-900 p-2.5 rounded-lg mb-3 shadow-inner group-hover:scale-110 group-hover:bg-gray-800 transition-all duration-300">
                  {cat.icon}
                </div>
                <h4 className="text-gray-300 font-medium text-sm mb-1">{cat.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{cat.examples}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
