import { createContext, useEffect, useState } from "react";
import {useSelector} from "react-redux";


export const TimeContext = createContext();

export function TimeProvider({ children }) {
  const { is_logged_in } = useSelector((state) => state.authTokenSlice);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!is_logged_in) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [is_logged_in]);

  return (
    <TimeContext.Provider value={currentTime}>
      {children}
    </TimeContext.Provider>
  );
}