import express from 'express';
import { upload } from '../config/multer.js';
import authSeller from '../middleware/authSeller.js';
import { addProduct, changeStock, productById, productList } from '../controllers/productController.js';

const productRouter = express.Router();

//Added authSeller middleware bcz the user can only add any product if it is authenticated seller
//upload.array('images') Multer middleware to handle multiple image uploads and attach them to req.files
productRouter.post('/add', upload.array("images"), authSeller, addProduct)
productRouter.get('/list', productList)
productRouter.get('/id', productById)
productRouter.post('/stock', authSeller, changeStock)

export default productRouter;