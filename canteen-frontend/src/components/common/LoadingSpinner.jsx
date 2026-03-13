/**
 * LoadingSpinner
 *
 * Props:
 *  size    — 'sm' | 'md' (default) | 'lg' | 'xl'
 *  message — optional text shown below the spinner
 *  fullPage — if true, centres the spinner in the full viewport
 */
export default function LoadingSpinner({ size = 'md', message, fullPage = false }) {
  const sizeMap = {
    sm:  'h-6  w-6  border-2',
    md:  'h-10 w-10 border-4',
    lg:  'h-16 w-16 border-4',
    xl:  'h-24 w-24 border-[6px]',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`animate-spin rounded-full border-amber-500 border-t-transparent ${sizeMap[size]}`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm text-gray-400 animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}
