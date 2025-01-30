const mongoose = require("mongoose");
const createAdmin = require("../utiles/createAdmin")

module.exports.dbConnect = async () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.info(
        `successfully connected to mongo database ${process.env.DB_URL.substring(0, 24)}`
      );
      createAdmin()
    })
    .catch((error) => {
      console.log({
        error: error.message,
        message: `unable to connect to database: ${process.env.DB_URL.substring(0, 24)}`,
      });
    });
};

// report mongoose disconnect log
// mongoose.connection.on("disconnected", (error) => {
//   console.log({
//     error: error.message,
//     message: `disconnected from database: ${process.env.DB_URL.substring(0, 24)}`,
//   });
// });
