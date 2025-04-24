const axios = require("axios");
const { BookingRepository } = require("../repositories");
const { ServerConfig } = require("../config");
const db = require("../models");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

const bookingRepository = new BookingRepository();

const createBooking = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`
    );
    console.log(flight.data, "flight data");

    const flightData = flight.data.data;

    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }

    const totalBillingAmount = data.noOfSeats * flightData.price;
    console.log(totalBillingAmount, "totalBill");

    const bookingPayload = { ...data, totalCost: totalBillingAmount };
    const booking = await bookingRepository.createBooking(
      bookingPayload,
      transaction
    );
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: data.noOfSeats,
      }
    );

    // Commit the transaction if everything is successful
    await transaction.commit();
    return booking;
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    throw error;
  }
};

const makePayment = async (data) => {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.getDetails(
      data.bookingId,
      transaction
    );
    if (bookingDetails.status == CANCELLED) {
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }
    console.log(bookingDetails, "bookingDetails");
    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();
    if (currentTime - bookingTime > 300000) {
      await cancelBooking(data.bookingId);
      throw new AppError("The booking has expired ", StatusCodes.BAD_REQUEST);
    }
    if (bookingDetails.totalCost != data.totalCost) {
      throw new AppError(
        "The amount of the payment does not match",
        StatusCodes.BAD_REQUEST
      );
    }
    if (bookingDetails.userId != data.userId) {
      throw new AppError("The user is invalid", StatusCodes.BAD_REQUEST);
    }

    //we assume here that payment is successful
    await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const cancelBooking = async (bookingId) => {
  const transaction = await db.sequelize.transaction();

  try {
    const bookingDetails = await bookingRepository.getDetails(
      bookingId,
      transaction
    );

    if (bookingDetails.status == CANCELLED) {
      transaction.commit();
      return true;
    }

    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: 0,
      }
    );
    await bookingRepository.update(
      bookingId,
      { status: CANCELLED },
      transaction
    );
    transaction.commit();
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
};
