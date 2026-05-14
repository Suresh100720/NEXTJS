export default function AppLoading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-indigo-600 border-t-transparent shadow-xl shadow-indigo-100"></div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Loading Data...</p>
      </div>
    </div>
  );
}
