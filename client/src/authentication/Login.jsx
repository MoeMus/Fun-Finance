import {useEffect, useState} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";
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
    const db = getFirestore();
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user) {
                // ✅ Update last_login_date in Firestore
                const userRef = doc(db, "users", user.uid);

                await updateDoc(userRef, {
                    last_login_date: serverTimestamp()
                });

                // ✅ Get Firebase ID token
                const token = await user.getIdToken();

                dispatch(setAuthToken({
                    access_token: token
                }));
            }

        } catch (err) {
            setLoginError(err.message);
        }
    };

    return (

      <div className="dv-page dragon-vault-signup-page">

        <header className="dv-header">
          <h1 className="dv-title">Dragon vault</h1>
        </header>

        <main className="dv-hero dragon-main-container-with-scales">
          <div className="dv-card">
            <form className="dv-form" onSubmit={submitCredentials}>
              <div className="header-text">
                <h1>Welcome Back</h1>
                <p>Sign in to view your financial outlook</p>
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  className="dv-input"
                  id="email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  className="dv-input"
                  id="password"
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="login-actions">
                <button className="login-button" type="submit">
                  Sign In
                </button>
              </div>

              <div className="login-links">
                <button className="link-button" type="button" onClick={() => navigate('/signup')}>Create an account
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    )

}

export default LoginPage;