const nodeCache = require("node-persist");

const { formatBankData } = require("./format_bank_data");
const PaymentService = require("../service/payment.service");
const { envVariables: config, nodePersistDir } = require("../config");

const THIRTY_DAYS_TTL = 30 * 24 * 60 * 60 * 100;
//remove items
// await nodeCache.removeItem(config.BANKS_KEY_VALUE);

const getAllBanks = async () => {
  await nodeCache.init({ dir: nodePersistDir });

  let banks = await nodeCache.getItem(config.BANKS_KEY_VALUE);

  if (!banks) {
    const data = await PaymentService.getBankList({ currency: "NGN" });

    banks = formatBankData(data);

    await nodeCache.setItem(config.BANKS_KEY_VALUE, banks, { ttl: THIRTY_DAYS_TTL });
  }
  return banks;
};

module.exports = { getAllBanks };
