/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const BASEURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await axios.post(`${BASEURL}/api/v1/auth/login`, {
				email,
				password,  // Fixed: was sending as 'name' due to model mismatch
			});

			// Store token and user data
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.user));

			toast.success("Login successful! Redirecting...");
			setTimeout(() => {
				router.push("/");
			}, 1500);
		} catch (error: any) {
			toast.error(error.response?.data?.error || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col flex-1 min-h-screen bg-slate-50 dark:bg-slate-900">
			<main className="flex flex-1 items-center justify-center px-6 py-10">
				<div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
					<h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
						Welcome back
					</h1>
					<p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
						Login to your Piggy account
					</p>
					<form onSubmit={handleLogin} className="flex flex-col gap-4">
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
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Logging in..." : "Login"}
						</button>
					</form>
					<p className="mt-4 text-sm text-center text-slate-600 dark:text-slate-400">
						Don&apos;t have an account?{" "}
						<Link
							href="/register"
							className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
						>
							Register
						</Link>
					</p>
				</div>
			</main>
			<ToastContainer />
		</div>
	);
}

export default LoginPage;