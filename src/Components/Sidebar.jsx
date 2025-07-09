import React, { useEffect, useState, useRef } from "react";
import ChatWindow from "./ChatWindow";
import { IoSearch } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import { CiMenuKebab } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import {
  createGroup,
  createGroups,
  getAllUser,
  getGroupbyUser,
  getMessages,
} from "../API/api";

import socket from "../Config/socket";

const Sidebar = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchgroupTerm, setSearchGroupTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [allUser, setAllUsers] = useState([]);
  const [allgroups, setAllGroups] = useState([]);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const userdata = JSON.parse(localStorage.getItem("User"));
  const [loading, setLoading] = useState(true);

  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new window.Audio('/notification.mp3');
    // Unlock audio on first user interaction
    const unlock = () => {
      audioRef.current.play().then(() => audioRef.current.pause()).catch(() => {});
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("User");
    navigate("/signin");
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    if (unreadMessages[user._id]) {
      setUnreadMessages(prev => ({
        ...prev,
        [user._id]: 0
      }));
    }
  };

  const getFirstLetter = (groupName) => {
    const words = groupName?.split(" ");
    const firstLetter = words?.map((word) => word[0].toUpperCase());
    return firstLetter?.join("");
  };

  const getGroups = async () => {
    setLoading(true);
    const response = await getGroupbyUser();
    response.groups.map((group) => {
      socket.emit("join_room", { groupId: group._id });
    });

    // Get the last message for each group
    const groupsWithLastMessage = await Promise.all(
      response.groups.map(async (group) => {
        try {
          const messagesResponse = await getMessages(group._id);
          const messages = messagesResponse.messages || [];
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

          return {
            ...group,
            lastMessage: lastMessage ? {
              message: lastMessage.message,
              sender: lastMessage.username === userdata.fullname ? userdata._id : lastMessage.sender,
              timestamp: lastMessage.createdAt
            } : null
          };
        } catch (error) {
          console.error("Error fetching messages for group:", error);
          return { ...group, lastMessage: null };
        }
      })
    );

    // Sort groups by last message timestamp
    const sortedGroups = groupsWithLastMessage.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
    });

    setAllGroups(sortedGroups);
    setLoading(false);
  };

  // Update socket listener for new messages
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setAllGroups((prevGroups) => {
        const updatedGroups = prevGroups.map((group) => {
          if (group._id === data.groupId) {
            // If the chat is not currently selected, increment unread count
            if (!selectedUser || selectedUser._id !== group._id) {
              // Only play audio if not sent by current user
              if (audioRef.current && data.username !== userdata.fullname) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
              }
              updateUnreadMessages(group._id, 1);
            }
            return {
              ...group,
              lastMessage: {
                message: data.message,
                sender: data.sender,
                timestamp: new Date()
              }
            };
          }
          return group;
        });
        // Sort groups after updating
        return updatedGroups.sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
        });
      });
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [selectedUser, userdata.fullname]);

  const getAllUsers = async () => {
    const response = await getAllUser();
    setAllUsers(response.users);
  };
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };
  useEffect(() => {
    getGroups();
    getAllUsers();
  }, []);

  const closeChat = () => {
    setSelectedUser(null);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    const searchedUsers = allUser.filter((user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) && 
      user._id !== userdata._id // Filter out the logged-in user
    );
    setSearchedUsers(searchedUsers);
  };

  // Function to initialize user list for new chat modal
  const initializeNewChatUsers = () => {
    const filteredUsers = allUser.filter((user) => user._id !== userdata._id);
    setSearchedUsers(filteredUsers);
  };

  const handleGroupSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchGroupTerm(searchTerm);
    const searchedUsers = allgroups.filter((user) =>
      user.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchedUsers(searchedUsers);
  };

  const handleNewChatUserClick = async (user) => {
    const newGroup = await createGroup(user);
    newGroup.lastMessage = null; // Initialize with no messages
    setAllGroups((prevGroups) => [...prevGroups, newGroup]);
    getGroups();
    setActiveTab("All");
    setShowModal(false);
    setShowNewChatModal(false);
    setMenuOpen(false);
  };
  const handleNewGroupClick = async () => {
    const groupName = document.querySelector(
      'input[placeholder="Group Name"]'
    ).value;
    
    if (!groupName.trim()) {
      setShowNewGroupModal(false);
      return;
    }

    const selectedUsers = document.querySelectorAll("li.selected");
    if (selectedUsers.length === 0) {
      setShowNewGroupModal(false);
      return;
    }

    const groupData = {
      groupName,
      members: [...selectedUsers].map((user) => user.getAttribute("data-id")),
    };

    try {
      await createGroups(groupData);
      setShowNewGroupModal(false);
      setSearchTerm("");
      // Clear the group name input
      document.querySelector('input[placeholder="Group Name"]').value = "";
      // Reset all selected users
      document.querySelectorAll("li.selected").forEach(li => {
        li.classList.remove("selected");
        const button = li.querySelector('button');
        if (button) {
          button.classList.remove('bg-[#0078D7]');
          button.textContent = '+';
        }
      });
      // Reload the page immediately
      window.location.reload();
    } catch (error) {
      console.error("Error creating group:", error);
      setShowNewGroupModal(false);
      window.location.reload();
    }
  };

  const handleUserSelection = (userElement) => {
    const button = userElement.querySelector('button');
    if (button.classList.contains('bg-[#0078D7]')) {
      button.classList.remove('bg-[#0078D7]');
      button.textContent = '+';
      userElement.classList.remove("selected");
    } else {
      button.classList.add('bg-[#0078D7]');
      button.textContent = '-';
      userElement.classList.add("selected");
    }
  };

  // Add this function to handle unread messages
  const updateUnreadMessages = (groupId, count) => {
    setUnreadMessages(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || 0) + count
    }));
  };

  return (
    <div className="flex flex-col md:flex-row bg-black h-screen">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 bg-[#081e40]">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#ffd199] flex justify-center items-center mr-2">
            <span className="text-base font-bold text-[#c06607]">
              {getFirstLetter(userdata.fullname)}
            </span>
          </div>
          <h2 className="text-[#00bcf2] text-lg">{userdata.fullname}</h2>
        </div>
        <div className="flex items-center gap-2">
          {selectedUser && (
            <button
              onClick={closeChat}
              className="text-white bg-[#0078D7] px-3 py-1 rounded-lg text-sm"
            >
              Back
            </button>
          )}
          <div className="relative">
            <CiMenuKebab
              className="text-white text-xl cursor-pointer"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            />
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-[#232323] p-2 rounded-md z-10 min-w-[120px]">
                <ul>
                  <li
                    className="text-white py-2 px-4 hover:bg-[#838383] rounded cursor-pointer"
                    onClick={() => {
                      handleLogout();
                      setUserMenuOpen(false);
                    }}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className={`${selectedUser ? 'hidden md:block' : 'block'} w-full md:w-1/3 lg:w-1/4 bg-[#0a0a0a] text-[#0078D7]`}>
        <div className="bg-[#081e40] p-4 border-b border-[#1a1a1a]">
          <div className="hidden md:flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffd199] to-[#ffb366] flex justify-center items-center shadow-lg">
                <span className="text-xl font-bold text-[#c06607]">
                  {getFirstLetter(userdata.fullname)}
                </span>
              </div>
              <div>
                <h2 className="text-[#00bcf2] text-lg font-semibold">{userdata.fullname}</h2>
                {/* <p className="text-[#838383] text-sm">Online</p> */}
              </div>
            </div>
            <div className="relative">
              <CiMenuKebab
                className="text-white text-2xl cursor-pointer hover:text-[#00bcf2] transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              />
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-[#232323] p-2 rounded-lg border border-[#2a2a2a] shadow-xl z-10 min-w-[150px] animate-fadeIn">
                  <ul className="space-y-1">
                    <li
                      className="text-white py-2 px-4 hover:bg-[#1a1a1a] rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      <span>Logout</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838383]" />
              <input
                type="search"
                value={searchgroupTerm}
                onChange={handleGroupSearch}
                placeholder="Search chats..."
                className="w-full bg-[#1a1a1a] rounded-lg py-2 pl-10 pr-4 text-white placeholder-[#838383] focus:outline-none focus:ring-2 focus:ring-[#0078D7] border border-[#2a2a2a]"
              />
            </div>
            <div className="relative">
              <FiEdit
                className="text-xl md:text-2xl cursor-pointer text-white hover:text-[#00bcf2] transition-colors"
                onClick={() => handleMenuToggle(true)}
              />
              {menuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-[#232323] p-2 rounded-lg border border-[#2a2a2a] shadow-xl z-10 min-w-[150px] animate-fadeIn">
                  <ul className="space-y-1">
                    <li
                      className="text-white py-2 px-4 hover:bg-[#1a1a1a] rounded-lg cursor-pointer transition-colors"
                      onClick={() => {
                        setShowModal(false);
                        setShowNewChatModal(true);
                        setMenuOpen(false);
                      }}
                    >
                      New chat
                    </li>
                    <li
                      className="text-white py-2 px-4 hover:bg-[#1a1a1a] rounded-lg cursor-pointer transition-colors"
                      onClick={() => {
                        setShowModal(false);
                        setShowNewGroupModal(true);
                        setMenuOpen(false);
                      }}
                    >
                      New group chat
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-9rem)]">
          <div className="flex bg-[#1a1a1a] rounded-xl p-1 mb-4">
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "All"
                  ? "bg-[#0078D7] text-white"
                  : "text-[#838383] hover:text-white"
              }`}
              onClick={() => setActiveTab("All")}
            >
              All
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "Chat"
                  ? "bg-[#0078D7] text-white"
                  : "text-[#838383] hover:text-white"
              }`}
              onClick={() => setActiveTab("Chat")}
            >
              Chat
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "Group"
                  ? "bg-[#0078D7] text-white"
                  : "text-[#838383] hover:text-white"
              }`}
              onClick={() => setActiveTab("Group")}
            >
              Group
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0078D7] to-[#00bcf2] flex items-center justify-center mb-6 animate-spin">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Loading chats...</h2>
            </div>
          ) : allgroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center p-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0078D7] to-[#00bcf2] flex items-center justify-center mb-6 shadow-lg animate-pulse">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Chats Yet</h2>
             
            </div>
          ) : (
            <ul className="space-y-2">
              {searchgroupTerm === ""
                ? allgroups
                    .filter((group) => {
                      if (activeTab === "All") return true;
                      if (activeTab === "Chat") return !group.isGroup;
                      if (activeTab === "Group") return group.isGroup;
                      return true;
                    })
                    .map((group, index) => (
                      <li
                        key={group._id}
                        className={`rounded-xl p-3 cursor-pointer transition-all duration-300 ${
                          selectedUser && selectedUser._id === group._id
                            ? "bg-[#08224B]"
                            : "hover:bg-[#1a1a1a]"
                        }`}
                        onClick={() => handleUserClick(group)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffd199] to-[#ffb366] flex justify-center items-center shadow-lg">
                              {userdata.fullname === group.groupName ? (
                                <div className="flex gap-1">
                                  {group.members
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
                                  {getFirstLetter(group.groupName)}
                                </span>
                              )}
                            </div>
                            {unreadMessages[group._id] > 0 && (
                              <div className="absolute -top-1 -right-1 bg-[#0078D7] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                {unreadMessages[group._id]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-medium truncate">
                                {userdata.fullname === group.groupName
                                  ? group.members
                                      .filter((member) => member._id !== userdata._id)
                                      .map((member) => member.fullname)
                                      .join(", ")
                                  : group.groupName}
                              </h3>
                              {group.lastMessage && (
                                <span className="text-xs text-[#838383]">
                                  {new Date(group.lastMessage.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                            {group.lastMessage && (
                              <p className="text-sm text-[#838383] truncate">
                                {group.lastMessage.sender === userdata._id
                                  ? "You: "
                                  : ""}
                                {group.lastMessage.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))
                : null}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${selectedUser ? 'block' : 'hidden md:block'} flex-1`}>
        {selectedUser ? (
          <ChatWindow user={selectedUser} closeChat={closeChat} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-black">
            <div className="text-center p-8 max-w-md">
              <div className="w-24 h-24 rounded-full bg-[#0078D7] flex items-center justify-center mb-6 mx-auto">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Welcome to Chat</h2>
              <p className="text-[#838383] text-lg mb-8">Select a chat to start messaging</p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setShowNewChatModal(true);
                    initializeNewChatUsers();
                  }}
                  className="bg-[#0078D7] text-white py-3 px-6 rounded-lg hover:bg-[#0066b3] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Start New Chat
                </button>
                <button
                  onClick={() => setShowNewGroupModal(true)}
                  className="bg-[#232323] text-white py-3 px-6 rounded-lg hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  Create New Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] w-[90%] max-w-md transform transition-all duration-300 animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Create New Chat
              </h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-[#838383] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="relative mb-4">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838383]" />
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search users..."
                className="w-full bg-[#232323] rounded-lg py-2 pl-10 pr-4 text-white placeholder-[#838383] focus:outline-none focus:ring-2 focus:ring-[#0078D7]"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {searchedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#232323] flex items-center justify-center">
                    <IoSearch className="text-2xl text-[#838383]" />
                  </div>
                  <p className="text-[#838383]">No users found</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {searchedUsers.map((user) => (
                    <li
                      key={user._id}
                      className="rounded-lg hover:bg-[#232323] transition-colors cursor-pointer p-3"
                      onClick={() => handleNewChatUserClick(user)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#ffd199] flex justify-center items-center mr-3">
                          <span className="text-lg font-bold text-[#c06607]">
                            {getFirstLetter(user.fullname)}
                          </span>
                        </div>
                        <span className="text-white">{user.fullname}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] w-[90%] max-w-md transform transition-all duration-300 animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Create New Group
              </h2>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="text-[#838383] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Group Name"
                  className="w-full bg-[#232323] rounded-lg py-2 px-4 text-white placeholder-[#838383] focus:outline-none focus:ring-2 focus:ring-[#0078D7]"
                />
              </div>
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838383]" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search users..."
                  className="w-full bg-[#232323] rounded-lg py-2 pl-10 pr-4 text-white placeholder-[#838383] focus:outline-none focus:ring-2 focus:ring-[#0078D7]"
                />
              </div>
            </div>
            <div className="max-h-[40vh] overflow-y-auto mt-4">
              {searchedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#232323] flex items-center justify-center">
                    <IoSearch className="text-2xl text-[#838383]" />
                  </div>
                  <p className="text-[#838383]">No users found</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {searchedUsers.map((user) => (
                    <li
                      key={user._id}
                      data-id={user._id}
                      className="rounded-lg hover:bg-[#232323] transition-colors p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#ffd199] flex justify-center items-center mr-3">
                            <span className="text-lg font-bold text-[#c06607]">
                              {getFirstLetter(user.fullname)}
                            </span>
                          </div>
                          <span className="text-white">{user.fullname}</span>
                        </div>
                        <button
                          className="w-8 h-8 rounded-full bg-[#232323] flex items-center justify-center text-white hover:bg-[#0078D7] transition-colors"
                          onClick={(e) => {
                            const liElement = e.currentTarget.closest('li');
                            handleUserSelection(liElement);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="w-full mt-6 bg-[#0078D7] text-white py-2 rounded-lg hover:bg-[#0066b3] transition-colors"
              onClick={handleNewGroupClick}
            >
              Create Group
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
