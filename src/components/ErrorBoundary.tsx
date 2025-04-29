
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console
    console.error('Uncaught error in component:', error);
    console.error('Component stack trace:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 text-center mb-4">
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </p>
          <details className="mb-4 text-sm max-w-full overflow-auto">
            <summary className="cursor-pointer text-blue-500">Detalhes técnicos</summary>
            <p className="mt-2 text-red-600">{this.state.error?.toString()}</p>
            {this.state.errorInfo && (
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <button
            onClick={() => {
              console.log('Manual page reload requested by user');
              // Use the native method directly instead of potentially modified version
              window.location.href = window.location.href;
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
