import React, { useState } from 'react';
import { MdOutlinePushPin } from "react-icons/md";
import { MdCreate, MdDelete } from "react-icons/md";
import moment from "moment";

const Notecard = ({
    title,
    date,
    content,
    tags,
    isPinned,
    onEdit,
    onDelete,
    onPinNote
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = (e) => {
        // Prevent the event from bubbling up when clicking on edit, delete, or pin buttons
        if (e.target.closest('.control-btn')) return;
        setIsExpanded(!isExpanded);
    };

    return (
        <div 
            className={`border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out cursor-pointer ${isExpanded ? '' : 'max-h-40 overflow-hidden'}`} 
            onClick={toggleExpand}
        >
            <div className='flex items-center justify-between'>
                <div>
                    <h6 className='text-sm font-medium'>{title}</h6>
                    <span className='text-xs text-slate-500'>{moment(date).format('Do MMM YYYY')}</span>
                </div>

                <div className="flex gap-2">
                    <MdOutlinePushPin 
                        className={`icon-btn control-btn ${isPinned ? 'text-primary' : 'text-slate-300'}`} 
                        onClick={(e) => {
                            onPinNote();
                        }} 
                    />
                    <MdCreate
                        className='icon-btn control-btn hover:text-green-600'
                        onClick={(e) => {
                            onEdit();
                        }}
                    />
                    <MdDelete
                        className='icon-btn control-btn hover:text-red-500'
                        onClick={(e) => {
                            onDelete();
                        }}
                    />
                </div>
            </div>

            <p className='text-xs text-slate-600 mt-2'>
                {isExpanded ? content : `${content?.slice(0, 60)}${content?.length > 60 ? '...' : ''}`}
            </p>

            <div className='text-xs text-slate-500 mt-2'>
                {tags.map((item, index) => (
                    <span key={index}>{`#${item} `}</span>
                ))}
            </div>
        </div>
    );
};

export default Notecard;
