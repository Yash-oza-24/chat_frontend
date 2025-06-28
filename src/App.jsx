import React from "react";
import io from "socket.io-client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Signin from "./Pages/Signin";
import Signup from "./Pages/Signup";
import { ToastContainer } from "react-toastify";
import Chat from "./Pages/Chat";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("Token");
  const user = localStorage.getItem("User");
  
  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          >
            <Route index element={<Sidebar />} />
          </Route>
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />  
    </>
  );
};

export default App;
