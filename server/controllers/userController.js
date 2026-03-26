import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Register function : /api/user/register
export const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.json({success: false, message: "Missing Details"})
        }

        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.json({success: false, message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const user = await User.create({name, email,password: hashedPassword})

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.cookie('token', token, {
            httpOnly: true, //Prevent JS to access cookie
      // secure: true in production (https), false in development (http)
      secure: process.env.NODE_ENV === "production",
      //cookies are domain specific. so Without sameSite, cookies might not reach your backend in cross-site situations. Allows cookies to be sent across sites in production, only same-site in development
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie will expire after 7 days. define 7d in token
        })

        return res.json({success: true, user: {
          _id: user._id,
          email: user.email,
          name: user.name}})
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message})
    }
}

//Login Function: /api/user/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
  
        //Validate email and password
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            message: "Both email and password are required",
          });
        }
        
         //find the user via email
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ success: false, message: "Invalid Email or Password " });
      }

      //if user(email) is found, then we match the password
      const isMatch = await bcrypt.compare(
        password /*password received during login*/,
        user.password /*password stored in DB*/
      );

      if (!isMatch) {
        return res.json({ success: false, message: "Invalid Email  or Password" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

      return res.json({ success: true, user: {email: user.email, name: user.name} }); //bcz user is successfully logged in
  
    } catch (error) {
        return res.json({ success: false, message: error.message });        
    }
};

  //Check Auth : /api/user/is-auth
export const isAuth= async (req, res) => {
    try {
        //first getting the user ID. Use middleware that will add the userID in the body
        const userId = req.userId; 
        const user = await User.findById(userId).select("-password") //will find the user id and give its data except its password
      return res.json({success: true, user});
    } catch (error) {
      return res.json({success: false, message: error.message});
    }
};

//Logout Function : /api/user/logout
export const logout = async (req, res) => {
    try {
      //in it, we just need to clear the cookie from the response
      res.clearCookie("token" /*cookie name*/, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
  
      //As we cleared the cookie, then the user is logged out
      return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  };