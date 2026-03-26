import { useContext, useState , createContext, useEffect} from "react";
import {useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import axios from 'axios'

//we have to add 1 more property in axios which is withCredentials true so that we can send the cookies in the API request
axios.defaults.withCredentials = true

// this backend url is set as the default base URL for any API call made through this axios pkg
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {

    const currency = import.meta.env.VITE_CURRENCY;

    // States that we can access in any other component
    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    //to display and hide the form
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])

    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState("")

    //fetch seller status
    const fetchSeller = async () => {
        try {
            const {data} = await axios.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(true)
                 // Clear user state when seller logs in (sellers don't have user tokens)
                 setUser(null)
                 setCartItems({})
                 return true
            }else{
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }

    //fetch User Auth Status, User Data and Cart Items
    const fetchUser = async () => {
        // Don't fetch user if seller is already logged in
        if (isSeller) {
            setUser(null)
            return
        }
        
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if(data.success){
                //setting user data in user state
                setUser(data.user)
                // it will update user cartItems after fetching the user
                setCartItems(data.user.cartItems || {})
            }
        } catch (error) {
            setUser(null)
        }
        
    }


    //function to fetch all products 
    const fetchProducts = async () => {
        try {
            const {data} = await axios.get('/api/product/list');
            if(data.success){
                //setting the product that we are getting from response i.e data
                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // addToCart increases quantity by 1, while updateCartItem sets an exact quantity based on user input

    //Add product to cart
    const addToCart = async (itemId) => {
        // Creates a deep copy of cartItems to safely modify cart data without mutating state
        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            cartData[itemId] += 1;
        }else{
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Adding to Cart")
    }

    //Update Cart Item Quantity
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }

    //Remove Product from Cart
    const removeFromCart = async (itemId) => {
        // Creates a deep copy of cartItems to safely modify cart data without mutating state
        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] === 0){
                delete cartData[itemId]
            }
        }
        setCartItems(cartData);
        toast.success("Remove from Cart")
    }

    //Get cart item count:

    // cartItems is an object where keys are product IDs and values are quantities
    // Example: { "p1": 2, "p2": 1, "p3": 3 }

    const getCartCount = () => {
        let totalCount = 0;
        
         // for...in loop runs for each product ID (p1, p2, p3) inside cartItems
        for(const item in cartItems){

        // cartItems[item] means "quantity of the current product"
        // First loop: item = "p1" → cartItems["p1"] = 2 → totalCount = 0 + 2 = 2
        // Second loop: item = "p2" → cartItems["p2"] = 1 → totalCount = 2 + 1 = 3
            totalCount += cartItems[item]
        }
        return totalCount;
    }

    //Get Cart Total Amount
    const getCartAmount = () => {
        let totalAmount = 0;

         // 'items' represents a product ID (e.g. "p1", "p2", "p3")
        for(const items in cartItems){

            // Matches the product's _id(from assest) with the product ID from cartItems to get the correct product details
            let itemInfo = products.find((product) => product._id === items);
            if(cartItems[items] > 0){
                totalAmount +=itemInfo.offerPrice * cartItems[items]
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    //we"ll call this fetchProducts whenever the component gets initially loaded 
    useEffect(() => {
        fetchProducts()
        fetchSeller()
        fetchUser()
    },[])

    //whenever cartItems updated, it will executed this function and using this func we"ll update the cart data in DB
    useEffect(() => {
        if (isSeller || !user) {
            return;
        }

        // Early return: Don't update cart if cartItems is empty
        if (!cartItems || Object.keys(cartItems).length === 0) {
            return;
        }
        const updateCart = async () => {
            try {
                const {data} = await axios.post('/api/cart/update', {cartItems})
                    if(!data.success){
                        toast.error(data.message)
                    }
                
            } catch (error) {
                toast.error(error.message)
            }
        }
        //if user is available then we"ll call updateCart dunction
     
            updateCart()
        
    }, [cartItems, user])
    
    //to export states
    const value = {navigate, user,setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartAmount, getCartCount, axios, fetchProducts,fetchUser, setCartItems}
    
    return <AppContext.Provider value={value}>
    {children}
    </AppContext.Provider>
}

//custom Hook:
// we can use Appcontext in any other component AND 
//  we can access any data stored in value object in any other component
export const useAppContext = () => {
    return useContext(AppContext)
}