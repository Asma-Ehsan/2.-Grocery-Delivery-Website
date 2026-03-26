import Address from "../models/Address.js";

//Add Address in DB: /api/address/add
export const addAddress = async (req, res) => {
    try {
        // Getting data from request (Frontend sends address object)
        const {address} = req.body;
         // authUser middleware sets req.userId from the JWT
        const userId = req.userId;
        //after getting the userID and address data, we"ll add this address in DB
         // Saves address with userId to link it to the logged-in user
        await Address.create({...address, userId})
        res.json({success: true, message: "Address added successfully"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//Get Address: /api/address/get
export const  getAddress = async (req, res) => {
    try {
        const userId   = req.userId;
        const addresses = await Address.find({userId})
        res.json({success: true, addresses})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}