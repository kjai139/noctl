
class ValidationError extends Error {
    code: string;
    constructor(message:string) {
        super(message)
        this.name = "ValidatonError"
        this.code = "VALIDATION_ERROR"
    }
}


export default ValidationError