const cors = require("cors");
const http = require("http");
const ngrok = require("ngrok");
const express = require("express");
const socket = require("socket.io");
const compress = require("compression");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const httpContext = require("express-http-context");

const routes = require("../src/routes/index");
const { dbConnect } = require("../src/config/db");
const ErrorService = require("./service/error.service");
const EmailService = require("./service/email.service");
const CronJobService = require("./service/cronjob.service");
const PaymentService = require("./service/payment.service");

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5000",
      "https://palparcel-landing-page-silk.vercel.app",
      "https://palparcel-vendor-frontend-virid.vercel.app",
    ],
    methods: ["POST", "GET", "PUT", "OPTIONS", "HEAD", "DELETE"],
    credentials: true,
  })
);

dbConnect();

EmailService.init();
PaymentService.init();
CronJobService.start();

// express context middleware
app.use(httpContext.middleware);
// compress request data for easy transport
app.use(compress());
app.use(methodOverride());
app.use(express.urlencoded({ extended: true }));

const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

var allCustomer = [];
var allSeller = [];
let admin = {};

const addUser = (customerId, socketId, userInfo) => {
  const checkUser = allCustomer.some((u) => u.customerId === customerId);
  if (!checkUser) {
    allCustomer.push({
      customerId,
      socketId,
      userInfo,
    });
  }
};

const addSeller = (sellerId, socketId, userInfo) => {
  const checkSeller = allSeller.some((u) => u.sellerId === sellerId);
  if (!checkSeller) {
    allSeller.push({
      sellerId,
      socketId,
      userInfo,
    });
  }
};

const findCustomer = (customerId) => {
  return allCustomer.find((c) => c.customerId === customerId);
};
const findSeller = (sellerId) => {
  return allSeller.find((c) => c.sellerId === sellerId);
};

const remove = (socketId) => {
  allCustomer = allCustomer.filter((c) => c.socketId !== socketId);
  allSeller = allSeller.filter((c) => c.socketId !== socketId);
};

io.on("connection", (soc) => {
  console.log("socket server running..");

  soc.on("add_user", (customerId, userInfo) => {
    addUser(customerId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });
  soc.on("add_seller", (sellerId, userInfo) => {
    addSeller(sellerId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });
  soc.on("send_seller_message", (msg) => {
    const customer = findCustomer(msg.receverId);
    if (customer !== undefined) {
      soc.to(customer.socketId).emit("seller_message", msg);
    }
  });
  soc.on("send_customer_message", (msg) => {
    const seller = findSeller(msg.receverId);
    if (seller !== undefined) {
      soc.to(seller.socketId).emit("customer_message", msg);
    }
  });

  soc.on("send_message_admin_to_seller", (msg) => {
    const seller = findSeller(msg.receverId);
    if (seller !== undefined) {
      soc.to(seller.socketId).emit("receved_admin_message", msg);
    }
  });

  soc.on("send_message_seller_to_admin", (msg) => {
    if (admin.socketId) {
      soc.to(admin.socketId).emit("receved_seller_message", msg);
    }
  });

  soc.on("add_admin", (adminInfo) => {
    delete adminInfo.email;
    delete adminInfo.password;
    admin = adminInfo;
    admin.socketId = soc.id;
    io.emit("activeSeller", allSeller);
  });

  soc.on("disconnect", () => {
    console.log("user disconnect");
    remove(soc.id);
    io.emit("activeSeller", allSeller);
  });
});

require("dotenv").config();

app.use(bodyParser.json());
app.use(cookieParser());

app.use("/auth", require("./routes/authRoutes"));
app.use("/api/v1", require("./routes/order/orderRoutes"));
app.use("/auth", require("./routes/adminAuth.routes"));
app.use("/api/v1", require("./routes/dashboard/categoryRoutes"));
app.use("/auth", require("./routes/dashboard/productRoutes"));
app.use("/api/v1", require("./routes/dashboard/sellerRoutes"));
app.use("/api/v1", require("./routes/home/reviewRoutes"));
app.use("/api/v1", require("./routes/dashboard/commentRoute"));
app.use("/api/v1", require("./routes/settingsRoutes"));
app.use("/api/v1", require("./routes/chatRoutes"));
app.use("/api/v1", require("./routes/admin.routes"));
app.use("/api/v1", require("./routes/complaint.route"));
app.use("/api/v1", require("./routes/paymentRoutes"));
app.use("/api/v1", require("./routes/dashboard/dashboardRoutes"));

// Mount routes
app.use("/api/v1", routes);

app.use((err, req, res, next) => {
  ErrorService.converter(err, req, res, next);
});

app.use((req, res) => {
  ErrorService.notFound(req, res);
});

// enable ngrok server
// if (process.env.ENABLE_NGROK_SERVER) {
//   ngrok
//     .connect({ proto: "http", addr: process.env.PORT })
//     .then((url) => console.info(`ngrok server started on ${url}`));
// }

const port = process.env.PORT;
server.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
