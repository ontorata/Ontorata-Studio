import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, PageHeader } from '../presentation/design-system/primitives';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Keeps workspace shell alive when a single route tab throws. */
export class TabErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ontorata Studio tab error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page studio-page">
          <PageHeader title="This tab failed to load" description="Other Studio panels are still available." />
          <Card className="ratary-connection-notice">
            <p className="error">{this.state.error.message}</p>
            <button type="button" className="btn ghost" onClick={() => this.setState({ error: null })}>
              Try again
            </button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
