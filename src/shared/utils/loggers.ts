interface LogLevel {
  ERROR: 'ERROR';
  WARN: 'WARN';
  INFO: 'INFO';
  DEBUG: 'DEBUG';
}

class Logger {
  // ANSI color codes
  private static readonly COLORS = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[37m', // White
    RESET: '\x1b[0m'   // Reset
  };

  // Public logging methods
  error(message: string, data?: any): void {
    const color = Logger.COLORS.ERROR;
    const reset = Logger.COLORS.RESET;
    console.error(`${color}[${new Date().toISOString()}] ERROR: ${message}${reset}`, data || '');
  }

  warn(message: string, data?: any): void {
    const color = Logger.COLORS.WARN;
    const reset = Logger.COLORS.RESET;
    console.warn(`${color}[${new Date().toISOString()}] WARN: ${message}${reset}`, data || '');
  }

  info(message: string, data?: any): void {
    const color = Logger.COLORS.INFO;
    const reset = Logger.COLORS.RESET;
    console.log(`${color}[${new Date().toISOString()}] INFO: ${message}${reset}`, data || '');
  }

  debug(message: string, data?: any): void {
    const color = Logger.COLORS.DEBUG;
    const reset = Logger.COLORS.RESET;
    console.log(`${color}[${new Date().toISOString()}] DEBUG: ${message}${reset}`, data || '');
  }
}

export const logger = new Logger();