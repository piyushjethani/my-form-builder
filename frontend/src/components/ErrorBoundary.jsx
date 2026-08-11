import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="panel max-w-md p-6">
            <h1 className="display-title text-2xl font-bold text-slate-950">Something broke</h1>
            <p className="mt-2 text-sm text-slate-600">Refresh the page and try again.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
