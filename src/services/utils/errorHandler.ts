// utils/errorHandler.js
import { setGlobalError } from './../../components/ErrorPopup';
// Custom Error Class
export class AppError extends Error {
  constructor(message, type = 'Custom', code = 500, source = 'Unknown') {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.source = source;
  }
}

// Helper to extract stack details (file path and line number)
const getStackDetails = (error) => {
  if (!error.stack) return { filePath: 'Unknown', lineNumber: 'Unknown' };

  const stackLines = error.stack.split('\n');
  const relevantLine = stackLines[1] || stackLines[0];
  const match = relevantLine.match(/(https?:\/\/[^\s]+):(\d+):(\d+)/);
  return match ? { filePath: match[1], lineNumber: match[2] } : { filePath: 'Unknown', lineNumber: 'Unknown' };
};

// Centralized error handler
export const handleError = (error) => {
  let errorMessage = 'An unexpected error occurred';
  let errorType = 'General';
  let errorCode = 500;
  let errorSource = 'Unknown';
  let filePath = 'Unknown';
  let lineNumber = 'Unknown';

  if (error instanceof AppError) {
    errorMessage = error.message;
    errorType = error.type;
    errorCode = error.code;
    errorSource = error.source;
    ({ filePath, lineNumber } = getStackDetails(error));
  } else if (error.response) {
    // API Error
    errorMessage = error.response.data?.message || error.message;
    errorCode = error.response.status;
    errorType = 'API';
    errorSource = error.response.config.url;
  } else if (error instanceof TypeError) {
    // Type Error
    errorMessage = error.message;
    errorType = 'TypeError';
    ({ filePath, lineNumber } = getStackDetails(error));
  } else if (error instanceof Error) {
    // Global JavaScript Error
    errorMessage = error.message;
    errorType = 'JavaScript';
    ({ filePath, lineNumber } = getStackDetails(error));
  }

  console.error(`Error (${errorType} - ${errorCode}): ${errorMessage}`, {
    filePath,
    lineNumber,
    errorSource,
  });

  setGlobalError({
    message: errorMessage,
    type: errorType,
    code: errorCode,
    source: errorSource,
    filePath,
    lineNumber,
  });
};