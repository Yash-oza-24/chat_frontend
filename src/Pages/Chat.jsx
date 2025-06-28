import React, { useEffect } from "react";
import { Outlet } from "react-router";
import socket from "../Config/socket";
const Chat = () => {
  useEffect(() => {   
    socket.on("connect", () => {
      console.log("Connected to the server");
    });
    return () => {
      socket.on("disconnect", () => {
        console.log("Disconnected from the server");
      });
    };
  }, []);
  return (
    <>
      <Outlet />
    </>
  );
};

export default Chat;
