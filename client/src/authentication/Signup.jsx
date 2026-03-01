import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import { setAuthToken } from "../auth_token_store/auth_token_slice.js";
import { useNavigate } from "react-router-dom";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebase.js";
import './SignupStyles.css'

function SignupPage() {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState()
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { is_logged_in } = useSelector((state) => state.authTokenSlice);
  useEffect(() => {
    if (is_logged_in) {
      navigate('/create-dragon', { replace: true });
    }
  }, [is_logged_in, navigate, location]);

  const submitCredentials = async (e) => {
    e.preventDefault();

    try {

      if (confirmPassword !== password) {
        setError('Passwords must match');
        return;
      }

      const signup_request = {
        'username': username,
        'email': email,
        'password': password
      };

      const response = await fetch('http://127.0.0.1:5000/auth/register', {
        method: "POST",
         headers: {
            "Content-Type": "application/json"
         },
        body: JSON.stringify(signup_request)
      });

      if (!response.ok) {
        const error_msg = await response.json();

        throw new Error(error_msg.error);
      }

      const data = await response.json();
      const temporary_token = data.temporary_auth_token;

      // Sign in using the temporary token
      const cred = await signInWithCustomToken(auth, temporary_token);

    // Get the actual token (use as Bearer token)
    const access_token = await cred.user.getIdToken();

    dispatch(setAuthToken({access_token: access_token}));

    } catch (err) {
      setError(err);
    }

  }

  return (
    <>
      <div className="dv-page dragon-vault-signup-page">
      <header className="dv-header">
        <h1 className="dv-title">Dragon vault</h1>
      </header>

        <main className="dv-hero dragon-main-container-with-scales">
          <div className="dv-card">
            <h2 className="dv-card-title">Sign Up</h2>

            <form className="dv-form" onSubmit={submitCredentials}>

              <input
                className="dv-input"
                type="text"
                autoComplete="username"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                className="dv-input"
                type="email"
                autoComplete="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="dv-input"
                type="password"
                autoComplete="new-password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                className="dv-input"
                type="password"
                autoComplete="new-password"
                placeholder="confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {error ? <p className="dv-error">{error}</p> : null}

              <button className="dv-button" type="submit">
                Register
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default SignupPage;