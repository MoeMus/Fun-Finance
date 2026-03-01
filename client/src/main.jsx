import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import redux_store from "./redux_store.js";
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={redux_store}>
      <App />
    </Provider>
  </StrictMode>,
)
