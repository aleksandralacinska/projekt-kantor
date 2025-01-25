import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]); // Lista użytkowników
  const [currentUser, setCurrentUser] = useState(null); // Aktualny zalogowany użytkownik

  const addUser = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  return (
    <UserContext.Provider value={{ users, addUser, currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};
