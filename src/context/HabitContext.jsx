import React, { createContext, useContext } from 'react';
import { useHabits } from '../hooks/useHabits'; // We reuse your existing hook!

const HabitContext = createContext();

export const HabitProvider = ({ children, user, apiURL }) => {
  // We use the existing hook logic here
  const habitLogic = useHabits(user, apiURL);

  return (
    <HabitContext.Provider value={habitLogic}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabitContext = () => useContext(HabitContext);