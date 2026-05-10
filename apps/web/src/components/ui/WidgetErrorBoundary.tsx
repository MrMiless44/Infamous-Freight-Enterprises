import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import * as Sentry from '@sentry/react';

type Props = {
  children: ReactNode;
  label?: string;
};

type State = { hasError: boolean };

class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    Sentry.captureException(error, {
      tags: { widget: this.props.label ?? 'unknown' },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="card flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-[#B88989]/70"
        >
          <AlertTriangle size={20} className="text-yellow-500" />
          <p>{this.props.label ? `${this.props.label} failed to load` : 'This section failed to load'}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="text-xs text-infamous-orange hover:underline"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default WidgetErrorBoundary;
