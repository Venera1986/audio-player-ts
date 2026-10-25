const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error("JWT_SECRET is not set. Copy .env.example to .env and set a secret.");
}

module.exports = { secretKey };
