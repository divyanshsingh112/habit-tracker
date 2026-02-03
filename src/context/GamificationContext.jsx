import React, { createContext, useContext } from 'react';
import { useGamification } from '../hooks/useGamification';

const GamificationContext = createContext();

export const GamificationProvider = ({ children, user, showToast, apiURL }) => {
  const gamificationLogic = useGamification(user, showToast, apiURL);

  return (
    <GamificationContext.Provider value={gamificationLogic}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGameContext = () => useContext(GamificationContext);