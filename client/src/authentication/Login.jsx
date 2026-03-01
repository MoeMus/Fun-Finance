import {useEffect, useState} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import "./LoginStyles.css"
import { useSelector, useDispatch } from 'react-redux'
import { setAuthToken } from "../auth_token_store/auth_token_slice.js";
import {useLocation, useNavigate} from "react-router-dom";

function LoginPage() {

    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [login_error, setLoginError] = useState('');
    const dispatch = useDispatch();
    const { is_logged_in } = useSelector((state) => state.authTokenSlice);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (is_logged_in) {

            // Get route redirected from
            const from = location.state?.from || "/";

            navigate(from, { replace: true });

        }
    }, [is_logged_in, navigate, location]);

    const submitCredentials = async (e) => {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, email, password);

            const user = auth.currentUser;

            if (user) {
                const token = await user.getIdToken();

                const state_change = {
                    access_token: token
                };

                dispatch(setAuthToken(state_change));

            }

        } catch (err) {
            setLoginError(e);
        }
    }

    return (

        <div className="login-container">
          <header className="login-header">
            <div className="header-text">
              <h1>Welcome Back</h1>
              <p className="subtitle">Sign in to view your financial outlook</p>
            </div>
          </header>

          <section className="login-card">
            <form className="login-form" onSubmit={submitCredentials}>
              <div className="form-row">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  className="form-input"
                  id="email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={(e)=>setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  className="form-input"
                  id="password"
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  onChange={(e)=>setPassword(e.target.value)}
                />
              </div>

              <div className="login-actions">
                <button className="login-button" type="submit">
                  Sign In
                </button>
              </div>

              <div className="login-links">
                <button className="link-button" type="button" onClick={()=>navigate('/signup')}>Create an account</button>
              </div>
            </form>
          </section>

          <div className="tamagotchi-teaser">
            <p>🐾 Your Finance-agotchi will feel <strong>calmer</strong> once you sign in.</p>
          </div>
        </div>
  )

}

export default LoginPage;