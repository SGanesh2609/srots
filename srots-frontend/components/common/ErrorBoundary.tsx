
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  // Explicitly declare props to satisfy strict TS configurations if needed
  readonly props: Readonly<Props>;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50 font-sans">
          <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4 shadow-sm">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            The application encountered an unexpected error.
          </p>
          {this.state.error && (
            <div className="bg-white p-4 rounded-lg border border-red-100 text-left w-full max-w-lg mb-6 overflow-auto max-h-40 shadow-sm">
               <p className="font-mono text-xs text-red-500 break-words whitespace-pre-wrap">
                  {this.state.error.toString()}
               </p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
          >
            <RefreshCw size={20} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
