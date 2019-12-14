import { DEBUG } from "./constants";

export const assert: (
  condition: unknown,
  message?: string
) => asserts condition = (condition, message) => {
  if (DEBUG) {
    if (!condition) {
      const error = new Error(message);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(error, assert);
      }
      throw error;
    }
  }
};

export const flatMap = <T, U>(array: T[], callback: (value: T) => U[]): U[] => {
  const result: U[] = [];
  for (const item of array) {
    result.push(...callback(item));
  }
  return result;
};

export const swapRemove = <T>(array: T[], index: number): T | undefined => {
  assert(index >= 0);
  assert(index < array.length);
  const last = array.pop();
  if (index !== array.length) {
    array[index] = last!;
    return last;
  } else {
    return undefined;
  }
};
