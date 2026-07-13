class ApiResponse {
  constructor(data, message = 'Success', statusCode = 200) {
    this.status = 'success';
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  send(res) {
    return res.status(this.statusCode).json({
      status: this.status,
      message: this.message,
      data: this.data,
    });
  }

  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  static error(res, message = 'Error', statusCode = 500) {
    return res.status(statusCode).json({
      status: 'error',
      message,
    });
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      status: 'success',
      message,
      data,
      pagination,
    });
  }
}

module.exports = ApiResponse;
