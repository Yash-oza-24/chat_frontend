import React, { useEffect, useState, useRef, useCallback } from "react";
import ChatWindow from "./ChatWindow";
import { IoSearch, IoClose, IoLogOutOutline } from "react-icons/io5";
import { FiEdit, FiUsers, FiMessageCircle, FiPlus } from "react-icons/fi";
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
import notification from "../Config/notification";

const Sidebar = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchGroupTerm, setSearchGroupTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [allUser, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState("");

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const minWidth = 280;
  const maxWidth = 500;
  const collapsedWidth = 72;

  const userdata = JSON.parse(localStorage.getItem("User"));
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Get users that already have a chat (to filter from new chat modal)
  const getExistingChatUserIds = useCallback(() => {
    const existingUserIds = new Set();

    allGroups.forEach((group) => {
      // For non-group chats, get the other user's ID
      if (!group.isGroup) {
        group.members.forEach((member) => {
          if (member._id !== userdata._id) {
            existingUserIds.add(member._id);
          }
        });
      }
    });

    return existingUserIds;
  }, [allGroups, userdata._id]);

  // Filter users for new chat modal (exclude existing chats)
  const getAvailableUsersForNewChat = useCallback(() => {
    const existingUserIds = getExistingChatUserIds();
    return allUser.filter(
      (user) => user._id !== userdata._id && !existingUserIds.has(user._id)
    );
  }, [allUser, userdata._id, getExistingChatUserIds]);

  // Resizable sidebar handlers
  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;

        // Collapse if dragged too small
        if (newWidth < minWidth - 50) {
          setIsCollapsed(true);
          setSidebarWidth(collapsedWidth);
        } else if (newWidth >= minWidth) {
          setIsCollapsed(false);
          setSidebarWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
        }
      }
    },
    [isResizing]
  );

  // Toggle collapse on double click
  const handleDoubleClick = useCallback(() => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setSidebarWidth(320);
    } else {
      setIsCollapsed(true);
      setSidebarWidth(collapsedWidth);
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const getFirstLetter = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    return words.map((word) => word[0]?.toUpperCase()).join("");
  };

  const getAvatarColor = (name) => {
    const colors = [
      { bg: "#E3F2FD", text: "#1565C0" },
      { bg: "#FCE4EC", text: "#C2185B" },
      { bg: "#E8F5E9", text: "#2E7D32" },
      { bg: "#FFF3E0", text: "#E65100" },
      { bg: "#F3E5F5", text: "#7B1FA2" },
      { bg: "#E0F7FA", text: "#00838F" },
      { bg: "#FBE9E7", text: "#D84315" },
      { bg: "#EDE7F6", text: "#512DA8" },
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("User");
    navigate("/signin");
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    if (unreadMessages[user._id]) {
      setUnreadMessages((prev) => ({ ...prev, [user._id]: 0 }));
    }
  };

  const getGroups = async () => {
    setLoading(true);
    try {
      const response = await getGroupbyUser();
      response.groups.forEach((group) => {
        socket.emit("join_room", { groupId: group._id });
      });

      const groupsWithLastMessage = await Promise.all(
        response.groups.map(async (group) => {
          try {
            const messagesResponse = await getMessages(group._id);
            const messages = messagesResponse.messages || [];
            const lastMessage =
              messages.length > 0 ? messages[messages.length - 1] : null;
            return {
              ...group,
              lastMessage: lastMessage
                ? {
                  message: lastMessage.message,
                  sender:
                    lastMessage.username === userdata.fullname
                      ? userdata._id
                      : lastMessage.sender,
                  timestamp: lastMessage.createdAt,
                }
                : null,
            };
          } catch (error) {
            return { ...group, lastMessage: null };
          }
        })
      );

      const sortedGroups = groupsWithLastMessage.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return (
          new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
        );
      });

      setAllGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await getAllUser();
      setAllUsers(response.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Socket listener for new messages
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setAllGroups((prevGroups) => {
        const updatedGroups = prevGroups.map((group) => {
          if (group._id === data.groupId) {
            if (!selectedUser || selectedUser._id !== group._id) {
              if (data.username !== userdata.fullname) {
                notification.play();
              }
              setUnreadMessages((prev) => ({
                ...prev,
                [group._id]: (prev[group._id] || 0) + 1,
              }));
            }
            return {
              ...group,
              lastMessage: {
                message: data.message,
                sender: data.sender,
                timestamp: new Date(),
              },
            };
          }
          return group;
        });
        return updatedGroups.sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return (
            new Date(b.lastMessage.timestamp) -
            new Date(a.lastMessage.timestamp)
          );
        });
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [selectedUser, userdata.fullname]);

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (token) {
      getGroups();
      getAllUsers();
    }
  }, []);

  const closeChat = () => setSelectedUser(null);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Get available users (excluding existing chats for new chat modal)
    const availableUsers = showNewChatModal
      ? getAvailableUsersForNewChat()
      : allUser.filter((user) => user._id !== userdata._id);

    const filtered = availableUsers.filter((user) =>
      user.fullname?.toLowerCase().includes(term?.toLowerCase())
    );
    setSearchedUsers(filtered);
  };

  const handleGroupSearch = (e) => {
    const term = e.target.value;
    setSearchGroupTerm(term);
  };

  const initializeNewChatUsers = () => {
    // Filter out users who already have a chat
    const availableUsers = getAvailableUsersForNewChat();
    setSearchedUsers(availableUsers);
    setSearchTerm("");
  };

  const initializeGroupUsers = () => {
    // For groups, show all users except current user
    const filtered = allUser.filter((user) => user._id !== userdata._id);
    setSearchedUsers(filtered);
    setSearchTerm("");
  };

  const handleNewChatUserClick = async (user) => {
    try {
      const response = await createGroup(user);
      // Extract the group from response - adjust based on your API structure
      const newGroup = response.newGroup || response.newGroup || response;

      if (!newGroup || !newGroup._id) {
        console.error("Invalid group response:", response);
        return;
      }

      newGroup.lastMessage = null;

      // Join socket room for the new group
      socket.emit("join_room", { groupId: newGroup._id });

      setAllGroups((prev) => [...prev, newGroup]);
      setSelectedUser(newGroup);
      setActiveTab("All");
      setShowNewChatModal(false);
      setMenuOpen(false);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleNewGroupClick = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) return;

    try {
      const newGroup = await createGroups({
        groupName: groupName.trim(),
        members: selectedGroupMembers,
      });
      setShowNewGroupModal(false);
      setGroupName("");
      setSelectedGroupMembers([]);
      setSearchTerm("");
      getGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const toggleGroupMember = (userId) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getChatDisplayName = (group) => {
    if (userdata.fullname === group.groupName) {
      return group.members
        .filter((m) => m._id !== userdata._id)
        .map((m) => m.fullname)
        .join(", ");
    }
    return group.groupName;
  };

  const getChatInitials = (group) => {
    if (userdata.fullname === group.groupName) {
      return group.members
        .filter((m) => m._id !== userdata._id)
        .map((m) => getFirstLetter(m.fullname))
        .join("");
    }
    return getFirstLetter(group.groupName);
  };

  const filteredGroups = allGroups.filter((group) => {
    const matchesSearch = group.groupName
      ?.toLowerCase()
      .includes(searchGroupTerm?.toLowerCase());
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Chat" && !group.isGroup) ||
      (activeTab === "Group" && group.isGroup);
    return matchesSearch && matchesTab;
  });

  const userAvatarColor = getAvatarColor(userdata.fullname);

  return (
    <div className="flex flex-col md:flex-row bg-[#0a0a0a] h-screen overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: userAvatarColor.bg }}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: userAvatarColor.text }}
            >
              {getFirstLetter(userdata.fullname)}
            </span>
          </div>
          <h2 className="text-white font-semibold">{userdata.fullname}</h2>
        </div>
        <div className="flex items-center gap-2">
          {selectedUser && (
            <button
              onClick={closeChat}
              className="px-3 py-1.5 bg-[#0078D7] text-white text-sm rounded-lg"
            >
              Back
            </button>
          )}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-2 rounded-full hover:bg-[#1a1a1a]"
            >
              <CiMenuKebab className="text-white text-xl" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl min-w-[140px] z-50 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-white hover:bg-[#2a2a2a]"
                >
                  <IoLogOutOutline size={18} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Resizable */}
      <div
        ref={sidebarRef}
        className={`${selectedUser ? "hidden md:flex" : "flex"
          } flex-col bg-[#0a0a0a] border-r border-[#1a1a1a] relative transition-all duration-150 ease-out`}
        style={{
          width: window.innerWidth >= 768 ? `${isCollapsed ? collapsedWidth : sidebarWidth}px` : "100%",
          minWidth: window.innerWidth >= 768 ? `${isCollapsed ? collapsedWidth : minWidth}px` : "100%",
        }}
      >
        {/* Desktop Header */}
        <div className="hidden md:block p-4 border-b border-[#1a1a1a]">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-4`}>
            <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
              <div
                className={`${isCollapsed ? "w-10 h-10" : "w-11 h-11"} rounded-full flex items-center justify-center cursor-pointer`}
                style={{ backgroundColor: userAvatarColor.bg }}
                onClick={() => isCollapsed && handleDoubleClick()}
              >
                <span
                  className="text-base font-semibold"
                  style={{ color: userAvatarColor.text }}
                >
                  {getFirstLetter(userdata.fullname)}
                </span>
              </div>
              {!isCollapsed && (
                <div>
                  <h2 className="text-white font-semibold truncate max-w-[150px]">
                    {userdata.fullname}
                  </h2>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Online
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 rounded-full hover:bg-[#1a1a1a] text-[#8a8a8a] hover:text-white transition-colors"
                >
                  <CiMenuKebab size={20} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl min-w-[150px] z-50 py-1 animate-fadeIn">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#2a2a2a] transition-colors"
                    >
                      <IoLogOutOutline size={18} className="text-red-400" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search and New Chat */}
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a6a6a]" />
                <input
                  type="search"
                  value={searchGroupTerm}
                  onChange={handleGroupSearch}
                  placeholder="Search chats..."
                  className="w-full bg-[#1a1a1a] rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#0078D7] border border-[#2a2a2a] text-sm"
                />
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white transition-colors"
                >
                  <FiEdit size={18} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl min-w-[160px] z-50 py-1 animate-fadeIn">
                    <button
                      onClick={() => {
                        setShowNewChatModal(true);
                        initializeNewChatUsers();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#2a2a2a] transition-colors"
                    >
                      <FiMessageCircle size={16} className="text-[#0078D7]" />
                      <span className="text-sm">New Chat</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowNewGroupModal(true);
                        initializeGroupUsers();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-[#2a2a2a] transition-colors"
                    >
                      <FiUsers size={16} className="text-[#0078D7]" />
                      <span className="text-sm">New Group</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => {
                  setShowNewChatModal(true);
                  initializeNewChatUsers();
                }}
                className="p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white transition-colors"
                title="New Chat"
              >
                <FiEdit size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Search */}
        <div className="md:hidden p-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a6a6a]" />
              <input
                type="search"
                value={searchGroupTerm}
                onChange={handleGroupSearch}
                placeholder="Search..."
                className="w-full bg-[#1a1a1a] rounded-lg py-2 pl-10 pr-4 text-white placeholder-[#6a6a6a] focus:outline-none border border-[#2a2a2a] text-sm"
              />
            </div>
            <button
              onClick={() => {
                setShowNewChatModal(true);
                initializeNewChatUsers();
              }}
              className="p-2 rounded-lg bg-[#0078D7] text-white"
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {!isCollapsed && (
          <div className="p-3 md:p-4">
            <div className="flex bg-[#1a1a1a] rounded-lg p-1">
              {["All", "Chat", "Group"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                    ? "bg-[#0078D7] text-white"
                    : "text-[#8a8a8a] hover:text-white"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 md:px-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-[#0078D7] border-t-transparent rounded-full animate-spin mb-4"></div>
              {!isCollapsed && (
                <p className="text-[#8a8a8a] text-sm">Loading chats...</p>
              )}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
                <FiMessageCircle size={28} className="text-[#0078D7]" />
              </div>
              {!isCollapsed && (
                <>
                  <h3 className="text-white font-semibold mb-2">No Chats Yet</h3>
                  <p className="text-[#8a8a8a] text-sm mb-4">
                    Start a conversation with someone
                  </p>
                  <button
                    onClick={() => {
                      setShowNewChatModal(true);
                      initializeNewChatUsers();
                    }}
                    className="px-4 py-2 bg-[#0078D7] text-white rounded-lg text-sm hover:bg-[#006abc] transition-colors"
                  >
                    Start New Chat
                  </button>
                </>
              )}
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredGroups.map((group) => {
                const displayName = getChatDisplayName(group);
                const initials = getChatInitials(group);
                const avatarColor = getAvatarColor(displayName);
                const isSelected = selectedUser?._id === group._id;
                const unreadCount = unreadMessages[group._id] || 0;

                return (
                  <li
                    key={group._id}
                    onClick={() => handleUserClick(group)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected
                      ? "bg-[#0078D7]/20 border border-[#0078D7]/30"
                      : "hover:bg-[#1a1a1a] border border-transparent"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? displayName : ""}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`${isCollapsed ? "w-10 h-10" : "w-12 h-12"} rounded-full flex items-center justify-center`}
                        style={{ backgroundColor: avatarColor.bg }}
                      >
                        <span
                          className={`${isCollapsed ? "text-xs" : "text-sm"} font-semibold`}
                          style={{ color: avatarColor.text }}
                        >
                          {initials}
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#0078D7] text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </div>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-medium text-sm truncate">
                            {displayName}
                          </h3>
                          {group.lastMessage && (
                            <span className="text-[#6a6a6a] text-xs flex-shrink-0 ml-2">
                              {new Date(
                                group.lastMessage.timestamp
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                        {group.lastMessage && (
                          <p className="text-[#8a8a8a] text-xs truncate">
                            {group.lastMessage.sender === userdata._id &&
                              "You: "}
                            {group.lastMessage.message}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Resize Handle */}
        <div
          className="hidden md:block absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-[#0078D7] transition-colors z-10"
          onMouseDown={startResizing}
          onDoubleClick={handleDoubleClick}
        >
          {/* Visual indicator on hover */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-16 bg-[#2a2a2a] group-hover:bg-[#0078D7] rounded-full transition-colors"></div>
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <div className="hidden md:flex justify-center p-3 border-t border-[#1a1a1a]">
            <button
              onClick={handleDoubleClick}
              className="p-2 rounded-lg hover:bg-[#1a1a1a] text-[#8a8a8a] hover:text-white transition-colors"
              title="Expand sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1`}>
        {selectedUser ? (
          <ChatWindow user={selectedUser} closeChat={closeChat} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-[#0078D7] flex items-center justify-center mb-6">
              <FiMessageCircle size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Welcome to Chat
            </h2>
            <p className="text-[#8a8a8a] mb-8 max-w-md">
              Select a chat to start messaging or create a new conversation
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowNewChatModal(true);
                  initializeNewChatUsers();
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0078D7] text-white rounded-lg hover:bg-[#006abc] transition-colors"
              >
                <FiMessageCircle size={18} />
                <span>Start New Chat</span>
              </button>
              <button
                onClick={() => {
                  setShowNewGroupModal(true);
                  initializeGroupUsers();
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors border border-[#2a2a2a]"
              >
                <FiUsers size={18} />
                <span>Create Group</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden border border-[#2a2a2a]">
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#0a0a0a]">
              <div>
                <h2 className="text-lg font-semibold text-white">New Chat</h2>
                <p className="text-xs text-[#8a8a8a]">
                  {searchedUsers.length} user{searchedUsers.length !== 1 ? "s" : ""} available
                </p>
              </div>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setSearchTerm("");
                }}
                className="w-8 h-8 rounded-full hover:bg-[#2a2a2a] flex items-center justify-center text-[#8a8a8a] hover:text-white"
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className="p-4 border-b border-[#2a2a2a]">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a6a6a]" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search users..."
                  className="w-full bg-[#0a0a0a] rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#0078D7] border border-[#2a2a2a]"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[50vh] p-2">
              {searchedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center mx-auto mb-4">
                    <FiMessageCircle size={28} className="text-[#6a6a6a]" />
                  </div>
                  <p className="text-[#8a8a8a] mb-2">No users available</p>
                  <p className="text-[#6a6a6a] text-sm">
                    You already have chats with all users
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {searchedUsers.map((user) => {
                    const avatarColor = getAvatarColor(user.fullname);
                    return (
                      <li
                        key={user._id}
                        onClick={() => handleNewChatUserClick(user)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2a2a2a] cursor-pointer transition-colors"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: avatarColor.bg }}
                        >
                          <span
                            className="text-sm font-semibold"
                            style={{ color: avatarColor.text }}
                          >
                            {getFirstLetter(user.fullname)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-white block truncate">
                            {user.fullname}
                          </span>
                          <span className="text-[#6a6a6a] text-xs">
                            @{user.username}
                          </span>
                        </div>
                        <FiMessageCircle
                          size={18}
                          className="text-[#0078D7] flex-shrink-0"
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden border border-[#2a2a2a]">
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#0a0a0a]">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create Group
                </h2>
                {selectedGroupMembers.length > 0 && (
                  <p className="text-xs text-[#8a8a8a]">
                    {selectedGroupMembers.length} member
                    {selectedGroupMembers.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowNewGroupModal(false);
                  setGroupName("");
                  setSelectedGroupMembers([]);
                  setSearchTerm("");
                }}
                className="w-8 h-8 rounded-full hover:bg-[#2a2a2a] flex items-center justify-center text-[#8a8a8a] hover:text-white"
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3 border-b border-[#2a2a2a]">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Name"
                className="w-full bg-[#0a0a0a] rounded-lg py-2.5 px-4 text-white placeholder-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#0078D7] border border-[#2a2a2a]"
              />
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6a6a6a]" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search users..."
                  className="w-full bg-[#0a0a0a] rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#0078D7] border border-[#2a2a2a]"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[40vh] p-2">
              {searchedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <IoSearch className="mx-auto text-4xl text-[#6a6a6a] mb-4" />
                  <p className="text-[#8a8a8a]">No users found</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {searchedUsers.map((user) => {
                    const isSelected = selectedGroupMembers.includes(user._id);
                    const avatarColor = getAvatarColor(user.fullname);
                    return (
                      <li
                        key={user._id}
                        onClick={() => toggleGroupMember(user._id)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${isSelected
                          ? "bg-[#0078D7]/20 border border-[#0078D7]/50"
                          : "hover:bg-[#2a2a2a] border border-transparent"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: avatarColor.bg }}
                          >
                            <span
                              className="text-sm font-semibold"
                              style={{ color: avatarColor.text }}
                            >
                              {getFirstLetter(user.fullname)}
                            </span>
                          </div>
                          <span className="text-white">{user.fullname}</span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                            ? "bg-[#0078D7] border-[#0078D7]"
                            : "border-[#4a4a4a]"
                            }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="p-4 border-t border-[#2a2a2a] bg-[#0a0a0a]">
              <button
                onClick={handleNewGroupClick}
                disabled={
                  !groupName.trim() || selectedGroupMembers.length === 0
                }
                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${groupName.trim() && selectedGroupMembers.length > 0
                  ? "bg-[#0078D7] text-white hover:bg-[#006abc]"
                  : "bg-[#2a2a2a] text-[#6a6a6a] cursor-not-allowed"
                  }`}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;