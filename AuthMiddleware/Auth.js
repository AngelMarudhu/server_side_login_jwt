import jwt from "jsonwebtoken";
import userSchema from "../ModelSchema/userSchema.js";

const auth = async (req, res, next) => {
  //console.log(req.headers, 'request Headers');

  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader, 'authHeader');
    // next we want to extract the dat from the token token means authheader has token

    const token = authHeader.split(" ")[1];
    // console.log(token, 'token');

    const decodeData = jwt.decode(token, "secred");

    req.user = decodeData;
    // console.log(decodeData, 'decoded token');
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const localVariables = (req, res, next) => {
  // console.log(req.app, 'req.app');
  // the below command in req.app consoling the data Wso don't be confused
  // locals: { OTP: null, resetSessetion: false },
  // mountpath: '/',
  // _router: [Function: router] {
  //   params: {},
  //   _params: [],
  //   caseSensitive: false,
  //   mergeParams: undefined,
  //   strict: false,

  //   In the OTP generator handler, the req.app.locals object is used to store the generated OTP value, which can then be accessed in subsequent requests.
  // When the localVariables middleware is invoked, it initializes the req.app.locals object with two properties - OTP and resetSesstion. The OTP property is set to null initially, indicating that no OTP has been generated yet.
  // Later, in the generateOtp handler, when an OTP is generated, it is assigned to the OTP property of the req.app.locals object. This allows other handlers or middleware to access the generated OTP value and perform any necessary operations with it.
  // Overall, the req.app.locals object acts as a way to share data between different parts of the application without having to pass it through function arguments or use global variables.

  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
};

export async function verifyUser(req, res, next) {
  // req.method get ah iruntha username req.query la varum illana req.body la varum
  const { username } = req.method === "GET" ? req.query : req.body;
  console.log(username, "verify User");
  try {
    const existingUser = await userSchema.findOne({ username });
    // METHOD ONE
    // You can pass an object to select() that specifies which fields you want to {include -} or {exclude without -}.
    // .select('-password');
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

export default auth;
