import React, { useContext, useState, useEffect } from 'react';
import assets from '../assets/assets';
import { AuthContext } from "../../AuthContext";

function Login() {
    const [currentState, setCurrentState] = useState("Sign up");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [isDataSubmitted, setIsDataSubmitted] = useState(false);

    const { login } = useContext(AuthContext);

    const onSubmitHandler = (event) => {
        event.preventDefault();

        // Check if the current state is "Sign up"
        if (currentState === "Sign up" && !isDataSubmitted) {
            setIsDataSubmitted(true); // Allow the bio input to be shown
            return;
        }

        // Handle the login/signup logic
        login(currentState === "Sign up" ? "signup" : "login", { fullName, email, password, bio });

        // Reset the form after submission
        setFullName("");
        setEmail("");
        setPassword("");
        setBio("");
        setIsDataSubmitted(false);
    };

    // Optional: Clear form fields when switching between Sign up and Login
    useEffect(() => {
        if (currentState === "Login") {
            setFullName(""); // Clear Full Name field when switching to login
            setBio(""); // Clear Bio field if switching to Login
        }
    }, [currentState]);

    return (
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
            <img src={assets.logo_big} alt="Logo" className='w-[min(30vw,250px)]' />
            <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
                <h2 className='font-medium text-2xl flex justify-between items-center'>
                    {currentState}
                    {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="Back" className='w-5 cursor-pointer' />}
                </h2>

                {/* Sign up form fields */}
                {currentState === "Sign up" && !isDataSubmitted && (
                    <input onChange={(e) => setFullName(e.target.value)} value={fullName} type="text" placeholder='Full Name' required
                        className='p-2 border border-gray-500 rounded-md focus:outline-none bg-transparent text-white placeholder-gray-300' />
                )}

                <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required
                    className='p-2 border border-gray-500 rounded-md focus:outline-none bg-transparent text-white placeholder-gray-300' />

                <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder='Password' required
                    className='p-2 border border-gray-500 rounded-md focus:outline-none bg-transparent text-white placeholder-gray-300' />

                {/* Bio section visible only for Sign up and after data submission */}
                {currentState === 'Sign up' && isDataSubmitted && (
                    <textarea rows={4} onChange={(e) => setBio(e.target.value)} value={bio}
                        className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 text-white focus:ring-indigo-500' placeholder='Add Bio'></textarea>
                )}

                <button type="submit" className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
                    {currentState === "Sign up" ? "Sign Up" : "Login"}
                </button>

                {/* "Click here to Login" functionality inside the same div */}
                <p className="text-center text-white">
                    {currentState === "Sign up" 
                        ? "Already have an account? "
                        : "Don't have an account? "}
                    <span 
                        onClick={() => setCurrentState(currentState === "Sign up" ? "Login" : "Sign up")} 
                        className="cursor-pointer text-purple-400 ml-2"
                    >
                        {currentState === "Sign up" ? "Login here" : "Sign up here"}
                    </span>
                </p>
            </form>
        </div>
    );
}

export default Login;
