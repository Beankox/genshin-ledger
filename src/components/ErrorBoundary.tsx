import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Catches render errors so one broken page shows a message instead of a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info.componentStack); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="page">
        <div className="empty">
          <span aria-hidden>✦</span>
          <h3>Something went wrong on this page</h3>
          <p>Your saved data has not been touched.</p>
          <a className="btn" href="#/" onClick={() => this.setState({ failed: false })}>Back to the dashboard</a>
        </div>
      </div>
    );
  }
}
