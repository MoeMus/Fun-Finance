import PredictiveDashboard from './components/PredictiveDashboard';
import DragonDashboard from './components/DragonDashboard';
import './App.css';
import { Route, Routes } from "react-router-dom";
import LoginPage from "./authentication/Login.jsx";
import SignupPage from "./authentication/Signup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useSelector } from 'react-redux'
import DragonCreationPage from "./components/DragonCreation.jsx";
function App() {

  let { is_logged_in } = useSelector((state) => state.authTokenSlice)

  return (
    <div className="app-main">
      <Routes>
        <Route path={"/"} element={ <ProtectedRoute protected_component={ <DragonDashboard /> } isLoggedIn={is_logged_in} /> } />
        <Route path={"/calendar"} element={ <ProtectedRoute protected_component={ <PredictiveDashboard /> } isLoggedIn={is_logged_in} /> } />
        <Route path={"/login"} element={ <LoginPage /> } />
        <Route path={"/signup"} element={ <SignupPage /> } />
        <Route path={"/dragon-create"} element={<ProtectedRoute protected_component={ <DragonCreationPage /> } isLoggedIn={is_logged_in} /> } />
      </Routes>
    </div>
  );
}

export default App;
