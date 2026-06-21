import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  retryLabel?: string;
  errorTitle?: string;
}

interface State {
  hasError: boolean;
  message?: string;
  stack?: string;
  componentStack?: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message, stack: error.stack };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[NavPal ErrorBoundary]', error, info.componentStack);
    this.setState({ componentStack: info.componentStack ?? undefined });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm font-semibold text-gray-700 mb-1">{this.props.errorTitle ?? '组件加载失败'}</p>
          <p className="text-xs text-gray-400 mb-4">{this.state.message}</p>
          {this.state.stack && (
            <pre className="text-xs text-gray-300 mb-4 text-left whitespace-pre-wrap max-h-24 overflow-y-auto">{this.state.stack}</pre>
          )}
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl"
          >
            {this.props.retryLabel ?? '重试'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}