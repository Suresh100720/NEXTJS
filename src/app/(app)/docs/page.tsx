import Link from 'next/link';

export default function DocsMainPage() {
  const sections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using the Recruitment platform.',
      items: [
        { name: 'Introduction', href: '/docs/intro' },
        { name: 'Quick Start', href: '/docs/quickstart' },
      ]
    },
    {
      title: 'Core Features',
      description: 'Explore the key functionalities available in your dashboard.',
      items: [
        { name: 'Managing Jobs', href: '/docs/jobs' },
        { name: 'Candidate Tracking', href: '/docs/candidates' },
        { name: 'AI Summary Generation', href: '/docs/ai-features' },
      ]
    },
    {
      title: 'API & Integration',
      description: 'Technical details for developers and system administrators.',
      items: [
        { name: 'API Reference', href: '/docs/api' },
        { name: 'Authentication', href: '/docs/auth' },
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Documentation</h1>
        <p className="text-slate-500 font-bold text-sm mt-3 leading-relaxed">
          Welcome to the Recruitment platform help center. Explore guides, API references, and best practices to optimize your hiring workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section) => (
          <div key={section.title} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group">
            <h2 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {section.title}
            </h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
              {section.description}
            </p>
            <div className="space-y-3">
              {section.items.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl group/item transition-all border border-transparent hover:border-indigo-100"
                >
                  <span className="text-sm font-black text-slate-600 group-hover/item:text-indigo-600">
                    {item.name}
                  </span>
                  <span className="text-slate-300 group-hover/item:text-indigo-400 transition-transform group-hover/item:translate-x-1">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h3 className="text-3xl font-black mb-4">Need personalized help?</h3>
          <p className="text-indigo-100 font-bold text-sm mb-8 leading-relaxed">
            Our support team is available 24/7 to help you with any technical issues or architectural questions.
          </p>
          <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-50 transition-all active:scale-95">
            Contact Support
          </button>
        </div>
        {/* Abstract shapes for premium look */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      </div>
    </div>
  );
}
