import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import {
  postRegisteration,
  loginRegisteration,
  getUsernameDetails,
  updateUserDetails,
  otpGenerators,
  verifyOTP,
  createResetSession,
  resetPassword,
} from "./Controllers/index.js";
import auth, { localVariables, verifyUser } from "./AuthMiddleware/Auth.js";
import { registerMail } from "./Mailer/nodeMail.js";

// console.log(morgan);

// i used important url explicitly but we need to wrap them into .env file that will give more security so once you're learned these topics don't forget to add into .env files because node will take care of .env files

const app = express();
const PORT = 8000;
const CONNECTION_URL =
  "mongodb+srv://marudhu:marudhu1234@cluster0.ybyqwun.mongodb.net/";

// DEFAULT WORK OF EXPRESS JS DOESN'T ADD REQ.BODY IN REQ OBJECT, IN ORDER TO THE ADD REQ.BODY IN REQ OBJECT THROUGH MIDDLEWARE, THAT'S THE POWER OF MIDDLEWARE
// MIDDLEWARE CAN BE MANIPULATE REQUEST OBJECT AND RESPONSE OBJECT, WITHOUT MIDDLEWARE YOU CAN'T GET REQ.BODY VALUE IN REQUEST OBJECT.....
app.use(express());
app.use(
  cors({
    origin: "*", // You can specify your React app URL here for better security
  })
);

// The dev format inside of Morgan middleware is a predefined log output format that is optimized for development purposes. It provides detailed information about each request that includes the request method, URL, response status code, response time, and the size of the response body. It also logs additional information such as the IP address and the user agent of the client making the request.
// Using the dev format during development can be very useful for debugging and performance optimization, as it provides a lot of information about each request and helps identify any issues or bottlenecks in the application.
app.use(morgan("dev"));

//body-parser is a middleware library for handling HTTP request body parsing in Node.js applications. It helps to extract data from the request body in a format that can be easily used by the application, BASED ON USE CASES
// DEFAULT LIMIT IS 100kb
// OFFICIAL A new body object containing the parsed data is populated on the request object after the middleware (i.e. req.body). This will be a Buffer object of the body.
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "100mb" }));

// this is called middleware from router every router this router middleware is called.... so the "/api" is prefixed with every routers
// in future i want to seperete the modules
// ======================= POST ROUTES =======================
app.route("/api/register").post(postRegisteration);
app.route("/api/login").post(verifyUser, loginRegisteration);
app.route("/api/registerEmail").post(registerMail);
app.route("/api/authenticate").post(verifyUser, (req, res) => {
  // order number 1
  res.end();
});
// ======================= GET ROUTES =======================
app.route("/api/user/:username").get(getUsernameDetails);
app.route("/api/generateOTP").get(verifyUser, localVariables, otpGenerators);
app.route("/api/verifyOTP").get(verifyUser, verifyOTP);
app.route("/api/createResetSession").get(createResetSession);

// ======================= PUT ROUTES =======================
app.route("/api/updateuser").put(auth, updateUserDetails);
app.route("/api/resetPassword").put(verifyUser, resetPassword);

mongoose.set("strictQuery", false);
mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb Successfully Connected");
  })
  .then(() => {
    app.listen(8000, () => {
      console.log("server started");
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
