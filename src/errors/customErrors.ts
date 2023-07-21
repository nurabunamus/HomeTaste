abstract class customError extends Error {
  abstract errorCode: number;

  abstract errorType: string;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, customError);
  }

  abstract serializeErrors(): { message: string; property?: string }[];
}

export default customError;
