import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <div className="space-y-4">
        <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-b from-slate-900 to-slate-500 bg-clip-text text-transparent">
          The future of hiring <br /> is here.
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Experience the power of Nex. A recruitment platform built for speed, 
          driven by intelligence, and designed for humans.
        </p>
      </div>

      <div className="flex gap-4">
        <Link 
          href="/dashboard" 
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-200"
        >
          Enter Dashboard
        </Link>
        <Link 
          href="/docs/intro" 
          className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl font-bold text-lg text-slate-900 transition-all shadow-sm"
        >
          Read Docs
        </Link>
      </div>

      <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl">
        {[
          { title: 'AI Matching', desc: 'Find the perfect candidate with our neural scoring engine.' },
          { title: 'Parallel Routing', desc: 'Seamlessly navigate through candidate profiles without losing context.' },
          { title: 'Real-time Analytics', desc: 'Monitor your hiring pipeline with live dashboard updates.' },
        ].map((feature) => (
          <div key={feature.title} className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2 text-indigo-600">{feature.title}</h3>
            <p className="text-slate-500">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
