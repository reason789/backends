const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// Config // when working with stripe
// dotenv.config({ path: "backend/config/config.env" });

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

const bodyParser = require("body-parser"); // eta  image upload krr tym a lagse..agee lage nai
const fileUpload = require("express-fileupload");

const errorMiddleware = require("./middleware/error");

const authRoute = require("./routes/authRoute");

app.use(cookieParser());

app.use(express.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // Increase the limit as per your requirement
  })
);

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "https://seasidee.netlify.app"],
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true,
//   })
// );

const corsOptions = {
  origin: ["http://localhost:3000", "https://seasidee.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

const user = require("./routes/userRoute");
const hotel = require("./routes/hotelRoute");
const room = require("./routes/roomRoute");
const booking = require("./routes/bookingRoute");
const payment = require("./routes/paymentRoute");
const voucher = require("./routes/voucherRoute");

app.use("/auth", authRoute);
app.use("/api/v1", user);
app.use("/api/v1", hotel);
app.use("/api/v1", room);
app.use("/api/v1", booking);
app.use("/api/v1", payment);
app.use("/api/v1", voucher);

// Middleware for error
app.use(errorMiddleware);

module.exports = app;
