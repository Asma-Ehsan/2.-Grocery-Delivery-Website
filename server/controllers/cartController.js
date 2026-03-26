//Update user cart data: /api/cart/update:

import User from "../models/user.js";

export const updateCart = async (req, res) => {
    try {
        //getting user id and in the body we"ll not send the user ID , this userId will be added using middleware that we have created for user auth 
        const userId = req.userId;
        const {cartItems} = req.body;
        await User.findByIdAndUpdate(userId, {cartItems}); //updae the cart data of this user id
        res.json({success: true, message: "Cart Updated"});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}