const formatBankData = (banks) => {
  return banks.map((bank) => {
    const { name, country, currency, code } = bank;

    return {
      name,
      code,
      country,
      currency,
    };
  });
};

module.exports = { formatBankData };
