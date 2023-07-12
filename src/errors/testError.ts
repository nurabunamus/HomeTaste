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