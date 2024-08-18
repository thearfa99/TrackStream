import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is installed
import Taginput from '../../components/input/taginput';
import { MdClose } from 'react-icons/md';

const AddEditNotes = ({ noteData, type, onClose, onSuccess }) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [isPinned, setIsPinned] = useState(noteData?.isPinned || false);
  const [priority, setPriority] = useState(noteData?.priority || 'normal');
  const [error, setError] = useState(null);

  // Function to add a new note
  const addNewNote = async () => {
    try {
      const response = await axios.post('/add-task', {
        title,
        content,
        tags,
        isPinned,
        priority,
        // You can add other fields here if needed
      });
      console.log("Task added:", response.data);
      if (onSuccess) onSuccess(); // Callback to update the UI after successful add
      onClose(); // Close the modal
    } catch (error) {
      setError("Failed to add task. Please try again.");
      console.error("Error adding task:", error);
    }
  };

  // Function to edit an existing note
  const editNote = async () => {
    try {
      const response = await axios.post(`/update-task/${noteData._id}`, {
        title,
        content,
        tags,
        isPinned,
        priority,
        // You can add other fields here if needed
      });
      console.log("Task updated:", response.data);
      if (onSuccess) onSuccess(); // Callback to update the UI after successful edit
      onClose(); // Close the modal
    } catch (error) {
      setError("Failed to update task. Please try again.");
      console.error("Error updating task:", error);
    }
  };

  // Function to handle form submission
  const handleAddNote = () => {
    if (!title.trim()) {
      setError("Please enter the title");
      return;
    }

    if (!content.trim()) {
      setError("Please enter the content");
      return;
    }

    setError(null);

    if (type === 'edit') {
      editNote();
    } else {
      addNewNote();
    }
  };

  // Function to delete a note
  const deleteNote = async () => {
    try {
      const response = await axios.delete(`/delete-task/${noteData._id}`);
      console.log("Task deleted:", response.data);
      if (onSuccess) onSuccess(); // Callback to update the UI after successful delete
      onClose(); // Close the modal
    } catch (error) {
      setError("Failed to delete task. Please try again.");
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className='relative bg-white p-5 rounded shadow-lg max-w-md w-full mx-auto'>
      <button className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50' onClick={onClose}>
        <MdClose className='text-xl text-slate-400' /> 
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

      <div className='mt-3'>
        <label className='input-label'>TAGS</label>
        <Taginput tags={tags} setTags={setTags} />
      </div>

      <div className='flex items-center mt-4'>
        <input
          type="checkbox"
          checked={isPinned}
          onChange={({ target }) => setIsPinned(target.checked)}
        />
        <label className='ml-2 text-sm text-slate-500'>Pin this note</label>
      </div>

      <div className='flex flex-col gap-2 mt-4'>
        <label className='input-label'>PRIORITY</label>
        <select
          className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
          value={priority}
          onChange={({ target }) => setPriority(target.value)}
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>

      {error && <p className='text-red-500 text-xs pt-4'>{error}</p>}

      <div className='flex justify-between mt-5'>
        {type === 'edit' && (
          <button className='btn-secondary font-medium p-3' onClick={deleteNote}>
            DELETE
          </button>
        )}
        <button className='btn-primary font-medium p-3' onClick={handleAddNote}>
          {type === 'edit' ? "UPDATE" : "ADD"}
        </button>
      </div>
    </div>
  );
};

export default AddEditNotes;
