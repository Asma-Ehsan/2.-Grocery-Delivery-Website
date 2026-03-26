import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard';

const AllProducts = () => {

    const {products, searchQuery} = useAppContext();
    const [filterProducts, setFilterProducts ] = useState([])

    //Whenever products, searchQuery changes then this will executed
    useEffect(() => {
        // Checks if user has typed something in the search box (avoids unnecessary filtering)
        if(searchQuery.length > 0){
             // Filters the products array and returns only matching items without modifying original data
            setFilterProducts(products.filter(
                 // Arrow function: checks case-insensitively if product name includes the search text
                product => product.name.toLowerCase().includes(searchQuery.toLowerCase())
            ))
        }else{
            // If search box is empty, reset and show all products
            setFilterProducts(products)
        }
    }, [products, searchQuery])

  return (
    <div className='mt-16 flex flex-col'>
        {/* // Stacks items vertically, aligns them to the right, and keeps container width fit to content */}
      <div className='flex flex-col items-end w-max'>
        <p className='text-2xl font-medium uppercase'>All Products</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>
   
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
      {filterProducts.filter((product) => product.inStock).map((product, index) => (
            <ProductCard key={index} product={product}/>
        ))}
      </div>
    </div>
  )
}

export default AllProducts
