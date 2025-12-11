import React, { useEffect, useState } from "react";
import { getAllUser } from "../API/api";
import { addMember } from "../API/api";
import { IoSearch } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import { FaUserPlus, FaCheck } from "react-icons/fa";
import { BsCheckLg } from "react-icons/bs";

const AddMemberModal = ({ show, handleClose, user }) => {
  const [allUser, setAllUser] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

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

  const getAllUsers = async () => {
    const response = await getAllUser();
    const groupMemberIds = user.members.map((member) => member._id);
    const filteredUsers = response.users.filter(
      (u) => !groupMemberIds.includes(u._id)
    );
    setAllUser(filteredUsers);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const groupMemberIds = user.members.map((member) => member._id);
    const filtered = allUser.filter(
      (u) =>
        u.fullname?.toLowerCase().includes(term?.toLowerCase()) &&
        !groupMemberIds.includes(u._id)
    );
    setSearchedUsers(filtered);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMember = async () => {
    if (selectedUsers.length > 0) {
      try {
        await addMember(user._id, selectedUsers);
        toast.success("Member added successfully");
        setSelectedUsers([]);
        handleClose();
      } catch (error) {
        console.error("Error adding member:", error);
        toast.error("Error adding member");
      }
    } else {
      toast.error("Please select a member to add");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddMember();
  };

  useEffect(() => {
    if (show) {
      getAllUsers();
      setSelectedUsers([]);
      setSearchTerm("");
    }
  }, [show, user]);

  useEffect(() => {
    setSearchedUsers(allUser);
  }, [allUser]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl border border-[#2a2a2a] animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0078D7] flex items-center justify-center">
              <FaUserPlus className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Add Members</h2>
              <p className="text-xs text-[#8a8a8a]">
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} selected`
                  : "Select members to add"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-[#2a2a2a] flex items-center justify-center text-[#8a8a8a] hover:text-white transition-colors"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#2a2a2a]">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a8a8a]" />
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search users..."
              className="w-full bg-[#0a0a0a] text-white pl-10 pr-4 py-2.5 rounded-lg border border-[#2a2a2a] focus:border-[#0078D7] focus:outline-none transition-colors placeholder-[#6a6a6a]"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto max-h-[45vh] p-2">
          {searchedUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0a0a0a] flex items-center justify-center">
                <IoSearch className="text-2xl text-[#6a6a6a]" />
              </div>
              <p className="text-[#8a8a8a]">No users found</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {searchedUsers.map((u) => {
                const isSelected = selectedUsers.includes(u._id);
                const avatarColor = getAvatarColor(u.fullname);
                return (
                  <li
                    key={u._id}
                    onClick={() => toggleUserSelection(u._id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${isSelected
                        ? "bg-[#0078D7]/20 border border-[#0078D7]/50"
                        : "hover:bg-[#2a2a2a] border border-transparent"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: avatarColor.bg,
                        }}
                      >
                        <span
                          className="text-sm font-semibold"
                          style={{ color: avatarColor.text }}
                        >
                          {getFirstLetter(u.fullname)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{u.fullname}</p>
                        <p className="text-xs text-[#8a8a8a]">@{u.username}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                          ? "bg-[#0078D7] border-[#0078D7]"
                          : "border-[#4a4a4a] hover:border-[#0078D7]"
                        }`}
                    >
                      {isSelected && <FaCheck className="text-white text-xs" />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a2a] bg-[#0a0a0a]">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-[#2a2a2a] text-white py-2.5 rounded-lg hover:bg-[#3a3a3a] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedUsers.length === 0}
              className={`flex-1 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${selectedUsers.length > 0
                  ? "bg-[#0078D7] text-white hover:bg-[#006abc]"
                  : "bg-[#2a2a2a] text-[#6a6a6a] cursor-not-allowed"
                }`}
            >
              <BsCheckLg className="text-lg" />
              Add ({selectedUsers.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;