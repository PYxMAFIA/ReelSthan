import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, User2 } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // basic validation
      if (!identifier || !password) {
        toast.error("Email/Username and password are required", {
          duration: 3000,
        });
        return;
      }

      const response = await api.post('/auth/login', {
        email: identifier,
        username: identifier,
        password
      }, {
        withCredentials: true,
        skipGlobalError: true // Handle errors locally
      });

      toast.success(response.data.message || "Login successful!", {
        duration: 3000,
        icon: '✅',
      });
      navigate('/');
    } catch (error) {
      console.error("Login error", error);
      
      // Enhanced error handling
      if (error.response?.status === 401 || error.response?.status === 400) {
        toast.error(error?.response?.data?.message || "Invalid email/username or password", {
          duration: 4000,
        });
      } else if (error.response?.status === 429) {
        toast.error("Too many login attempts. Please wait a moment and try again.", {
          duration: 5000,
        });
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error("Login request timed out. Please check your connection and try again.", {
          duration: 4000,
        });
      } else {
        toast.error(error?.response?.data?.message || "Login failed. Please try again.", {
          duration: 4000,
        });
      }
      
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden p-6'>

      {/* Subtle background effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-md w-full bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden z-10'
      >
        <div className='p-8'>
          <h2 className='text-3xl font-bold mb-6 text-center text-white'>
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              icon={Mail}
              type='text'
              placeholder='Email or Username'
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <Input
              icon={Lock}
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className='flex items-center justify-end mb-6'>
              <Link to='/forgot-password' className='text-sm text-emerald-400 hover:text-emerald-300 transition-colors'>
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='w-full py-3 px-4 bg-emerald-600 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? (
                <span className='inline-flex items-center justify-center gap-2'>
                  <Loader className='w-5 h-5 animate-spin' />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </motion.button>
          </form>
        </div>
        <div className='px-8 py-4 bg-gray-900/50 border-t border-gray-700 flex justify-center'>
          <p className='text-sm text-gray-400'>
            Don't have an account?{" "}
            <Link to='/signup' className='text-emerald-400 hover:text-emerald-300 font-medium'>
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginPage;