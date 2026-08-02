import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.scss";
import { apiUrl } from "../config/api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === "profileImage" ? files[0] : value,
    });
  };

  const [passwordMatch, setPasswordMatch] = useState(true);

  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword ||
        formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    if (!formData.profileImage) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(formData.profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [formData.profileImage]);

  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const register_form = new FormData();
      register_form.append("firstName", formData.firstName);
      register_form.append("lastName", formData.lastName);
      register_form.append("email", formData.email);
      register_form.append("password", formData.password);
      if (formData.profileImage) {
        register_form.append("profileImage", formData.profileImage);
      }

      const response = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        body: register_form,
      });

      if (response.ok) {
        navigate("/login", { state: { registered: true } });
      } else {
        const errBody = await response.json().catch(() => ({}));
        setError(errBody.message || "Registration failed.");
      }
    } catch (err) {
      console.log("Registration failed", err.message);
      setError(
        "Cannot reach the API server. Deploy the backend and set REACT_APP_API_URL."
      );
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        <form className="register_content_form" onSubmit={handleSubmit}>
          <input
            placeholder="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            required
          />
          <input
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
            required
          />

          {!passwordMatch && (
            <p style={{ color: "red" }}>Passwords are not matched!</p>
          )}
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

          <input
            id="image"
            type="file"
            name="profileImage"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <label htmlFor="image">
            <img src="/assets/addImage.png" alt="Add profile" />
            <p>Upload Your Photo (optional)</p>
          </label>

          {previewUrl && (
            <img
              src={previewUrl}
              alt="Profile preview"
              style={{ maxWidth: "80px" }}
            />
          )}
          <button type="submit" disabled={!passwordMatch}>
            REGISTER
          </button>
        </form>
        <Link to="/login">Already have an account? Log In Here</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
