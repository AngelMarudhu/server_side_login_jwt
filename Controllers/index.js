import userSchema from "../ModelSchema/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";

export const postRegisteration = async (req, res) => {
  const { profile, email, username, password } = req.body;
  // console.log({ profile, email, username, password }, 'this is from req body');
  try {
    const existingUser = await userSchema.findOne({ email, username });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "You are already user in the database" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword, 'hashed password ');
    const result = await userSchema.create({
      email,
      password: hashedPassword,
      username,
      profile: profile || " ",
    });
    // console.log(result, 'result after create database');
    return res.status(201).json({ result, message: "succesfully crated user" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const loginRegisteration = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password, "loginregister");
  try {
    const existingUser = await userSchema.findOne({ username });

    console.log(existingUser.username, "existing user");
    if (existingUser) {
      const passwordCompare = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (passwordCompare) {
        const token = await jwt.sign(
          {
            email: existingUser.email,
            userId: existingUser._id,
          },
          "secret",
          { expiresIn: "24h" }
        );

        return res.json({
          username: existingUser.username,
          token,
          status: 200,
        });
      } else {
        return res.json({ message: "incorrect Password" });
      }
    }

    if (!existingUser) {
      return res.status(401).json({
        message: "you are not in the database go and register again...",
      });
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const getUsernameDetails = async (req, res) => {
  const { username } = req.params;

  try {
    const existingUser = await userSchema.findOne({ username });
    // METHOD ONE
    // You can pass an object to select() that specifies which fields you want to {include -} or {exclude without -}.
    // .select('-password');

    // METHOD TWO
    const existingUserWithoutPassword = Object.assign(
      {},
      existingUser.toObject()
    );

    // console.log(existingUserWithoutPassword);
    delete existingUserWithoutPassword.password;

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      data: existingUserWithoutPassword,
      message: "thanks for logging in buddyz 💯",
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(404).json({ message: "You Are Not Authenticated" });
    }

    if (userId) {
      const body = req.body;
      console.log(body);
      const updateUser = await userSchema.updateOne({ _id: userId }, body);

      if (!updateUser) {
        return res
          .status(404)
          .json({ message: "please provide valid details" });
      }
      return res.status(200).json({ message: "updated successfully" });
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const otpGenerators = async (req, res) => {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(req.app.locals);
  res
    .status(200)
    .json({ code: req.app.locals.OTP, session: req.app.locals.resetSession });
};

export const verifyOTP = async (req, res) => {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // otp reseted to default value null
    req.app.locals.resetSession = true; // this means session started
    console.log(req.app.locals);
    return res.status(201).json({ message: "verified" });
  }
  return res.status(409).json({ message: "Invalid OTP" });
};

export const createResetSession = async (req, res) => {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false;
    return res.status(201).json({ message: "access granted" });
  }
  return res.status(409).json({ message: "session Expired" });
};

export const resetPassword = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password, "req body reset password");
  try {
    if (!req.app.locals.resetSession) {
      return res.status(409).json({ message: "session Expired" });
    }

    const existingUser = await userSchema.findOne({ username });
    // console.log(existingUser);

    if (!existingUser) {
      return res.status(401).json({
        message: "You Are Not Data Base...",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(hashedPassword, "hashed password from reset Password");

    existingUser.password = hashedPassword;
    await existingUser.save();

    return res.status(200).json({ message: "data updated successfully...." });

    // if (existingUser) {
    //   const hashedPassword = await bcrypt.hash(password, 10);
    //   userSchema.updateOne(
    //     { username: existingUser.username },
    //     { password: hashedPassword }
    //   );
    //   console.log(existingUser, 'from updated user password ');
    //   return res.status(200).json({
    //     message: 'record updated successfully',
    //   });
    // } else {
    //   return res.status(401).json({ message: 'password is inavlid ' });
    // }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
