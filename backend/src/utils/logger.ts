/* eslint-disable no-console */
const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  debug: '\x1b[90m', // Gray
};

const getTimestamp = (): string => {
  return new Date().toISOString();
};

export const logger = {
  info: (message: string, ...meta: any[]): void => {
    console.log(
      `${colors.info}[INFO]${colors.reset} [${getTimestamp()}] ${message}`,
      meta.length ? meta : ''
    );
  },
  warn: (message: string, ...meta: any[]): void => {
    console.warn(
      `${colors.warn}[WARN]${colors.reset} [${getTimestamp()}] ${message}`,
      meta.length ? meta : ''
    );
  },
  error: (message: string, error?: any, ...meta: any[]): void => {
    console.error(
      `${colors.error}[ERROR]${colors.reset} [${getTimestamp()}] ${message}`,
      error ? error : '',
      meta.length ? meta : ''
    );
  },
  debug: (message: string, ...meta: any[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `${colors.debug}[DEBUG]${colors.reset} [${getTimestamp()}] ${message}`,
        meta.length ? meta : ''
      );
    }
  },
};
export default logger;
