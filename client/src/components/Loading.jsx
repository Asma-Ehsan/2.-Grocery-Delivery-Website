import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Loading = () => {
    const {navigate} = useAppContext()
    //we need the search from the location
    let {search} = useLocation()
    const query = new URLSearchParams(search)
    //after getting the search query from this, we have to find the value
    const nextUrl = query.get('next'); //we are providing query name which is next

    useEffect(() => {
        if(nextUrl){
            setTimeout(() => {
                navigate(`/${nextUrl}`)
            },5000)
        }
    }, [nextUrl, navigate])

  return (
    <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary'>

        </div>
    </div>
  )
}

export default Loading
