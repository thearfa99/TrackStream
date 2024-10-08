import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Taginput from '../../components/input/taginput';
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosinstance';

const addeditnotes = ({ noteData, type, getAllNotes, onClose, showToastMessage }) => {
    const [title, setTitle] = useState(noteData?.title || "");
    const [content, setContent] = useState(noteData?.content || "");
    const [tags, setTags] = useState(noteData?.tags || []);
    const [status, setStatus] = useState(noteData?.status || "To-Do");
    const [priority, setPriority] = useState(noteData?.priority || "Medium");

    const [assignedUsers, setAssignedUsers] = useState(
        noteData?.assignedUsers?.map(user => ({
            value: user._id,
            label: user.name,
        })) || []
    );

    const [error, setError] = useState(null);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get("/users");
                if (response.data && response.data.users) {
                    const userOptions = response.data.users.map(user => ({
                        value: user.id,
                        label: user.name,
                    }));
                    setAllUsers(userOptions);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();
    }, []);

    const addNewNote = async () => {
        try {
            const response = await axiosInstance.post("/add-note", {
                title,
                content,
                tags,
                status,
                priority,
                assignedUsers: assignedUsers.map(user => user.value),
            });

            if (response.data && response.data.note) {
                showToastMessage("Note Added Successfully");
                getAllNotes();
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            }
        }
    };

    const editNote = async () => {
        const noteId = noteData._id;
        try {
            const response = await axiosInstance.put("/edit-note/" + noteId, {
                title,
                content,
                tags,
                status,
                priority,
                assignedUsers: assignedUsers.map(user => user.value),
            });

            if (response.data && response.data.note) {
                showToastMessage("Note Updated Successfully");
                getAllNotes();
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            }
        }
    };

    const handleAddNote = () => {
        if (!title) {
            setError("Please enter the title");
            return;
        }

        if (!content) {
            setError("Please enter the content");
            return;
        }

        setError("");

        if (type === 'edit') {
            editNote();
        } else {
            addNewNote();
        }
    };

    return (
        <div className='relative'>
            <button className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50' onClick={onClose}>
                <MdClose className='text-xl text-slate-400'/> 
            </button>

            <div className='flex flex-col gap-2'>
                <label className='input-label'>TITLE</label>
                <input
                    type="text"
                    className='text-2xl text-slate-950 outline-none'
                    placeholder='Add a Title'
                    value={title}
                    onChange={({ target }) => setTitle(target.value)}
                />
            </div>

            <div className='flex flex-col gap-2 mt-4'>
                <label className='input-label'>CONTENT</label>
                <textarea
                    type="text"
                    className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                    placeholder='Content'
                    rows={10}
                    value={content}
                    onChange={({ target }) => setContent(target.value)}
                />
            </div>

            <div className='flex flex-wrap gap-3 mt-3'>
                <div className='w-full md:w-1/2'>
                    <label className='input-label'>TAGS</label>
                    <Taginput tags={tags} setTags={setTags} />
                </div>

                <div className='w-full md:w-1/2'>
                    <label className='input-label'>STATUS</label>
                    <select
                        className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                        value={status}
                        onChange={({ target }) => setStatus(target.value)}
                    >
                        <option value="To-Do">To-Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Complete">Complete</option>
                    </select>
                </div>

                <div className='w-full md:w-1/2'>
                    <label className='input-label'>PRIORITY</label>
                    <select
                        className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                        value={priority}
                        onChange={({ target }) => setPriority(target.value)}
                    >
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                        <option value="High">High</option>
                    </select>
                </div>

                <div className='w-full md:w-1/2'>
                    <label className='input-label'>ASSIGN USERS</label>
                    <Select
                        isMulti
                        options={allUsers}
                        value={assignedUsers}
                        onChange={setAssignedUsers}
                        className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                        placeholder="Select Users"
                    />
                </div>
            </div>

            {error && <p className='text-red-500 text-xs pt-4'>{error}</p>}

            <button className='btn-primary font-medium mt-5 p-3' onClick={handleAddNote}>
                {type === "edit" ? "UPDATE" : "ADD"}
            </button>
        </div>
    );
}

export default addeditnotes;
