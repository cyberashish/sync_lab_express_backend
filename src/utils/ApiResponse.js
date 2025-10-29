class ApiResponse{
    statusCode;
    data;
    message;

    constructor(
        statusCode ,
        data,
        message="Success"
    ){
      this.statusCode = statusCode;
      this.data = data;
      this.message = message
    }
}
export {ApiResponse}