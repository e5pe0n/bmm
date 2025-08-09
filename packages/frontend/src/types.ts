export type SuccessResult<T> = {
  success: true;
  data: T;
};

export type ErrorResult<E> = {
  success: false;
  error: E;
};

export type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;
