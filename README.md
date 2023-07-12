## Error Handling

This project includes a custom error handling system that allows you to easily handle and respond to errors in your Express application.

### Custom Error Classes

The `customError` class is an abstract class that defines the structure for custom error classes. To create a new custom error class, you can extend the `customError` class and implement the required abstract members:

```javascript
import customError from "./customErrors";

class testError extends customError {
    errorCode = 404
    errorType = 'ROUTES_ERROR'

    constructor(message: string, private property: string) {
        super(message)

        Object.setPrototypeOf(this, testError.prototype)
    }

    serializeErrors(): { message: string; property?: string }[] {
        return [{
            message: this.message, property: this.property
        }]
    }

}

export default testError
```

In the example above, we've created a `testError` class that extends the `customError` class. The `testError` class defines values for the `errorCode` and `errorType` abstract members and implements the `serializeErrors` method.

### Throwing Errors

To throw a custom error in your application, you can create a new instance of a custom error class and pass it to the `throw` statement:

```javascript
import testError from './errors/testError';
app.get('/', (req: Request, res: Response) => {
  throw new testError(
    'This route is not exist please use valid route!',
    `the route: ${req.url}`
  );
  res.send('hi im home page!');
});
```

In the example above, we're throwing a new instance of the `testError` class in an Express route. The error message and property values are passed to the constructor of the `testError` class.

### Error Handler Middleware

The `errorHandler` middleware is responsible for handling errors in your application. It checks if the thrown error is an instance of a custom error class and responds with the appropriate status code and error message:

```javascript
import { Request, Response, NextFunction } from 'express';
import customError from '../errors/customErrors';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof customError) {
    res.status(err.errorCode).send({ errors: err.serializeErrors() });
  } else {
    res.send('An error occur!');
  }
};

export default errorHandler;
```

Make sure to add the `errorHandler` middleware as the last middleware in your application to ensure that it catches all errors.

![App Screenshot](https://i.ibb.co/Gk2QyGG/Screenshot-2023-07-12-075734.png)

![App Screenshot](https://i.ibb.co/yyvGs19/Screenshot-2023-07-05-070127.png)
