const _ = require("lodash");
const dayjs = require("dayjs");
const cron = require("node-cron");

const ErrorService = require("./error.service");
const SellerModel = require("../models/sellerModel");
// const SubscriptionModel = require("../models/subscription.model");

const scheduleOptions = {
  scheduled: false,
  //   timezone: "America/New_York", // change to Nigerian timezone
};

// REAL DATE: 2024-08-28T14:00:00.000Z

class CronJobService {
  static paystackTask = null;

  constructor() {
    CronJobService.paystackTask = cron.schedule(
      "0 23 * * *", // runs every 11pm
      // "*/1 * * * *", // runs every two minutes
      CronJobService.updateSubscriptionStatus,
      scheduleOptions
    );
  }

  /**
   * @async
   * @function start
   * @description starts a new cron job
   * @returns {void} void
   * @memberof CronJobServiceInterface
   */
  start() {
    CronJobService.stop();
    CronJobService.paystackTask?.start();
  }

  /**
   * @async
   * @function stop
   * @description stop a new cron job
   * @returns {void} void
   * @memberof CronJobServiceInterface
   */
  static stop() {
    CronJobService.paystackTask?.stop();
  }

  /**
   * @async
   * @function updateSubscriptionStatus
   * @description check users subscription status and
   * @returns {Promise<void>} Promise<void>
   * @memberof CronJobService
   */
  static async updateSubscriptionStatus() {
    try {
      const sellers = await SellerModel.find({
        is_verified: true,
        is_deleted: false,
        is_account_suspended: false,
        has_paid_subscription: true,
        next_payment_date: {
          $lte: dayjs().endOf("day").toISOString(),
          $gte: dayjs().startOf("day").toISOString(),
        },
      });

      if (!sellers.length) {
        return;
      }

      await SellerModel.bulkWrite(
        sellers.map((seller) => ({
          updateOne: {
            filter: { _id: seller._id },
            update: { has_paid_subscription: false },
          },
        }))
      );
    } catch (error) {
      ErrorService.reportError({
        errorData: error,
        status: error.status,
        error: `Error running subscription tracker`,
        message: error?.response?.data?.message || `Failed to complete subscription job`,
      });
    }
  }
}

module.exports = new CronJobService();
