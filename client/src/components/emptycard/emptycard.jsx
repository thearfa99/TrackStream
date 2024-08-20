import React from 'react'

const emptycard = ({ imgSrc, message }) => {
  return (
    <div className='flex flex-col items-center justify-center mt-40'>
      <img src={imgSrc} alt="No Notes" className='w-60'/>

      <p className='w-1/2 text-sm font-medium text-slate-700 text-center leading-7 mt-5'>
      {message}
      </p>
      
    </div>
  )
}

export default emptycard
