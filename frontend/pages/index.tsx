import { useState } from "react";
import { useRouter } from "next/router";
import API from "../utils/api";
import Layout from "../components/Layout";
import { toast } from "react-toastify";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("SENDING =>", { email, password });

    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      toast.success("Login successful");
      router.push("/dashboard");
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";

      if (status === 404) {
        toast.error(message);
        setTimeout(() => router.push("/register"), 1500);
        return;
      }

      if (status === 401) {
        toast.error(message);
        return;
      }

      toast.error(message);
    }
  };

  return (
    <Layout>
      <h1 className="title">Login</h1>

      <form onSubmit={handleSubmit} className="form">
        {/* Email Input - UPDATED */}
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

        <button type="submit" className="login-btn">
          Login
        </button>

        <p className="register-text">
          Don&apos;t have an account?{" "}
          <a href="/register" className="register-link">
            Register
          </a>
        </p>
      </form>
    </Layout>
  );
}
