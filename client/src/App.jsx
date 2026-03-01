import PredictiveDashboard from './components/PredictiveDashboard';
import './App.css';
import { Route, Routes } from "react-router";
import LoginPage from "./authentication/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useSelector } from 'react-redux'

function App() {

  let { is_logged_in } = useSelector((state) => state.authTokenSlice)

  return (
    <div className="app-main">
      <Routes>
        <Route path={"/"} element={ <ProtectedRoute protected_component={ <PredictiveDashboard /> } isLoggedIn={is_logged_in} /> } />
        <Route path={"/login"} element={ <LoginPage /> } />
      </Routes>
    </div>
  );
}

export default App;
