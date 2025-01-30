const APIError = require("../utiles/api.error");
// const { getAllBanks } = require("./get_all_banks");
const PaymentService = require("../service/payment.service");

const getBankCode = async (bank_name) => {
  const result = {
    data: null,
    error: null,
  };
  try {
    // const bankList = await getAllBanks();
    const bankList = await PaymentService.getBankList({ currency: "NGN" });
    console.log({ bankList });
    const bank = bankList.find((bank) => bank.name.toLowerCase() === bank_name.toLowerCase());

    result.data = bank.code;
  } catch (error) {
    result.error = new APIError({
      errorData: error,
      message: error.message,
      status: error.statusCode,
    });
  }

  return result;
};

module.exports = { getBankCode };
