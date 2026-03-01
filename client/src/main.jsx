import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import redux_store from "./redux_store";
import {BrowserRouter} from "react-router-dom";
import { TimeProvider } from "./clock_context.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={redux_store}>
      <BrowserRouter>
        <TimeProvider>
          <App />
        </TimeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)