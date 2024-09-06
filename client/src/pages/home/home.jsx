import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar';
import Toast from '../../components/toastmessage/toast';
import Notecard from '../../components/cards/notecard';
import EmptyCard from '../../components/emptycard/emptycard';
import axiosInstance from '../../utils/axiosinstance';
import { MdAdd } from "react-icons/md";
import Addeditnotes from './addeditnotes';
import Modal from "react-modal";
import AddNotesImg from "../../assets/images/add-note.svg";
import NoDataImg from "../../assets/images/no-data.svg";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

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

  // Get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  // Delete Note
  const deleteNote = async (data) => {
    const noteId = data._id;

    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);

      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", 'delete');
        getAllNotes();
      }
    } catch (error) {
      if ( 
        error.response && 
        error.response.data && 
        error.response.data.message
      ) {
        console.log("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Search
  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });

      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Pin
  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/update-note-pinned/" + noteId, {
        isPinned: !noteData.isPinned,
      });

      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfully");
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, []);

  // Define priority order
  const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };

  // Function to sort notes by priority, but keep pinned notes at the top
  const sortByPriorityAndPin = (notes) => {
    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Filter and sort notes by status, pin, and priority
  const toDoNotes = sortByPriorityAndPin(allNotes.filter(note => note.status === "To-Do"));
  const inProgressNotes = sortByPriorityAndPin(allNotes.filter(note => note.status === "In Progress"));
  const reviewNotes = sortByPriorityAndPin(allNotes.filter(note => note.status === "Review"));
  const completeNotes = sortByPriorityAndPin(allNotes.filter(note => note.status === "Complete"));

  return (
    <>
      <Navbar 
        userInfo={userInfo} 
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />

<div className='container mx-auto mt-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-semibold'>Project Dashboard</h1>
          <button 
            className='bg-primary text-black py-2 px-4 rounded-full flex items-center hover:bg-blue-600'
            onClick={() => {
              setOpenAddEditModal({ isShown: true, type: "add", data: null });
            }}
          >
            <MdAdd className="text-[23px] mr-2" />
            Add New Task
          </button>
        </div>

        {allNotes.length > 0 ? (
          <div className='grid grid-cols-4 gap-4 min-h-screen'>
            <div className='bg-gray-100 p-4 rounded-md'>
              <h2 className='text-xl font-semibold mb-4'>To-Do</h2>
              {toDoNotes.map((item) => (
                <Notecard 
                  key={item._id}
                  title={item.title}
                  date={item.createdOn}
                  content={item.content}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteNote(item)}
                  onPinNote={() => updateIsPinned(item)}
                />
              ))}
            </div>

            <div className='bg-gray-100 p-4 rounded-md'>
              <h2 className='text-xl font-semibold mb-4'>In Progress</h2>
              {inProgressNotes.map((item) => (
                <Notecard 
                  key={item._id}
                  title={item.title}
                  date={item.createdOn}
                  content={item.content}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteNote(item)}
                  onPinNote={() => updateIsPinned(item)}
                />
              ))}
            </div>

            <div className='bg-gray-100 p-4 rounded-md'>
              <h2 className='text-xl font-semibold mb-4'>Review</h2>
              {reviewNotes.map((item) => (
                <Notecard 
                  key={item._id}
                  title={item.title}
                  date={item.createdOn}
                  content={item.content}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteNote(item)}
                  onPinNote={() => updateIsPinned(item)}
                />
              ))}
            </div>

            <div className='bg-gray-100 p-4 rounded-md'>
              <h2 className='text-xl font-semibold mb-4'>Complete</h2>
              {completeNotes.map((item) => (
                <Notecard 
                  key={item._id}
                  title={item.title}
                  date={item.createdOn}
                  content={item.content}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteNote(item)}
                  onPinNote={() => updateIsPinned(item)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyCard 
            imgSrc={isSearch ? NoDataImg : AddNotesImg} 
            message={isSearch ? `Oops! No Results found with that search query!` : `Start creating your first Task/Note! Click the 'Add' button to get started`} 
          />
        )}
      </div>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColour: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <Addeditnotes 
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type:"add", data: null});
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      {showToastMsg.isShown && (
        <Toast 
          message={showToastMsg.message}
          type={showToastMsg.type}
          handleCloseToast={handleCloseToast}
        />
      )}
    </>
  );
};

export default Home;