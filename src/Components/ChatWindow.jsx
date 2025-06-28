import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { CiMenuKebab } from "react-icons/ci";
// const socket = io("http://localhost:5000");
import socket from "../Config/socket";
import { getMessages, deleteMessage } from "../API/api";
import { LuSendHorizontal } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoCheckmarkCircle } from "react-icons/io5";
import AddMemberModal from "./Addmembermodal";

const ChatWindow = ({ user, closeChat }) => {

  const getFirstLetter = (groupName) => {
    const words = groupName?.split(" ");
    const firstLetter = words?.map((word) => word[0].toUpperCase());
    return firstLetter?.join("");
  };
  const userdata = JSON.parse(localStorage.getItem("User"));
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const messagesEndRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [user._id]);

  const handleShowAddMemberModal = () => {
    setShowAddMemberModal(true);
  };

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false);
  };
  const getMesaages = async () => {
    try {
      setLoadingMessages(true);
      const response = await getMessages(user._id);
      setMessages(response.messages);
      setLoadingMessages(false);
    } catch {
      setLoadingMessages(false);
      console.error("Error fetching messages");
    }
  };
  useEffect(() => {
    socket.on("receive_message", (newMessage) => {
      console.log(newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  }, []);

  useEffect(() => {
    setMessages([]);
    if (user._id) {
      getMesaages();
    }
  }, [user._id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return; // Don't send empty messages
    socket.emit("send_message", {
      message: message,
      username: userdata.fullname,
      groupId: user._id,
    });
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseChat = () => {
    closeChat();
  };

  const formattedTime = (time) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMessageSelect = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleDeleteSelectedMessages = async () => {
    if (selectedMessages.length === 0) {
      setErrorToastMessage('Please select a message');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }
    try {
      // Delete each selected message using the API
      for (const messageId of selectedMessages) {
        await deleteMessage(messageId);
      }
      
      // Update local messages state
      setMessages(prevMessages => 
        prevMessages.filter(msg => !selectedMessages.includes(msg._id))
      );
      
      // Show success notification
      showToast(`${selectedMessages.length} message${selectedMessages.length > 1 ? 's' : ''} deleted successfully`);
      
      // Reset selection mode
      setSelectedMessages([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Error deleting messages:", error);
      showToast("Failed to delete messages");
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setSelectedMessages([]);
    }
  };

  return (
    <>
      <div className="flex-1 bg-[#0a0a0a] h-screen flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-[#1a1a1a] bg-[#081e40]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffd199] to-[#ffb366] flex justify-center items-center shadow-lg">
              {userdata.fullname === user.groupName ? (
                <div className="flex gap-1">
                  {user.members
                    .filter((member) => member._id !== userdata._id)
                    .map((member) => (
                      <span
                        key={member._id}
                        className="text-xl font-bold text-[#c06607]"
                      >
                        {getFirstLetter(member.fullname)}
                      </span>
                    ))}
                </div>
              ) : (
                <span className="text-xl font-bold text-[#c06607]">
                  {getFirstLetter(user.groupName)}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              {userdata.fullname === user.groupName ? (
                <div className="flex flex-wrap gap-1">
                  {user.members
                    .filter((member) => member._id !== userdata._id)
                    .map((member) => (
                      <span
                        key={member._id}
                        className="text-white text-sm font-medium"
                      >
                        {member.fullname}
                      </span>
                    ))}
                </div>
              ) : (
                <span className="text-white text-lg font-semibold truncate max-w-[200px]">
                  {user.groupName}
                </span>
              )}
              {/* <span className="text-[#838383] text-xs">Online</span> */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSelectionMode && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-lg">
                    <span className="text-white text-sm font-medium">
                      {selectedMessages.length} selected
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/50" />
                    <button
                      onClick={handleDeleteSelectedMessages}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors group"
                    >
                      <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <RiDeleteBin6Line className="text-lg" />
                      </div>
                    </button>
                  </div>
                  <button
                    onClick={toggleSelectionMode}
                    className="text-[#838383] hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-[#1a1a1a]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {!isSelectionMode && (
              <button
                onClick={toggleSelectionMode}
                className="text-[#838383] hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-[#1a1a1a] flex items-center gap-2 group"
              >
                <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </div>
                <span>Select Messages</span>
              </button>
            )}
            <CiMenuKebab
              className="text-white text-2xl cursor-pointer hover:text-[#00bcf2] transition-colors"
              onClick={handleMenuToggle}
            />
            {menuOpen && (
              <div className="absolute right-4 top-16 bg-[#232323] border border-[#2a2a2a] rounded-lg shadow-xl min-w-[180px] z-50 animate-fadeIn">
                <ul className="py-2">
                  {user.isGroup && (
                    <li
                      className="flex items-center gap-2 px-4 py-2 text-white hover:bg-[#1a1a1a] cursor-pointer transition-colors rounded-lg"
                      onClick={() => {
                        setShowGroupDetails(true);
                        setMenuOpen(false);
                      }}
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <span>View Group Details</span>
                    </li>
                  )}
                  <li
                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-[#1a1a1a] cursor-pointer transition-colors rounded-lg"
                    onClick={() => {
                      handleCloseChat();
                      setMenuOpen(false);
                    }}
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>Close Chat</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0078D7] to-[#00bcf2] flex items-center justify-center mb-6 animate-spin">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Loading messages...</h2>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0078D7] to-[#00bcf2] flex items-center justify-center mb-6 shadow-lg animate-pulse">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Messages Yet</h2>
              <p className="text-[#838383] text-lg mb-6">Start a conversation</p>
            </div>
          ) : (
            <>
              {Object.entries(
                messages.reduce((acc, message) => {
                  const date = formatDate(new Date(message.createdAt));
                  if (!acc[date]) {
                    acc[date] = [];
                  }
                  acc[date].push(message);
                  return acc;
                }, {})
              ).map(([date, messages]) => (
                <div key={date} className="mb-6">
                  <div className="inline-flex items-center text-sm relative justify-center w-full">
                    <hr className="w-72 h-px my-1 bg-[#1a1a1a] border-0" />
                    <span className="absolute px-3 font-medium text-[#838383] -translate-x-1/2 bg-[#0a0a0a] left-1/2">
                      {date}
                    </span>
                  </div>
                  {messages.map((message, index) => (
                    <div key={index} className="flex flex-col mb-4">
                      {message.username === userdata.fullname ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-end max-w-[85%] gap-2 group">
                            <span className="text-[#838383] text-xs">
                              {formattedTime(message.createdAt)}
                            </span>
                            <div 
                              className={`flex flex-col items-end relative cursor-pointer transition-all duration-200 ${
                                isSelectionMode 
                                  ? 'hover:bg-[#1a1a1a]/50 rounded-lg p-2' 
                                  : ''
                              } ${
                                selectedMessages.includes(message._id) 
                                  ? 'bg-[#1a1a1a]/50 rounded-lg p-2' 
                                  : ''
                              }`}
                              onClick={() => isSelectionMode && handleMessageSelect(message._id)}
                            >
                              <div className="bg-gradient-to-r from-[#0078D7] to-[#00bcf2] text-white rounded-2xl rounded-tr-none px-4 py-2 shadow-lg">
                                {message.message}
                              </div>
                              {user.isGroup && (
                                <span className="text-[#838383] text-xs mt-1">
                                  You
                                </span>
                              )}
                              {isSelectionMode && selectedMessages.includes(message._id) && (
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#0078D7] rounded-full flex items-center justify-center animate-fadeIn">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start">
                          <div className="flex items-end max-w-[85%] gap-2 group">
                            <div 
                              className={`flex flex-col relative cursor-pointer transition-all duration-200 ${
                                isSelectionMode 
                                  ? 'hover:bg-[#1a1a1a]/50 rounded-lg p-2' 
                                  : ''
                              } ${
                                selectedMessages.includes(message._id) 
                                  ? 'bg-[#1a1a1a]/50 rounded-lg p-2' 
                                  : ''
                              }`}
                              onClick={() => isSelectionMode && handleMessageSelect(message._id)}
                            >
                              <div className="bg-[#1a1a1a] text-white rounded-2xl rounded-tl-none px-4 py-2 shadow-lg">
                                {message.message}
                              </div>
                              {user.isGroup && (
                                <span className="text-[#838383] text-xs mt-1">
                                  {message.username}
                                </span>
                              )}
                              {isSelectionMode && selectedMessages.includes(message._id) && (
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#0078D7] rounded-full flex items-center justify-center animate-fadeIn">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <span className="text-[#838383] text-xs">
                              {formattedTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <div className="p-4 border-t border-[#1a1a1a] bg-[#081e40]">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 p-3 bg-[#1a1a1a] rounded-full border border-[#2a2a2a] text-white placeholder-[#838383] focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent transition-all"
            />
            <button
              className="bg-gradient-to-r from-[#0078D7] to-[#00bcf2] text-white p-3 rounded-full hover:opacity-90 transition-all shadow-lg"
              onClick={handleSendMessage}
            >
              <LuSendHorizontal className="text-xl" />
            </button>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-fadeIn z-50 border-l-4 border-green-500">
          <IoCheckmarkCircle className="text-green-500 text-xl" />
          <span>{notificationMessage}</span>
        </div>
      )}
      {/* Error Toast Notification */}
      {showErrorToast && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-fadeIn z-50 border-l-4 border-red-900">
          <span>{errorToastMessage}</span>
        </div>
      )}
      <AddMemberModal
        show={showAddMemberModal}
        handleClose={handleCloseAddMemberModal}
        user={user}
      />
      {/* Group Details Modal */}
      {showGroupDetails && user.isGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] w-[90%] max-w-md relative">
            <button
              onClick={() => setShowGroupDetails(false)}
              className="absolute top-4 right-4 text-[#838383] hover:text-white text-2xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Group Details</h2>
            <div className="mb-4">
              <div className="text-lg font-semibold text-white mb-2">{user.groupName}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {user.members.map((member) => (
                  <span key={member._id} className="bg-[#232323] text-white px-3 py-1 rounded-full text-sm">
                    {member.fullname}
                  </span>
                ))}
              </div>
            </div>
            <button
              className="w-full bg-[#0078D7] text-white py-2 rounded-lg hover:bg-[#0066b3] transition-colors mt-4"
              onClick={() => {
                setShowGroupDetails(false);
                setTimeout(() => setShowAddMemberModal(true), 200); // Small delay for smooth transition
              }}
            >
              Add Members
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
