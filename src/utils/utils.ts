export const debounce = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  ms: number = 300,
): ((...args: TArgs) => void) => {
  if (ms < 0) {
    throw new Error('Delay must be a positive number');
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (this: unknown, ...args: TArgs): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const throttle = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  ms: number = 300,
): ((...args: TArgs) => void) => {
  if (ms < 0) {
    throw new Error('Delay must be a positive number');
  }

  let isThrottled = false;
  let savedArgs: TArgs | null = null;

  return function (this: unknown, ...args: TArgs): void {
    if (isThrottled) {
      savedArgs = args;
      return;
    }

    isThrottled = true;
    fn.apply(this, args);

    setTimeout(() => {
      isThrottled = false;

      if (savedArgs) {
        fn.apply(this, savedArgs);
        savedArgs = null;
      }
    }, ms);
  };
};

export default {
  debounce,
  throttle,
};
