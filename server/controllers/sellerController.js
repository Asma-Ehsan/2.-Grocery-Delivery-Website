import jwt from "jsonwebtoken";

//Seller Login : /api/seller/login
export const sellerLogin = async (req, res) => {
    try {
        const {email, password} = req.body;

    if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie("sellerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
          });
          return res.json({success: true , message: "Logged in"})
    }else{
        return res.json({success: false , message: "Invalid Credentials"})
    }
        
    } catch (error) {
        return res.json({ success: false, message: error.message }); 
    }
}

//Seller Authentication : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
  try{
      return res.json({success: true})
  }
  catch(error){
      console.log(error.message)
      return res.json({success: false, message: error.message})
  }
}

//Logout Seller : /api/seller/logout
export const sellerLogout = async (req, res) => {
    try {
      //in it, we just need to clear the cookie from the response
      res.clearCookie('sellerToken', /*cookie name*/ {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
      });
  
      //As we cleared the cookie, then the user is logged out
      return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  };