import WeatherForm from '@/components/WeatherForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-12 px-4 md:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full flex flex-col items-center">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-blue-200">
            8-Ball Weather
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto font-light">
            Ask a question. But remember it&apos;s just an 8-ball so don&apos;t go too crazy...
          </p>
        </header>

        <WeatherForm />
      </div>
    </main>
  );
}
