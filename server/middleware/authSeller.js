import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.status(401).json({ success: false, message: "Not Authorized." });
  }

  try {
    //first we need to decode the token that we are getting from this cookies. we use jwt for decoding
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);

    // If decoded token contains email is = to the email that is stored in env
    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      next();
    } else {
      console.log('Token email mismatch:', tokenDecode.email, 'vs', process.env.SELLER_EMAIL);
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: `Authentication failed: ${error.message}` });
  }
};

export default authSeller;