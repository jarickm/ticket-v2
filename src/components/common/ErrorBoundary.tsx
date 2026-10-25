import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      // Clear CCI-specific storage to eliminate corrupted cache
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cci_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed clearing storage:', e);
    }
    window.location.reload();
  };

  handleClearAll = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed clearing storage:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 antialiased">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient accent header */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-rose-500 to-amber-500" />

            {/* Header / Brand */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Coolaire Workspace Recovery
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  Application encountered an unexpected runtime error.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6">
              <div className="text-xs font-mono text-rose-400 font-bold mb-1 break-words">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown error occurred.'}
              </div>
              {this.state.errorInfo?.componentStack && (
                <details className="mt-2 text-[11px] font-mono text-slate-400">
                  <summary className="cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                    Component Call Stack
                  </summary>
                  <pre className="mt-2 max-h-36 overflow-auto text-[10px] p-2 bg-slate-900 rounded-xl whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Explanatory notice */}
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              This usually happens when browser-cached settings become out of sync or during network interrupts.
              Resetting the workspace cache will restore official default settings without affecting server-side records.
            </p>

            {/* Recovery Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <button
                onClick={this.handleResetState}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Cache & Restore Defaults</span>
              </button>

              <button
                onClick={this.handleReload}
                className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload</span>
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={this.handleClearAll}
                className="text-[11px] text-slate-400 hover:text-slate-300 underline cursor-pointer"
              >
                Full Storage Reset (Clear All Cookies & Local Storage)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
