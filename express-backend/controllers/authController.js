const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const { secretKey } = require("../config/jwt");

const register = (req, res) => {
  const { username, password } = req.body;
  const existingUser = User.find(username);

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = User.create(username, hashedPassword);

  return res
    .status(201)
    .json({ message: "User created successfully", user: newUser });
};

const login = (req, res) => {
  const { username, password } = req.body;
  const user = User.find(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res
      .status(400)
      .json({ message: "Login failed: invalid username or password" });
  }

  const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
  return res.json({ message: "Logged in successfully", token });
};

module.exports = { register, login };
