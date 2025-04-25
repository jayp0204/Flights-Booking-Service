const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { message } = require("../utils/common/error-response");
4;

const inMemDb = {};

const createBooking = async (req, res) => {
  try {
    const flight = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noOfSeats: req.body.noOfSeats,
    });
    SuccessResponse.data = flight;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error?.statusCode).json(ErrorResponse);
  }
};

const makePayment = async (req, res) => {
  try {
    const idempotencykey = req.headers["x-idempotency-key"];
    if (!idempotencykey) {
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ message: "idempotency key is missing" });
    }
    if (inMemDb[idempotencykey]) {
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ message: "cannot retry on a successful payment" });
    }
    const flight = await BookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: req.body.userId,
      bookingId: req.body.bookingId,
    });
    inMemDb[idempotencykey] = idempotencykey;
    SuccessResponse.data = flight;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

module.exports = {
  createBooking,
  makePayment,
};
