import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        const response = await fetch("http://localhost:5000/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password, role: "user" }),
        });

        if (response.ok) {
            navigate("/signin");
        } else {
            const data = await response.json();
            alert(data.message);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-gray-50 text-gray-800">
            <div className="mb-8 text-center">
                <h1 className="my-3 text-4xl font-bold">Sign Up</h1>
                <p className="text-sm dark:text-gray-600">
                    Sign up to access your account
                </p>
            </div>
            <form noValidate="" className="space-y-10" onSubmit={e => e.preventDefault()}>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="username" className="block mb-2 text-sm">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="leroyjenkins"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm">
                            Email address
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="leroy@jenkins.com"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="password" className="text-sm">
                                Create Password
                            </label>
                        </div>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="*****"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <div>
                        <button
                            type="button"
                            className="block w-full p-3 text-center rounded-sm text-gray-50 bg-[#2b654f]"
                            onClick={handleSignup}
                        >
                            Sign Up
                        </button>
                    </div>
                    <p className="px-6 text-sm text-center dark:text-gray-600">
                        Already have an account?{" "}
                        <Link
                            rel="noopener noreferrer"
                            to="/signin"
                            className="hover:underline dark:text-violet-600"
                        >
                            Log in
                        </Link>
                        .
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SignUp;
