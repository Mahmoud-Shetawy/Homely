const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  let checkBearer = "Bearer";

  if (token) {
    if (token.startsWith(checkBearer)) {
      token = token.slice(checkBearer.length, token.length);
    }

    jwt.verify(token, process.env.SECRET, (err, decode) => {
      if (err) {
        res.json({
          success: false,
          message: "failed to authenticate",
        });
      } else {
        req.decode = decode;
        next();
      }
    });
  } else {
    res.json({
      success: false,
      message: "no token Provided",
    });
  }
};
