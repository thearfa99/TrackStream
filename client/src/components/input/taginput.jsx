import React, { useState } from 'react'
import { MdAdd } from 'react-icons/md'

const taginput = () => {
    const [inputValue, setInputValue] = useState("");

    const handleInputChange =(e) => {
        setInputValue(e.target.value);
    };

    const addNewTag = () => {
        if (inputValue.trim() !=="") {
            setTags([...tags, inputValue.trim()]);
            setInputValue("");
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            addNewTag();
        }
    }
  return (
    <div>
        <div className='flex items-center gap-4 mt-3'>
            <input 
            type="text" 
            className='text-sm bg-transparent border px-3 py-2 rounded outline-none' 
            placeholder='Add Tags'
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            />

            <button className='w-8 h-8 flex items-center justify-center rounded border border-blue-700 hover:bg-blue-700'>
                <MdAdd className='text-2xl text-blue-700 hover:text-white'/>
            </button>
        </div>
    </div>
  )
}

export default taginput
