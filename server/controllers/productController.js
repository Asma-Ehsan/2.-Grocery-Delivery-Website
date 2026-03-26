import {v2 as cloudinary} from "cloudinary"
import Product from "../models/Product.js"
import connectCloudinary from '../config/cloudinary.js'

//here we create different controller functions for adding the product for displaying the list of product and for modifying the stock.

//Add product : /api/product/add
export const addProduct = async (req, res) => {
    //in this we have to add product data in database & we"ll get product data from our body
    try {
        // Converts JSON string from multipart/form-data into a usable JavaScript object
        let productData = JSON.parse(req.body.productData)

        //from the request, we"ll get the images in files property
        // req.files:
        // Contains all uploaded files
        // Available only when Multer middleware is used
        const images = req.files 

        let imagesUrl = await Promise.all(
            
            //using map bcz images are stored in array
            //in this images, we" get multiple images url
            //in async parameter, we"ll get the individual image that Uploads each image one by one and Promise is used to wait for all uploads
            
            images.map(async (item) => {
            
                // cloudinary.uploader.upload(...): Calls Cloudinary’s upload API. Sends a file from your backend to Cloudinary’s cloud storage
                
                // item.path: Comes from Multer. It is the temporary file path where the image was stored on your server
                
                // { resource_type: 'image' }: Explicitly tells Cloudinary: “This file is an image”

                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'})

                //After that in the result we we"ll get the URL of our uploaded image with the secure URL property
                return result.secure_url
            })
            
        )

        //now store this data in DB
        await Product.create({...productData, image: imagesUrl}) 

        res.json({success: true, message: "Product Added"})

    } catch (error) {
         res.json({success: false, message: error.message})
    }
}

//Get Product : /api/product/list
export const productList = async (req, res) => {
    try {
        //first we"ll get the data from the database
        const products = await Product.find({}) //passing empty obj so that it"ll return all the products
        res.json({success: true, products})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//Get Single Product : /api/product/id
export const productById = async (req, res) => {
    try {
        //first we need the individual product ID that we"ll from request body
        const {id} = req.body
        const product = await Product.findById(id) 
        res.json({success: true, product})

    } catch (error) {
        res.json({success: false, message: error.message})
    }    
}

//Change Product in stock : /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const {id, inStock} = req.body //getting the inStock property to know if it is in stock or not 
        await Product.findByIdAndUpdate(id, {inStock}) //getting the product id and then updating the inStock
        res.json({success: true, message: "Stock Updated"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}