import { useState } from "react";
import { useRouter } from "next/router";
import API from "../utils/api";
import Layout from "../components/Layout";
import { toast } from "react-toastify";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { name, email, password });
      toast.success("Registered successfully");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Layout>
      <h1 className="title">Register</h1>
      <form onSubmit={handleSubmit} className="form">
        {/* Name Input */}
        <input
          type="text"
          placeholder="Name"
          className="auth-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "18px 35px",
            fontSize: "17px",
            borderRadius: "15px",
            width: "100%",
            boxSizing: "border-box",
          }}
        />

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "18px 35px",
            fontSize: "17px",
            borderRadius: "15px",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "18px 35px",
            fontSize: "17px",
            borderRadius: "15px",
            width: "100%",
            boxSizing: "border-box",
          }}
        />

        {/* Submit Button */}
        <button type="submit" className="register-btn">
          Register
        </button>

        <p className="auth-text">
          Already have an account?{" "}
          <a href="/" className="auth-link">
            Login
          </a>
        </p>
      </form>
    </Layout>
  );
}
