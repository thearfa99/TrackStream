import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar';
import Notecard from '../../components/cards/notecard';
import axiosInstance from '../../utils/axiosinstance';
import { MdAdd } from "react-icons/md";
import Addeditnotes from './addeditnotes';
import Modal from "react-modal";

const Home = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [notes, setNotes] = useState([]);
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const navigate = useNavigate();

  // Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Get All Notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/tasks");
      if (response.data && !response.data.error) {
        setNotes(response.data.tasks);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    getUserInfo();
    getAllNotes();
  }, []);

  const handleAddNote = async (newNote) => {
    try {
      const response = await axiosInstance.post("/add-task", newNote);
      if (response.data && !response.data.error) {
        setNotes([...notes, response.data.task]);
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleEditNote = async (updatedNote) => {
    try {
      const response = await axiosInstance.post(`/update-task/${updatedNote._id}`, updatedNote);
      if (response.data && !response.data.error) {
        setNotes(notes.map(note => note._id === updatedNote._id ? response.data.task : note));
      }
    } catch (error) {
      console.error("Error editing note:", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await axiosInstance.delete(`/delete-task/${noteId}`);
      if (response.data && !response.data.error) {
        setNotes(notes.filter(note => note._id !== noteId));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handlePinNote = async (note) => {
    const updatedNote = { ...note, isPinned: !note.isPinned };
    await handleEditNote(updatedNote);
  };

  return (
    <>
      <Navbar userInfo={userInfo}/>
      <div className='container mx-auto'>
        <div className='grid grid-cols-3 gap-4 mt-8'>
          {notes.map(note => (
            <Notecard 
              key={note._id}
              title={note.title} 
              date={new Date(note.createdTime).toLocaleString()}
              content={note.content}
              tags={note.tags}
              isPinned={note.isPinned}
              onEdit={() => setOpenAddEditModal({ isShown: true, type: "edit", data: note })}
              onDelete={() => handleDeleteNote(note._id)}
              onPinNote={() => handlePinNote(note)}
            />
          ))}
        </div>
      </div>

      <button 
        className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10' 
        onClick={() => setOpenAddEditModal({ isShown: true, type: "add", data: null })}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type:"add", data: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel="Add/Edit Note"
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <Addeditnotes 
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => setOpenAddEditModal({ isShown: false, type:"add", data: null })}
          onSave={(note) => {
            if (openAddEditModal.type === "add") {
              handleAddNote(note);
            } else {
              handleEditNote(note);
            }
            setOpenAddEditModal({ isShown: false, type:"add", data: null });
          }}
        />
      </Modal>
    </>
  );
};

export default Home;
