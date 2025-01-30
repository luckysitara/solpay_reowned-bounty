const { Schema, model } = require("mongoose");
const BcryptService = require("../service/bcrypt.service");


const sellerWalletSchema = new Schema(
  {
    sellerId: {
      type: Schema.ObjectId,
      required: true,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    productsSold: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    bankDetails: {
      bankName: { type: String, default: null },
      accountName: { type: String, default: null },
      accountNumber: { type: String, default: null },
    },
    transactionPin: { type: String, select: true},
    withdrawals: [
      {
        amount: { type: Number, default: 0 },
        status: { type: String, default: null },
        bankName: { type: String, default: null },
        date: { type: Date, default: Date.now() },
        accountName: { type: String, default: null },
        accountNumber: { type: String, default: null },
      },
    ],
    amount: {
      type: Number,
      default: 0,
    },
    month: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

sellerWalletSchema.pre("save", async function (next) {
  const data = this.toObject();
  const transactionPin = `${data.transactionPin}`;

  if (!transactionPin) {
    const error = new Error("Pin is required.");
    return next(error);
  }

  try {
    const encrypted_pin = await BcryptService.hashPin(transactionPin);
    this.transactionPin = encrypted_pin;

    next();
  } catch (error) {
    next(error);
  }

});

/**
 * pre-update hooks
 */
sellerWalletSchema.pre("findOneAndUpdate", async function (next) {
  const update = { ...this.getUpdate() };

  // If update does not contain pin then return
  if (!update.transactionPin) return next();

  try {
    update.transactionPin = await BcryptService.hashPin(update.transactionPin);
    this.setUpdate(update);

    next();
  } catch (error) {
    next(error);
  }
});

// /**
//  * methods
//  */
sellerWalletSchema.methods = {
  isPasswordCorrect(transactionPin) {
    const { transactionPin: userPin } = this.toObject();
    return BcryptService.comparePassword(transactionPin, userPin );
  }
}

module.exports = model("sellerWallets", sellerWalletSchema);
