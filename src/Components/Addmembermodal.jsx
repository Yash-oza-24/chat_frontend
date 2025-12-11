import React, { useEffect, useState } from "react";
import { getAllUser } from "../API/api";
import { addMember } from "../API/api";
import { IoSearch } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import { FaUserPlus } from "react-icons/fa";
import { BsCheckLg } from "react-icons/bs";

const AddMemberModal = ({ show, handleClose, user }) => {
  const [allUser, setAllUser] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  // console.log(user);

  const getFirstLetter = (groupName) => {
    const words = groupName?.split(" ");
    const firstLetter = words?.map((word) => word[0]?.toUpperCase());
    return firstLetter?.join("");
  };

  const getAllUsers = async () => {
    const response = await getAllUser();
    // Exclude users already in the group
    const groupMemberIds = user.members.map((member) => member._id);
    const filteredUsers = response.users.filter((u) => !groupMemberIds.includes(u._id));
    setAllUser(filteredUsers);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    const groupMemberIds = user.members.map((member) => member._id);
    const searchedUsers = allUser.filter((user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !groupMemberIds.includes(user._id)
    );
    setSearchedUsers(searchedUsers);
  };
  
  const handleAddMember = async () => {
    const selectedMembers = document.querySelectorAll("li.selected");
    const memberIds = Array.from(selectedMembers).map(
      (member) => member.dataset.id
    );
    const groupId = user._id;
    if (memberIds.length > 0) {
      try {
        await addMember(groupId, memberIds);
        toast.success("Member added successfully");
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
    handleClose();
  };
  useEffect(() => {
    getAllUsers();
  }, [user]);

  useEffect(() => {
    // Show all users (filtered) by default when modal opens
    setSearchedUsers(allUser);
  }, [allUser]);

  return (
    <div
      className={`${
        show ? "block" : "hidden"
      } fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50`}
    >
      <div className="bg-[#232323] rounded-xl w-[90%] md:w-[500px] max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#838383]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0078D7] to-[#00bcf2] flex items-center justify-center shadow-lg">
              <FaUserPlus className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Add Members</h2>
              <p className="text-sm text-[#838383]">Select members to add to the group</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-[#00bcf2] transition-colors"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 mb-3">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search users..."
              className="w-full bg-[#1a1a1a] text-white pl-10 pr-4 py-2 rounded-lg border border-[#838383] focus:border-[#00bcf2] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="px-4 pb-4 overflow-y-auto max-h-[50vh]">
          {searchedUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <IoSearch className="text-2xl text-[#838383]" />
              </div>
              <p className="text-[#838383]">No users are here</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {searchedUsers.map((user) => (
                <li
                  key={user._id}
                  data-id={user._id}
                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd199] to-[#ffb366] flex justify-center items-center shadow-md">
                      <span className="text-lg font-bold text-[#c06607]">
                        {getFirstLetter(user.fullname)}
                      </span>
                    </div>
                    <div>
                      <span className="text-white block font-medium">{user.fullname}</span>
                      <span className="text-sm text-[#838383]">@{user.username}</span>
                    </div>
                  </div>
                  <button
                    className="w-8 h-8 rounded-full border border-[#838383] flex items-center justify-center text-[#838383] group-hover:border-[#00bcf2] group-hover:text-[#00bcf2] transition-colors"
                    onClick={() => {
                      const userElement = document.querySelector(
                        `li[data-id="${user._id}"]`
                      );
                      const plusIcon = userElement.querySelector("button");
                      if (plusIcon.textContent === "+") {
                        plusIcon.textContent = "-";
                        userElement.classList.add("selected");
                      } else {
                        plusIcon.textContent = "+";
                        userElement.classList.remove("selected");
                      }
                    }}
                  >
                    +
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#838383]">
          <div className="flex gap-3">
            <button
              className="flex-1 bg-[#1a1a1a] text-white py-2 rounded-lg hover:bg-[#232323] transition-colors"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-[#0078D7] to-[#00bcf2] text-white py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
              onClick={handleSubmit}
            >
              <BsCheckLg className="text-lg" />
              Add Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
