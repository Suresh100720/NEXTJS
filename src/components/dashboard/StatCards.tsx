'use client';

export default function StatCards({ cards, onCardClick }: { cards: any[], onCardClick: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {cards.map((stat) => (
        <button
          key={stat.id}
          onClick={() => onCardClick(stat.id)}
          className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group text-left w-full active:scale-95"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
          </div>
          <div className="flex items-end justify-between">
            <div className={`text-4xl font-black ${stat.color} leading-none tracking-tighter`}>{stat.value}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
