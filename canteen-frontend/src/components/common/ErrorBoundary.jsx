import { Component } from 'react';

/**
 * ErrorBoundary — catches render errors in the component tree.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   // With custom fallback:
 *   <ErrorBoundary fallback={<p>Something broke.</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console; swap for a real error-tracking service if needed
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[300px] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-1">
            An unexpected error occurred while rendering this section.
          </p>
          {this.state.error && (
            <p className="text-xs text-red-400 font-mono bg-red-50 rounded-lg p-3 mb-4 text-left break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-5 py-2 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition text-sm"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
