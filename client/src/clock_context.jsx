import { createContext, useEffect, useState } from "react";
import {useSelector, useDispatch} from "react-redux";
import { random_event } from "./dragon_events.jsx";
import {setDragon} from "./auth_token_store/dragon_slice.js";

export const TimeContext = createContext();

export function TimeProvider({ children }) {
  const { is_logged_in, access_token } = useSelector((state) => state.authTokenSlice);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const dispatch = useDispatch();

  useEffect(() => {
    if (!is_logged_in) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());

      // if (Math.random() < 0.1) run_random_event('hungry');
      // if (Math.random() < 0.1) run_random_event('bored');
      // if (Math.random() < 0.1) run_random_event('lonely');
      // if (Math.random() < 0.1) run_random_event('dirty');
    }, 35000);

    return () => clearInterval(interval);
  }, [is_logged_in]);

  const run_random_event = async (action) => {

    try {
      const dragon_data = await random_event(access_token, action);
      dispatch(setDragon({dragon: dragon_data}));

    } catch (err) {
      console.error(err);
    }

  }

  return (
    <TimeContext.Provider value={currentTime}>
      {children}
    </TimeContext.Provider>
  );
}