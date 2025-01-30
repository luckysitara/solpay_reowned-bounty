const cryptoRandomString = async (length) => {
  const cryptoRandomString = await import("crypto-random-string").then((module) => module.default);
  return cryptoRandomString({ length: length }).toLocaleLowerCase();
};

module.exports = { cryptoRandomString };
