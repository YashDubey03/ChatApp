import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket, axios } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // Get all users for sidebar

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
    }
  };

  // Get messages of selected user

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);

      if (data.success) {
        setMessages(data.messages);

        // reset unseen count for selected user
        setUnseenMessages((prev) => ({
          ...prev,
          [userId]: 0,
        }));
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch messages");
    }
  };

  //   Send message
  const sendMessage = async (messageData) => {
    if (!selectedUser) return;

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    }
  };
  //   new code
  //   const sendMessage = async (messageData) => {
  //     if (!selectedUser) return;

  //     try {
  //       const { data } = await axios.post(
  //         `/api/messages/send/${selectedUser._id}`,
  //         messageData
  //       );

  //       if (data.success && data.newMessage) {
  //         const safeMessage = {
  //           ...data.newMessage,
  //           senderId: data.newMessage.senderId || data.newMessage.sender?._id,
  //         };

  //         if (!safeMessage.senderId) return;

  //         setMessages((prev) => [...prev, safeMessage]);
  //       }
  //     } catch (error) {
  //       toast.error(error.message || "Failed to send message");
  //     }
  //   };

  // Subscribe to socket messages

  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      // If chat with sender is open
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;

        setMessages((prev) => [...prev, newMessage]);

        // mark as seen in backend
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        // increase unseen count
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // Unsubscribe from socket

  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
    }
  };

  // Socket lifecycle

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  // Context value

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,

    getUsers,
    getMessages,
    sendMessage,

    setMessages,
    setSelectedUser,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
