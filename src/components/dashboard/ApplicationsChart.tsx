'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Legend() {
  return (
    <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold">
      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#6366F1]"></div> Applications</div>
      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></div> Shortlisted</div>
      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#FF4B4B]"></div> Rejected</div>
    </div>
  );
}

export default function ApplicationsChart({ data }: { data: any[] }) {
  return (
    <div className="col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-slate-800">Statistics of Active Applications</h3>
        <select className="text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border-none text-slate-500">
          <option>Week</option>
        </select>
      </div>
      <div className="h-[280px] flex flex-col pb-2">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="apps" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={8} />
              <Bar dataKey="short" fill="#FFB800" radius={[4, 4, 0, 0]} barSize={8} />
              <Bar dataKey="rej" fill="#FF4B4B" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Legend />
      </div>
    </div>
  );
}
