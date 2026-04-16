import React, { Component, ErrorInfo, ReactNode } from "react";
import logger from "../services/logger";

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. If omitted, renders a simple error message. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * GlobalErrorBoundary — catches unhandled React render errors and logs
 * them to Seq via the centralized logger. The app shows a graceful
 * fallback UI rather than a blank screen.
 *
 * Usage:
 *   <GlobalErrorBoundary>
 *     <YourApp />
 *   </GlobalErrorBoundary>
 */
class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to Seq — fire-and-forget, never blocks rendering
    logger.fatal("Unhandled React render error: {ErrorMessage}", error, {
      ComponentStack: info.componentStack ?? "",
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display        : "flex",
          flexDirection  : "column",
          alignItems     : "center",
          justifyContent : "center",
          minHeight      : "100vh",
          fontFamily     : "sans-serif",
          color          : "#333",
          padding        : "2rem",
          textAlign      : "center",
        }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Something went wrong</h2>
          <p style={{ color: "#888", maxWidth: "480px" }}>
            An unexpected error occurred. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop    : "1.5rem",
              padding      : "0.6rem 1.4rem",
              background   : "#3b82f6",
              color        : "#fff",
              border       : "none",
              borderRadius : "6px",
              cursor       : "pointer",
              fontSize     : "0.95rem",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
