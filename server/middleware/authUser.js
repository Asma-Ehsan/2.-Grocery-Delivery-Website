import jwt from "jsonwebtoken";

//First this Middleware will be executed, that reads token from cookies, decode that token, extracts userId, adds it to req.body, then calls controller function using next()

const authUser= async (req, res, next) => {
  // from request it will try to find the token that is stored in cookies
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    //first we need to decode the token that we are getting from this cookies. we use jwt for decoding
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    //from this decoded token, we find the user Id
    // If decoded token contains user id, attach it to req.body, otherwise deny access
    if (tokenDecode.id) {
    // Extracts user ID from verified JWT and stores it to request so controllers can identify the logged-in user
      req.userId = tokenDecode.id;
    // req.user = { id: tokenDecode.id };


    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Login again",
      });
    }
    //it will call controller function
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authUser;
