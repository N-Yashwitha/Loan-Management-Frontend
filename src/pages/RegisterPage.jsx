import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { apiFetch } from "../services/api";

const initialState = {
  name: "",
  email: "",
  password: "",
  role: "BORROWER"
};

export default function RegisterPage({ onRegistered, onSwitch }) {
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
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      alert("Registration successful. You can now log in.");
      onRegistered();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <AuthForm
      title="Register"
      description="Create your Loaniverse account and choose the role that matches your workflow."
      fields={[
        { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter your full name" },
        { name: "email", label: "Email", type: "email", required: true, placeholder: "Enter your email" },
        { name: "password", label: "Password", type: "password", required: true, placeholder: "Create a password" },
        { name: "role", label: "Role", type: "select", required: true, options: ["ADMIN", "LENDER", "BORROWER", "ANALYST"] }
      ]}
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Register"
      footer={
        <>
          Already have an account?{" "}
          <button type="button" className="link-btn" onClick={onSwitch}>
            Login here
          </button>
        </>
      }
    />
  );
}
