export function LoadingScreen() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-4 rounded-full border-4 border-r-indigo-500 border-t-transparent border-b-transparent border-l-transparent animate-spin-slow"></div>
            <div className="absolute inset-6 rounded-full border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent animate-spin-slower"></div>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            SOLANA STAKING
          </span>
        </div>
      </div>
    </div>
  );
}
