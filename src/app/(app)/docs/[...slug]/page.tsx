export default function DocsPage({ params }: { params: { slug: string[] } }) {
  return (
    <div className="prose prose-blue max-w-none">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Documentation</h1>
      <nav className="flex mb-8 text-sm text-gray-500">
        <ol className="flex items-center space-x-2">
          <li>Docs</li>
          {params.slug?.map((segment, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span>/</span>
              <span className="capitalize">{segment}</span>
            </li>
          ))}
        </ol>
      </nav>
      <div className="bg-white p-8 rounded-xl border border-gray-100 min-h-[400px]">
        <p className="text-gray-600">Documentation content for: {params.slug?.join('/')}</p>
      </div>
    </div>
  );
}
