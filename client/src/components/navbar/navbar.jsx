import React, { useState } from 'react'
import ProfileInfo from '../cards/profileinfo'
import Searchbar from '../searchbar/searchbar';

const Navbar = ( { userInfo } ) => {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {

  }

  const onClearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className='bg-white bg-opacity-75 flex items-center justify-between px-6 py-2 drop-shadow'>
        <h2 className='text-xl font-medium text-black py-2'>To-Do</h2>

        <Searchbar 
        value={searchQuery}
        onChange={({ target }) => {
          setSearchQuery(target.value)
        }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
        />

        <ProfileInfo userInfo={userInfo} />
    </div>
  );
};

export default Navbar
