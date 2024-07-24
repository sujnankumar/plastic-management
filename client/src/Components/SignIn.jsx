import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axios"; // Import Axios

const SignIn = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(""); // Error state
    const navigate = useNavigate();

    const handleSignin = async () => {
        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        setLoading(true);
        setError("");
        
        try {
            const response = await axios.post("/api/signin", { // Corrected URL
                username,
                password
            });
            
            if (response.status === 200) {
                localStorage.setItem("access_token", response.data.access_token);
                navigate("/profile");
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error("Error during sign-in:", error);
            setError("An error occurred during sign-in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-[url('/public/image.png')] bg-cover h-screen bg-center -mt-8">
            <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-gray-50 text-gray-800">
                <h1 className="my-3 text-4xl font-bold text-center">Login</h1>
                <form noValidate className="space-y-6" onSubmit={e => e.preventDefault()}>
                    <div className="space-y-1 text-sm">
                        <label htmlFor="username" className="block text-gray-600">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="Username"
                            className="w-full border px-4 py-3 rounded-md border-gray-300 bg-gray-50 text-gray-800 focus:border-violet-600"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1 text-sm">
                        <label htmlFor="password" className="block text-gray-600">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Password"
                            className="w-full px-4 py-3 border rounded-md border-gray-300 bg-gray-50 text-gray-800 focus:border-violet-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="flex justify-end text-xs text-gray-600">
                            <a rel="noopener noreferrer" href="#">
                                Forgot Password?
                            </a>
                        </div>
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <button
                        className="block w-full p-3 text-center rounded-sm text-gray-50 bg-green-600"
                        onClick={handleSignin}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
                <div className="flex items-center pt-4 space-x-1">
                    <div className="flex-1 h-px sm:w-16 bg-gray-300"></div>
                    <p className="px-3 text-sm text-gray-600">
                        Login with social accounts
                    </p>
                    <div className="flex-1 h-px sm:w-16 bg-gray-300"></div>
                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        aria-label="Log in with Google"
                        className="p-3 rounded-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            className="w-5 h-5 fill-current"
                        >
                            <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
                        </svg>
                    </button>
                    <button
                        aria-label="Log in with Twitter"
                        className="p-3 rounded-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            className="w-5 h-5 fill-current"
                        >
                            <path d="M31.937 6.093c-1.177 0.516-2.437 0.871-3.765 1.032 1.355-0.813 2.391-2.099 2.885-3.631-1.271 0.74-2.677 1.276-4.172 1.579-1.192-1.276-2.896-2.079-4.787-2.079-3.625 0-6.563 2.937-6.563 6.557 0 0.521 0.063 1.021 0.172 1.495-5.453-0.255-10.287-2.875-13.52-6.833-0.568 0.964-0.891 2.084-0.891 3.303 0 2.281 1.161 4.281 2.916 5.457-1.073-0.031-2.083-0.328-2.968-0.817v0.079c0 3.181 2.26 5.833 5.26 6.437-0.547 0.145-1.131 0.229-1.724 0.229-0.421 0-0.823-0.041-1.224-0.115 0.844 2.604 3.26 4.5 6.14 4.557-2.239 1.755-5.077 2.801-8.135 2.801-0.521 0-1.041-0.025-1.563-0.088 2.917 1.86 6.36 2.948 10.079 2.948 12.067 0 18.661-9.995 18.661-18.651 0-0.276 0-0.557-0.021-0.839 1.287-0.917 2.401-2.079 3.281-3.396z"></path>
                        </svg>
                    </button>
                    <button
                        aria-label="Log in with GitHub"
                        className="p-3 rounded-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            className="w-5 h-5 fill-current"
                        >
                            <path d="M16 0.396c-8.837 0-16 7.164-16 16 0 7.068 4.584 13.066 10.937 15.185 0.797 0.148 1.092-0.348 1.092-0.771 0-0.38-0.014-1.387-0.022-2.722-4.451 0.965-5.389-2.146-5.389-2.146-0.724-1.84-1.769-2.33-1.769-2.33-1.448-0.989 0.11-0.969 0.11-0.969 1.602 0.113 2.444 1.646 2.444 1.646 1.424 2.438 3.737 1.734 4.646 1.326 0.144-1.031 0.556-1.734 1.014-2.134-3.555-0.405-7.289-1.777-7.289-7.907 0-1.747 0.623-3.176 1.646-4.295-0.165-0.404-0.714-2.034 0.156-4.239 0 0 1.343-0.43 4.4 1.64 1.276-0.355 2.646-0.533 4.006-0.54 1.36 0.008 2.73 0.185 4.006 0.54 3.057-2.07 4.4-1.64 4.4-1.64 0.87 2.205 0.321 3.835 0.156 4.239 1.023 1.119 1.646 2.548 1.646 4.295 0 6.146-3.74 7.497-7.305 7.892 0.57 0.495 1.08 1.472 1.08 2.968 0 2.144-0.02 3.873-0.02 4.401 0 0.427 0.288 0.927 1.1 0.769 6.348-2.121 10.924-8.119 10.924-15.185 0-8.836-7.164-16-16-16z"></path>
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-center sm:px-6 text-gray-600">
                    Don't have an account?
                    <Link
                        rel="noopener noreferrer"
                        to="/signup"
                        className="underline text-gray-800"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
