import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [contact, setContact] = useState("");
    const [gender, setGender] = useState("");
    const [address, setAddress] = useState("");
    const [dob, setDob] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        const response = await fetch("http://localhost:5000/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password, firstname, lastname, contact, gender, address, dob, role: "user" }),
        });

        if (response.ok) {
            navigate("/signin");
        } else {
            const data = await response.json();
            alert(data.message);
        }
    };

    return (
        <div className="flex justify-center items-center bg-[url('/public/image.png')] bg-cover min-h-screen bg-center pt-12 pb-12">

        <div className="w-[50rem] p-10 px-14 space-y-3 rounded-xl bg-gray-50 text-gray-800">
            <div className="mb-8 text-center">
                <h1 className="my-3 text-4xl font-bold">Sign Up</h1>
                <p className="text-sm dark:text-gray-600">
                    Sign up to access your account
                </p>
            </div>
            <form noValidate="" className="space-y-10" onSubmit={e => e.preventDefault()}>
                <div className="space-y-3 grid gap-10 grid-cols-2">
                    <div>
                        <label htmlFor="username" className="block mt-3 mb-2 text-sm">
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
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="firstname" className="text-sm">
                                Enter First Name
                            </label>
                        </div>
                        <input
                            type="firstname"
                            name="firstname"
                            id="firstname"
                            placeholder="Leroy"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800"
                            value={firstname}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="lastname" className="text-sm">
                                Enter Last Name
                            </label>
                        </div>
                        <input
                            type="lastname"
                            name="lastname"
                            id="lastname"
                            placeholder="Jenkins"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800"
                            value={lastname}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="contact" className="text-sm">
                                Enter Contact
                            </label>
                        </div>
                        <input
                            type="contact"
                            name="contact"
                            id="contact"
                            placeholder="1234567890"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="gender" className="text-sm">
                                Enter Gender
                            </label>
                        </div>
                        <input
                            type="gender"
                            name="gender"
                            id="gender"
                            placeholder="M"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="address" className="text-sm">
                                Enter Address
                            </label>
                        </div>
                        <input
                            type="address"
                            name="address"
                            id="address"
                            placeholder="89 Rai Street"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="dob" className="text-sm">
                                Enter Date of Birth
                            </label>
                        </div>
                        <input
                            type="dob"
                            name="dob"
                            id="dob"
                            placeholder="01-01-2001"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-300 dark:bg-gray-50 dark:text-gray-800"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <div>
                        <button
                            type="button"
                            className="block w-full p-3 text-center rounded-sm text-gray-50 bg-green-600"
                            onClick={handleSignup}
                        >
                            Sign Up
                        </button>
                    </div>
                    <p className="px-6 text-sm text-center dark:text-gray-600">
                        Already have an account?{" "}
                        <Link
                            rel="noopener noreferrer"
                            to="/"
                            className="hover:underline text-green-700"
                        >
                            Log in
                        </Link>
                        .
                    </p>
                </div>
            </form>
        </div>
        </div>
    );
};

export default SignUp;
