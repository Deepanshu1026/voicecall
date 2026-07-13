import { createContext, useContext } from 'react';

const CallContext = createContext(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within CallProvider');
  return context;
};

export const CallProvider = ({ children, value }) => {
  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export default CallContext;
