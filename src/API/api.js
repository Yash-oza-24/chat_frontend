import axios from "axios";
import { toast } from "react-toastify";
const BASE_URL = "https://chat-backend-vydt.onrender.com/api";
// const BASE_URL = "http://localhost:5000/api";

import { config } from "../Config/config";
const signup = async ({ username, fullname, password }) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/register`, {
      username,
      fullname,
      password,
    });
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    toast.error(error.response.data.message);
    throw error;
  }
};
const signin = async ({ username, password }) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      username,
      password,
    });
    localStorage.setItem("User", JSON.stringify(response.data.user));
    localStorage.setItem("Token", response.data.token);
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error logging in user :", error);
    toast.error(error.response.data.message);
    throw error;
  }
};
const getUserbyUsername = async ({ username }) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${username}`);
    return response.data;
  } catch {
    console.error("Error fetching user by username");
  }
};

const getAllUser = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users`);
    return response.data;
  } catch {
    console.error("Error fetching user");
  }
};
const createGroup = async (user) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/group/createGroup`,
      {
        groupName: `${user.fullname}`,
        members: [user._id],
        isGroup: true,
      },
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error creating user", error);
  }
};

const createGroups = async (groupData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/group/createGroups`,
      {
        groupName: groupData.groupName,
        members: groupData.members,
      },
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error creating user", error);
  }
};
const getGroupbyUser = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/group/getGroupsByUser`,
      config
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching group by user", err);
  }
};
const getMessages = async (groupId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/messages/getMessages/${groupId}`
    );
    return response.data;
  } catch {
    console.error("Error fetching messages");
  }
};
const addMember = async (groupId, members) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/group/addMembersinGroup/${groupId}`,
      {
        members,
      },
      config
    );
    return response.data;
  } catch {
    console.error("Error adding member to group");
  }
};
const deleteMessage = async (messageId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/messages/deleteMessage/${messageId}`, config);
    return response.data;
  } catch {
    console.error("Error deleting message");
  }
};

const uploadFile = async (formData, groupId) => {
  try {
    const response = await axios.post(`${BASE_URL}/messages/uploadFile/${groupId}`, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        return percentCompleted;
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

const deleteGroup = async (groupId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/group/deleteGroup/${groupId}`, config);
    return response.data;
  }
  catch {
    console.error("Error deleting group");
  }
}

export {
  signup,
  signin,
  getUserbyUsername,
  getAllUser,
  createGroup,
  createGroups,
  getGroupbyUser,
  getMessages,
  addMember,
  deleteMessage,
  uploadFile,
  deleteGroup
};
