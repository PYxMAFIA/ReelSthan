import { motion } from "framer-motion";
import { Loader, Lock, Mail, User, User2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter.jsx";
import Input from "../components/Input.jsx";
import api from "../lib/api.js";
import toast from "react-hot-toast";

const SignUpPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();


    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!name.trim() || !username.trim() || !email.trim() || !password) {
            toast.error("Please fill out all fields.");
            return;
        }


        setIsLoading(true);

        try {
            const response = await api.post('/auth/register',
                { name, username, email, password },
                { withCredentials: true }
            );
            toast.success("Account created successfully!");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Signup failed");
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
                role="region"
                aria-labelledby="create-account-heading"
            >
                <div className='p-8'>
                    <h2 id="create-account-heading" className='text-3xl font-bold mb-6 text-center text-white'>
                        Create Account
                    </h2>

                    <form onSubmit={handleSignUp} className="space-y-4">
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

                        <PasswordStrengthMeter password={password} />

                        <motion.button
                            className='mt-5 w-full py-3 px-4 bg-emerald-600 text-white 
                        font-bold rounded-lg shadow-lg hover:bg-emerald-500
                        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
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
                <div className='px-8 py-4 bg-gray-900/50 border-t border-gray-700 flex justify-center'>
                    <p className='text-sm text-gray-400'>
                        Already have an account?{" "}
                        <Link to={"/login"} className='text-emerald-400 hover:text-emerald-300 font-medium'>
                            Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>

    );
};
export default SignUpPage;