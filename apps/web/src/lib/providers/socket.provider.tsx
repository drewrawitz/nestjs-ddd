"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useCurrentUserQuery } from "../features/auth/auth.hooks";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: user } = useCurrentUserQuery();

  useEffect(() => {
    if (user?.id) {
      const newSocket = io("http://localhost:3000");
      setSocket(newSocket);

      newSocket.emit("joinRoom", user.id);

      return () => {
        newSocket.emit("leaveRoom", user.id);
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
