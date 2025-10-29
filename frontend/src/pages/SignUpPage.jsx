import { motion } from "framer-motion";
import { Loader, Lock, Mail, User, User2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter.jsx";
import Input from "../components/Input.jsx";
import FloatingShapes from "../components/FloatingShapes.jsx";
import axios from "axios";
import api from "../lib/api.js";

const SignUpPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();


    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!name.trim() || !username.trim() || !email.trim() || !password) {
            setError("Please fill out all fields.");
            return;
        }


        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/register',
                { name, username, email, password },
                { withCredentials: true }
            );
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Signup failed");
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
                role="region"
                aria-labelledby="create-account-heading"
            >
                <div className='p-8'>
                    <h2 id="create-account-heading" className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text'>
                        Create Account
                    </h2>

                    <form onSubmit={handleSignUp}>
                        <Input
                            icon={User}
                            type='text'
                            placeholder='Full Name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            icon={User2}
                            type='text'
                            placeholder='Username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Input
                            icon={Mail}
                            type='email'
                            placeholder='Email Address'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            icon={Lock}
                            type='password'
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p role="alert" className='text-red-500 font-semibold mt-2'>{error}</p>}
                        <PasswordStrengthMeter password={password} />

                        <motion.button
                            className='mt-5 w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white 
                        font-bold rounded-lg shadow-lg hover:from-emerald-600
                        hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                         focus:ring-offset-gray-900 transition duration-200 flex items-center justify-center'
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            type='submit'
                            disabled={isLoading}
                        >
                            <span>{isLoading ? "Creating..." : "Sign Up"}</span>
                            {isLoading && <Loader className='animate-spin ml-2' size={18} />}
                        </motion.button>
                    </form>
                </div>
                <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
                    <p className='text-sm text-gray-400'>
                        Already have an account?{" "}
                        <Link to={"/login"} className='text-emerald-400 hover:underline'>
                            Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>

    );
};
export default SignUpPage;