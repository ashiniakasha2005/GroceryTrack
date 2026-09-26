import { useState } from "react";
import { useNavigate } from "react-router-dom";
import groceryTrackLogo from "../assets/grocerytrack-logo3.jpeg";
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    if (email.trim() === "") {
      setEmailError("Email or username is required");
    }

    if (password.trim() === "") {
      setPasswordError("Password is required");
    }

    if (email.trim() === "" || password.trim() === "") {
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "Admin" || data.user.role === "Staff") {
        navigate("/dashboard");
      }

    } catch (error) {
      setLoginError("Unable to connect to the server. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-sans">
  <div className="w-full max-w-[380px]">

   
    <div className="flex flex-col items-center mb-3">
      <img
        src={groceryTrackLogo}
        alt="GroceryTrack Logo"
        className="w-[56px] h-[56px] rounded-[10px] object-cover shadow-md mb-3"
      />

     <h1 className="text-[20px] font-extrabold text-[#212529] tracking-[-0.3px]">
        GroceryTrack
      </h1>

      <p className="text-[11px] text-[#8a8f98] mt-1">
        Store Management System
      </p>
    </div>

    
    <div className="bg-white rounded-[10px] px-[22px] py-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

      <h2 className="text-[16px] font-semibold text-[#212529] mb-1">
        Sign in to your account
      </h2>

      <p className="text-[12px] text-gray-400 mb-5">
        Enter your credentials to continue
      </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-[12px] font-semibold text-[#495057] mb-2"
            >
              Email or Username
            </label>

            <input
              id="email"
              type="text"
              placeholder="Enter your email or username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
              }}
              className={`w-full px-3 py-2 text-[13px] bg-white border rounded-[6px] outline-none ${emailError
                ? "border-[#dc3545] focus:border-[#dc3545]"
                : "border-[#dee2e6] focus:border-[#0d6efd]"
                }`}
            />

            {emailError && (
              <p className="text-red-600 text-[12px] mt-1">
                {emailError}
              </p>
            )}

          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[12px] font-semibold text-[#495057] mb-2"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
              }}
              className={`w-full px-3 py-2 text-[13px] bg-white border rounded-[6px] outline-none ${passwordError
                ? "border-[#dc3545] focus:border-[#dc3545]"
                : "border-[#dee2e6] focus:border-[#0d6efd]"
                }`}
            />

            {passwordError && (
              <p className="text-red-600 text-[12px] mt-1">
                {passwordError}
              </p>
            )}

          </div>

          {loginError && (
            <p className="text-[#dc3545] text-[12px] text-center">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-[13px] px-5 py-2 rounded-[6px] cursor-pointer"
          >
            Log In
          </button>

        </form>

</div>

</div>

</div>
);
}

export default Login;
