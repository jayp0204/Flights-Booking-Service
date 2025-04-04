const { StatusCodes } = require("http-status-codes");
const { Booking } = require("../models");
const CrudRepository = require("./crud-repository");

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }
  // async getBookingByFlightIdAndUserId(flightId, userId) {
  //     const response = await Booking.findOne({
  //         where: {
  //             flightId: flightId,
  //             userId: userId,
  //         },
  //     });
  //     if (!response) {
  //         throw new AppError(
  //             "Not able to find the resource",
  //             StatusCodes.NOT_FOUND
  //         );
  //     }
  //     return response;
  // }
}

module.exports = BookingRepository;
