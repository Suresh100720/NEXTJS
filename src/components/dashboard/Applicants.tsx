'use client';

export default function Applicants({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-8 text-center">Applications</h3>
      <div className="space-y-6">
        {data.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>{item.label}</span>
              <span>{item.val}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${item.val}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}