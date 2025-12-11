import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../API/api";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaUserCircle, FaCheck } from "react-icons/fa";
import { HiOutlineChat } from "react-icons/hi";
import { IoEye, IoEyeOff } from "react-icons/io5";

const Signup = () => {
  const navigate = useNavigate();
  const usernameRef = useRef();
  const fnameRef = useRef();
  const passwordRef = useRef();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = usernameRef.current.value;
    const fullname = fnameRef.current.value;
    const passwordValue = passwordRef.current.value;

    if (!username || !fullname || !passwordValue) {
      toast.error("All fields are required");
      return;
    }

    if (passwordValue.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signup({ username, fullname, password: passwordValue });
      toast.success("Account created successfully!");
      navigate("/signin");
    } catch (error) {
      toast.error("Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* Logo & Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-[#0078D7] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#0078D7]/20">
                <HiOutlineChat className="text-4xl text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-[#8a8a8a] mt-2 text-sm">
                Join us and start chatting today
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm text-[#8a8a8a] block"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-[#6a6a6a]" size={14} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    ref={usernameRef}
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-[#6a6a6a] focus:outline-none focus:border-[#0078D7] focus:ring-1 focus:ring-[#0078D7] transition-all duration-200"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="fullname"
                  className="text-sm text-[#8a8a8a] block"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUserCircle className="text-[#6a6a6a]" size={14} />
                  </div>
                  <input
                    type="text"
                    name="fullname"
                    id="fullname"
                    ref={fnameRef}
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-[#6a6a6a] focus:outline-none focus:border-[#0078D7] focus:ring-1 focus:ring-[#0078D7] transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm text-[#8a8a8a] block"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-[#6a6a6a]" size={14} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    ref={passwordRef}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-[#6a6a6a] focus:outline-none focus:border-[#0078D7] focus:ring-1 focus:ring-[#0078D7] transition-all duration-200"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6a6a6a] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <IoEyeOff size={18} />
                    ) : (
                      <IoEye size={18} />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {/* Strength Bar */}
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${passwordStrength >= level
                              ? passwordStrength === 1
                                ? "bg-red-500"
                                : passwordStrength === 2
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              : "bg-[#2a2a2a]"
                            }`}
                        ></div>
                      ))}
                    </div>

                    {/* Strength Text */}
                    <p
                      className={`text-xs ${passwordStrength === 1
                          ? "text-red-400"
                          : passwordStrength === 2
                            ? "text-yellow-400"
                            : passwordStrength === 3
                              ? "text-green-400"
                              : "text-[#6a6a6a]"
                        }`}
                    >
                      {passwordStrength === 1
                        ? "Weak password"
                        : passwordStrength === 2
                          ? "Medium password"
                          : passwordStrength === 3
                            ? "Strong password"
                            : ""}
                    </p>

                    {/* Requirements */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.length
                              ? "bg-green-500/20 text-green-400"
                              : "bg-[#2a2a2a] text-[#6a6a6a]"
                            }`}
                        >
                          <FaCheck size={8} />
                        </div>
                        <span
                          className={`text-xs ${passwordChecks.length
                              ? "text-green-400"
                              : "text-[#6a6a6a]"
                            }`}
                        >
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.hasLetter
                              ? "bg-green-500/20 text-green-400"
                              : "bg-[#2a2a2a] text-[#6a6a6a]"
                            }`}
                        >
                          <FaCheck size={8} />
                        </div>
                        <span
                          className={`text-xs ${passwordChecks.hasLetter
                              ? "text-green-400"
                              : "text-[#6a6a6a]"
                            }`}
                        >
                          Contains a letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.hasNumber
                              ? "bg-green-500/20 text-green-400"
                              : "bg-[#2a2a2a] text-[#6a6a6a]"
                            }`}
                        >
                          <FaCheck size={8} />
                        </div>
                        <span
                          className={`text-xs ${passwordChecks.hasNumber
                              ? "text-green-400"
                              : "text-[#6a6a6a]"
                            }`}
                        >
                          Contains a number
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0078D7] text-white py-3.5 rounded-xl font-semibold hover:bg-[#006abc] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0078D7] flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2a2a2a]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1a1a1a] text-[#6a6a6a]">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center w-full py-3 border border-[#2a2a2a] rounded-xl text-white font-medium hover:bg-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200"
                >
                  Sign in instead
                </Link>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-[#0a0a0a] border-t border-[#2a2a2a]">
            <p className="text-center text-[#6a6a6a] text-xs">
              By creating an account, you agree to our{" "}
              <button className="text-[#0078D7] hover:underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-[#0078D7] hover:underline">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;