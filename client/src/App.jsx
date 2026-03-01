import PredictiveDashboard from './components/PredictiveDashboard';
import './App.css';
import { Route, Routes } from "react-router";
import LoginPage from "./authentication/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <div className="app-main">
      <Routes>
        <Route path={"/"} element={ <ProtectedRoute protected_component={ <PredictiveDashboard /> } isLoggedIn={false} /> } />
        <Route path={"/login"} element={ <LoginPage /> } />
      </Routes>
    </div>
  );
}

export default App;
