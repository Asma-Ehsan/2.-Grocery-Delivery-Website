import React from 'react'
import { useAppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';

const ProductCategory = () => {
    const {products} = useAppContext();
    // Uses React Router's useParams hook with object destructuring to get the dynamic category value from the URL
    const {category} = useParams(); 

    // Finds the category object that matches the category value from the URL.. .find() → returns the first matching object
    const searchCategory = categories.find((item) => item.path.toLowerCase() === category)

    // Filters products to show only those that belong to the selected category
    const filteredProducts = products.filter((product) => product.category.toLowerCase() === category)

  return (
    <div className='mt-16'>
        {searchCategory && (
            <div className='flex flex-col items-end w-max'>
                <p className='text-2xl font-medium'>{searchCategory.text.toUpperCase()}</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>
        )}
        {filteredProducts.length > 0 ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
                {filteredProducts.map((product) => (
                    <ProductCard key = {product._id} product={product} />
                ))}
            </div>
        ) : (
            <div className='flex items-center justify-center h-[60vh]'>
                <p className='text-2xl font-medium text-primary'>No Product found in this category</p>
            </div>
        )}
    </div>
  )
}

export default ProductCategory
