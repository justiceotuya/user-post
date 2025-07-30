import { Link } from '@tanstack/react-router'

export function NotFound({ children }: { children?: any }) {
  return (

    <main>
      <div className='max-w-[855px] mx-auto  mt-32'>
        <h1 className="text-6xl font-medium text-gray-900 mb-6">Error</h1>
        <div className='rounded-xl bg-white p-4 mt-4 border border-gray-200'>
          <div className="space-y-2 p-2">
            <div className="text-gray-600  text-3xl font-bold flex items-center justify-center">
              {children || <p>The page you are looking for does not exist.</p>}
            </div>
            <p className="flex items-center gap-2 flex-wrap justify-center mt-10">
              <button
                onClick={() => window.history.back()}
                className="bg-purple-500 text-white px-2 py-1 rounded uppercase font-black text-sm"
              >
                Go back
              </button>
              <Link
                to="/"
                className="bg-cyan-600 text-white px-2 py-1 rounded uppercase font-black text-sm"
              >
                Reload
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
