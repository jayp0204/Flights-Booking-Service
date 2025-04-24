const { StatusCodes } = require("http-status-codes");
const { Booking } = require("../models");
const CrudRepository = require("./crud-repository");
// const booking = require("../models/booking");

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
    // console.log("Booking repository constructor called");
  }

  async createBooking(data, transaction) {
    const response = await Booking.create(data, { transaction: transaction });
    return response;
  }
}

module.exports = BookingRepository;
