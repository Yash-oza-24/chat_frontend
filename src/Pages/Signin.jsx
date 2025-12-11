import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signin } from "../API/api";
import { toast } from "react-toastify";
import { FaUser, FaLock } from "react-icons/fa";
import { HiOutlineChat } from "react-icons/hi";
import { IoEye, IoEyeOff } from "react-icons/io5";

const Signin = () => {
  const navigate = useNavigate();
  const usernameRef = useRef();
  const passwordRef = useRef();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    if (!username || !password) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await signin({ username, password });
      navigate("/");
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#0078D7]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0078D7]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* Logo & Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-[#0078D7] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#0078D7]/20">
                <HiOutlineChat className="text-4xl text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
              <p className="text-[#8a8a8a] mt-2 text-sm">
                Sign in to continue to your account
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
                    placeholder="Enter your username"
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
                    className="w-full pl-11 pr-12 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder-[#6a6a6a] focus:outline-none focus:border-[#0078D7] focus:ring-1 focus:ring-[#0078D7] transition-all duration-200"
                    placeholder="Enter your password"
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
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-[#0078D7] hover:text-[#00bcf2] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0078D7] text-white py-3.5 rounded-xl font-semibold hover:bg-[#006abc] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0078D7] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2a2a2a]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1a1a1a] text-[#6a6a6a]">
                    New to Chat?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center w-full py-3 border border-[#2a2a2a] rounded-xl text-white font-medium hover:bg-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200"
                >
                  Create an account
                </Link>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-[#0a0a0a] border-t border-[#2a2a2a]">
            <p className="text-center text-[#6a6a6a] text-xs">
              By signing in, you agree to our{" "}
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

export default Signin;