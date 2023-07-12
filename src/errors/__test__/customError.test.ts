import customError from "../customErrors";

describe('customError', () => {
  it('should return the correct error code and error type', () => {
    class TestError extends customError {
      errorCode = 400;
      errorType = 'Test Error';

      serializeErrors() {
        return [{ message: 'Test error message' }];
      }
    }

    const err = new TestError('Test error message');
    expect(err.errorCode).toEqual(400);

    expect(err.errorType).toEqual('Test Error');
  });
});
