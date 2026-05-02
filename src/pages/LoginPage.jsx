import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { apiFetch } from "../services/api";

const initialState = {
  email: "",
  password: ""
};

export default function LoginPage({ onLogin, onSwitch }) {

  const [formData, setFormData] = useState(initialState);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      console.log("Login response:", response);

      localStorage.setItem("token", response.token);

      // handle both response formats
      const userData = response.user || response;

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(userData)
      );

      alert("Login successful");

      onLogin(userData);

    } catch (error) {

      alert(error.message);

    }
  };

  return (
    <AuthForm
      title="Login"
      description="Access your dashboard to manage loans, requests, and payments."
      fields={[
        { name: "email", label: "Email", type: "email", required: true, placeholder: "Enter your email" },
        { name: "password", label: "Password", type: "password", required: true, placeholder: "Enter your password" }
      ]}
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Login"
      footer={
        <>
          Don't have an account?{" "}
          <button type="button" className="link-btn" onClick={onSwitch}>
            Register here
          </button>
        </>
      }
    />
  );
}