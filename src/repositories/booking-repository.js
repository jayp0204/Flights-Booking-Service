const { StatusCodes } = require("http-status-codes");
const { Booking } = require("../models");
const CrudRepository = require("./crud-repository");
const { Op } = require("sequelize");
const { Enums } = require("../utils/common");
const { CANCELLED, BOOKED } = Enums.BOOKING_STATUS;
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

  async getDetails(data, transaction) {
    const response = await this.model.findByPk(data, {
      transaction: transaction,
    });
    if (!response) {
      throw new AppError(
        "Not able to find the resource",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  async update(id, data, transaction) {
    const response = await this.model.update(
      data,
      {
        where: {
          id: id,
        },
      },
      { transaction: transaction }
    );
    return response;
  }

  async cancelOldBookings(timestamp) {
    const response = await Booking.update({status: CANCELLED},{
      where: {
        [Op.and]: [
          {
            createdAt: {
              [Op.lt]: timestamp,
            },
          },
          {
            status: {
              [Op.ne]: BOOKED
            }
          },
          {
            status: {
              [Op.ne]: CANCELLED
            }
          }
        ],
      },
    });
    return response;
  }
}

module.exports = BookingRepository;
