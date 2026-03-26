import Order from '../models/Order.js';
import Product from '../models/Product.js'
import stripe from "stripe"
import User from '../models/user.js'

//Place Order COD: /api/order/cod
export const placeOrderCOD = async (req,res) => {
    try {
        const userId = req.userId
        const {items, address} = req.body;
        if(!address || items.length === 0) {
            return res.json({success: false, message: "Invalid Data" })
        }
        //if address is available and items length id greater than 0 then calculate the amount using items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product); //item.product is the product ID
            return (await acc) + product.offerPrice * item.quantity;
        }, 0) //acc initial value = 0

        // Add tax charge (2%)
        amount += Math.floor(amount * 0.02);

        //Creating order that will be saved in DB
        await Order.create({
            userId, items, amount, address, paymentType: "COD"
        })

        return res.json({success: true, message: "Order placed successfully"});
    } catch (error) {
        return res.json({success: false, message: error.message });
    }
}

//Place Order Stripe: /api/order/stripe
export const placeOrderStripe = async (req,res) => {
    try {
        const userId = req.userId
        const {items, address} = req.body;
        const {origin} = req.headers; //this origin is the frontend url

        if(!address || items.length === 0) {
            return res.json({success: false, message: "Invalid Data" })
        }

        let productData = [];

        //if address is available and items length id greater than 0 then calculate the amount using items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product); //item.product is the product ID
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0) //acc initial value = 0

        // Add tax charge (2%)
        amount += Math.floor(amount * 0.02);

        //Creating order that will be saved in DB
        const order = await Order.create({
            userId, items, amount, address, paymentType: "Online"
        });

        //Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        //create line items for stripe
        const line_items = productData.map((item) => { //we will get individual product item
            return{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) *100
                },
                quantity: item.quantity,
            }
        })

        //Create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url:`${origin}/cart`,
            metadata: { //adiing order and user id in metadata
                orderId: order._id.toString(),
                userId,
            }
        })

        return res.json({success: true, url: session.url});
    } catch (error) {
        return res.json({success: false, message: error.message });
    }
}

//Stripe Webhooks to Verify Payments Action: /stripe
export const stripeWebhooks = async (request, response) => {
    //Stripe Getway  initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`)
    }

    //handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId, //we will get the session from this payment intent id
            })
            //from this session, we will go to metadata and from metadata we will find the orderId and userID
            //whenever the successed event happens it means the payment is successfull fot this order and user id
            const {orderId, userId} = session.data[0].metadata;

            //mark payment as paid
            await Order.findByIdAndUpdate(orderId, {isPaid: true})

            //clear cart data
            await User.findByIdAndUpdate(userId, {cartItems: {}});
            break;
        }

        case 'payment_intent.payment_failed':{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId, //we will get the session from this payment intent id
            })
            //from this session, we will go to metadata and from metadata we will find the orderId and userID
            //whenever the successed event happens it means the payment is successfull fot this order and user id
            const {orderId} = session.data[0].metadata;

            //as payment is failed so we delete that order from DB
            await Order.findByIdAndDelete(orderId);
            break;
        }
    
        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }

    response.json({received: true})
}

//get order details of individual user (using user ID): /api/order/user
export const getUserOrders = async (req,res) => {
    try {
        const  userId  = req.userId;
        const orders = await Order.find({
            userId,
            // $or = any condition true.  Uses array of query objects
            //when order type is COD then it will display to user
            //when payment type is online and is paid is true then only it will displayed 
            //if the payment type is online and is paid is false then it will not be sent to the user 
            $or: [{paymentType: "COD"}, {isPaid: true}]  

        }).populate("items.product address").sort({createdAt : -1})  // populate replaces referenced IDs with full product & address docs, and sort orders results by newest first
        
        res.json({success: true, orders});
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//getting all order details for seller or admin: /api/order/seller
export const getAllOrders = async (req,res) => {
    try {
        const orders = await Order.find({
            // $or = any condition true.  Uses array of query objects
            //when order type is COD then it will display to user
            //when payment type is online and is paid is true then only it will displayed 
            //if the payment type is online and is paid is false then it will not be sent to the user 
            $or: [{paymentType: "COD"}, {isPaid: true}]  

        }).populate("items.product address").sort({createdAt : -1})  // populate replaces referenced IDs with full product & address docs, and sort orders results by newest first
        
        res.json({success: true, orders});
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}