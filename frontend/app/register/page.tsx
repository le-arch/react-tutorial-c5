/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const BASEURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate inputs
		if (!name.trim()) {
			toast.error("Name is required");
			return;
		}

		if (!email.trim()) {
			toast.error("Email is required");
			return;
		}

		if (password.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setLoading(true);

		try {
			const response = await axios.post(`${BASEURL}/api/v1/auth/register`, {
				email,
				password,
				name,
			});

			// Store token and user data
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.user));

			toast.success("Registration successful! Redirecting...");
			setTimeout(() => {
				router.push("/");
			}, 1500);
		} catch (error: any) {
			const errorMessage = error.response?.data?.error || "Registration failed";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col flex-1 min-h-screen bg-slate-50 dark:bg-slate-900">
			<main className="flex flex-1 items-center justify-center px-6 py-10">
				<div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
					<h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
						Create an account
					</h1>
					<p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
						Start tracking your finances with Piggy
					</p>
					<form onSubmit={handleRegister} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Name
							</label>
							<input
								type="text"
								className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
								placeholder="John Doe"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Email
							</label>
							<input
								type="email"
								className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Password
							</label>
							<input
								type="password"
								className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
								placeholder="Create a password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={6}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Confirm Password
							</label>
							<input
								type="password"
								className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								minLength={6}
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Creating account..." : "Register"}
						</button>
					</form>
					<p className="mt-4 text-sm text-center text-slate-600 dark:text-slate-400">
						Already have an account?{" "}
						<Link
							href="/login"
							className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
						>
							Login
						</Link>
					</p>
				</div>
			</main>
			<ToastContainer />
		</div>
	);
}

export default RegisterPage;