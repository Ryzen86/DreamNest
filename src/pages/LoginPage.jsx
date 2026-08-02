import React, { useState } from "react";
import "../styles/Login.scss";
import { setLogin } from "../redux/state";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { apiUrl } from "../config/api";

const isSafeReturnPath = (path) =>
  typeof path === "string" && path.startsWith("/") && !path.startsWith("//");

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from;
  const pendingBooking = location.state?.booking;
  const justRegistered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        setError(
          errBody.message || "Login failed. Check your email and password."
        );
        return;
      }

      const loggedIn = await response.json();

      if (loggedIn?.user) {
        dispatch(
          setLogin({
            user: loggedIn.user,
            token: loggedIn.token,
          })
        );

        if (returnTo === "/payment" && pendingBooking) {
          try {
            sessionStorage.setItem(
              "dreamnest_booking_draft",
              JSON.stringify(pendingBooking)
            );
          } catch {
            /* ignore */
          }
          navigate("/payment", { state: { booking: pendingBooking } });
        } else if (isSafeReturnPath(returnTo)) {
          navigate(returnTo);
        } else {
          navigate("/");
        }
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      console.log("Login failed", err.message);
      setError(
        "Cannot reach the API server. Set REACT_APP_API_URL or run the API locally on port 3002."
      );
    }
  };

  return (
    <div className="login">
      <div className="login_content">
        <form className="login_content_form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {justRegistered && (
            <p className="login_success">Account created! Log in to continue.</p>
          )}
          {error && <p className="login_error">{error}</p>}
          <button type="submit">LOG IN</button>
        </form>
        <Link to="/register">Don&apos;t have an account? Sign Up Here</Link>
      </div>
    </div>
  );
};

export default LoginPage;
