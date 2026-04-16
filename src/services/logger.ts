/**
 * Centralized logger for NG Frontend.
 *
 * Sends structured log events to Seq via its raw CLEF (Compact Log Event Format)
 * HTTP ingestion endpoint (`/api/events/raw`).
 *
 * Design rules:
 * - ALL methods are fire-and-forget (no `await` required by callers).
 * - ALL network/serialization errors are silently swallowed — the app NEVER
 *   crashes or blocks if Seq is unavailable.
 * - Each event is automatically enriched with:
 *     Application = "NG Frontend"
 *     Url         = current page URL
 *     UserAgent   = browser info
 */

// ---------------------------------------------------------------------------
// Configuration — update these to match your Seq server
// ---------------------------------------------------------------------------
const SEQ_SERVER_URL = process.env.REACT_APP_SEQ_URL ?? "http://localhost:5341";
const SEQ_API_KEY    = process.env.REACT_APP_SEQ_API_KEY ?? ""; // leave empty if none

// CLEF endpoint for raw structured events
const CLEF_ENDPOINT  = `${SEQ_SERVER_URL}/api/events/raw?clef`;

// ---------------------------------------------------------------------------
// Log-level constants (Serilog / Seq convention)
// ---------------------------------------------------------------------------
type LogLevel = "Verbose" | "Debug" | "Information" | "Warning" | "Error" | "Fatal";

// ---------------------------------------------------------------------------
// Internal CLEF event shape
// ---------------------------------------------------------------------------
interface ClefEvent {
  "@t": string;           // ISO-8601 timestamp
  "@mt": string;          // Message template
  "@l"?: LogLevel;        // Level (omit = Information)
  "@x"?: string;          // Exception text
  [key: string]: unknown; // Additional structured properties
}

// ---------------------------------------------------------------------------
// Shared base properties attached to every event
// ---------------------------------------------------------------------------
function baseProperties(): Record<string, unknown> {
  return {
    Application : "NG Frontend",
    Url         : window?.location?.href ?? "",
    UserAgent   : navigator?.userAgent ?? "",
  };
}

// ---------------------------------------------------------------------------
// Core send function — fire-and-forget, never throws
// ---------------------------------------------------------------------------
function sendToSeq(level: LogLevel, template: string, props: Record<string, unknown>, error?: unknown): void {
  try {
    const event: ClefEvent = {
      "@t"  : new Date().toISOString(),
      "@mt" : template,
      ...baseProperties(),
      ...props,
    };

    // Only include @l when it's not Information (Seq default)
    if (level !== "Information") {
      event["@l"] = level;
    }

    // Attach exception text if provided
    if (error !== undefined && error !== null) {
      if (error instanceof Error) {
        event["@x"] = `${error.name}: ${error.message}\n${error.stack ?? ""}`;
      } else {
        event["@x"] = String(error);
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/vnd.serilog.clef",
    };

    if (SEQ_API_KEY) {
      headers["X-Seq-ApiKey"] = SEQ_API_KEY;
    }

    // Use `keepalive: true` so logs still reach Seq when the page is unloading
    fetch(CLEF_ENDPOINT, {
      method    : "POST",
      headers,
      body      : JSON.stringify(event),
      keepalive : true,
    }).catch(() => {
      // Seq is unreachable — fail silently, never surface to user
    });
  } catch {
    // Serialization or any unexpected error — swallow completely
  }
}

// ---------------------------------------------------------------------------
// Also echo to the browser console so devs see logs during development
// ---------------------------------------------------------------------------
function consoleEcho(level: LogLevel, template: string, props: Record<string, unknown>, error?: unknown): void {
  if (process.env.NODE_ENV === "production") return;

  const msg = `[${level}] ${template}`;
  const extra = Object.keys(props).length ? props : undefined;

  switch (level) {
    case "Fatal":
    case "Error":
      error ? console.error(msg, extra, error) : console.error(msg, extra);
      break;
    case "Warning":
      console.warn(msg, extra);
      break;
    case "Debug":
    case "Verbose":
      console.debug(msg, extra);
      break;
    default:
      console.info(msg, extra);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
const logger = {
  /**
   * Log verbose/trace-level information.
   * @param template  Serilog-style message template, e.g. "User {UserId} clicked {ButtonId}"
   * @param props     Structured properties to attach
   */
  verbose(template: string, props: Record<string, unknown> = {}): void {
    consoleEcho("Verbose", template, props);
    sendToSeq("Verbose", template, props);
  },

  /**
   * Log debug-level information.
   */
  debug(template: string, props: Record<string, unknown> = {}): void {
    consoleEcho("Debug", template, props);
    sendToSeq("Debug", template, props);
  },

  /**
   * Log a general information message.
   */
  info(template: string, props: Record<string, unknown> = {}): void {
    consoleEcho("Information", template, props);
    sendToSeq("Information", template, props);
  },

  /**
   * Log a warning.
   */
  warn(template: string, props: Record<string, unknown> = {}): void {
    consoleEcho("Warning", template, props);
    sendToSeq("Warning", template, props);
  },

  /**
   * Log a recoverable error.
   * @param error  The caught Error object or string
   */
  error(template: string, error?: unknown, props: Record<string, unknown> = {}): void {
    consoleEcho("Error", template, props, error);
    sendToSeq("Error", template, props, error);
  },

  /**
   * Log a fatal error (application cannot continue).
   * @param error  The caught Error object or string
   */
  fatal(template: string, error?: unknown, props: Record<string, unknown> = {}): void {
    consoleEcho("Fatal", template, props, error);
    sendToSeq("Fatal", template, props, error);
  },
};

export default logger;
