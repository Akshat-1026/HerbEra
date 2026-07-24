import jwt from "jsonwebtoken";
import config from "../config/index.js";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: config.jwtExpire }
  );
};

export default generateToken;