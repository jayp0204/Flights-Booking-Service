const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");

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
    const flight = await BookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: req.body.userId,
      bookingId: req.body.bookingId,
    });
    SuccessResponse.data = flight;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error?.statusCode).json(ErrorResponse);
  }
};

module.exports = {
  createBooking,
  makePayment
};
