import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, User2 } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import FloatingShapes from "../components/FloatingShapes";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      // basic validation: require password and either email or username
      if ((!email && !username) || !password) {
        setError("Email or username and password are required");
        return;
      }

      const response = await api.post('/auth/login', {
        email,
        username,
        password
      }, {
        withCredentials: true
      });
      console.log(response.data.message, response.status, response);
      navigate('/');
    } catch (error) {
      console.error("Login error", error);
      const msg = error?.response?.data?.message || "Invalid email/username or password";
      setError(msg);
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 flex items-center justify-center relative overflow-hidden p-6'>
      <FloatingShapes color="bg-emerald-500" size="w-64 h-64" top="-5%" left="10%" delay={0} />
      <FloatingShapes color="bg-emerald-500" size="w-48 h-48" top="70%" left="80%" delay={5} />
      <FloatingShapes color="bg-emerald-400" size="w-32 h-32" top="40%" left="-10%" delay={2} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
      >
        <div className='p-8'>
          <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text'>
            Welcome Back
          </h2>

          <form onSubmit={handleLogin}>
            <Input
              icon={Mail}
              type='email'
              placeholder='Email Address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              icon={User2}
              type='text'
              placeholder='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              icon={Lock}
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
            />

            <div className='flex items-center mb-6'>
              <Link to='/forgot-password' className='text-sm text-emerald-400 hover:underline'>
                Forgot password?
              </Link>
            </div>
            {error && (
              <p role="alert" className='text-red-500 font-semibold mb-4'>
                {error}
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
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
        <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
          <p className='text-sm text-gray-400'>
            Don't have an account?{" "}
            <Link to='/signup' className='text-emerald-400 hover:underline'>
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginPage;