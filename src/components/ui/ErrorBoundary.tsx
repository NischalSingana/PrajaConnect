import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-sm">
            <div className="h-16 w-16 rounded-3xl border border-red-500/20 bg-red-500/5 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">Something went wrong</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all mx-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
