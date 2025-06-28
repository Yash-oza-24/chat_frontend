import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signin } from "../API/api";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaSkype } from "react-icons/fa";

const Signin = () => {
  const navigate = useNavigate();

  let usernameRef = useRef();
  let passwordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let username = usernameRef.current.value;
    let password = passwordRef.current.value;
    console.log(username, password);
    if (!username || !password) {
      toast.error("All fields are required  ");
      return;
    } else {
      await signin({
        username,
        password,
      });
      // dispatch(loginUser({username,password}))
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0078d7] to-[#00bcf2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                <FaSkype className="text-4xl text-[#0078d7]" />
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
              <p className="text-white/80 mt-2">Sign in to continue</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-white/60" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  ref={usernameRef}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
                  placeholder="Username"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-white/60" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  ref={passwordRef}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
                  placeholder="Password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-[#0078d7] py-3 rounded-lg font-semibold hover:bg-white/90 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg"
              >
                Sign In
              </button>

              <div className="text-center">
                <p className="text-white/80">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-white font-semibold hover:text-white/90 transition-colors duration-300"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
