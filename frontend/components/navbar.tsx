"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { isAuthenticated, logout, getUser } from "@/utils/auth";

function Navbar() {
	const [authenticated, setAuthenticated] = useState(false);
	const [userName, setUserName] = useState("");
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();

	// Check authentication status
	const checkAuth = useCallback(() => {
		const authStatus = isAuthenticated();
		setAuthenticated(authStatus);
		if (authStatus) {
			const user = getUser();
			if (user) {
				setUserName(user.name || user.email || "User");
			}
		} else {
			setUserName("");
		}
	}, []);

	useEffect(() => {
		checkAuth();
		
		// Listen for storage changes (in case of multiple tabs)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === "token" || e.key === "user") {
				checkAuth();
			}
		};
		
		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [checkAuth]);

	// Close mobile menu on route change
	useEffect(() => {
		setIsMenuOpen(false);
	}, [pathname]);

	const handleLogout = () => {
		if (window.confirm("Are you sure you want to logout?")) {
			logout();
		}
	};

	// Helper to check if link is active
	const isActiveLink = (path: string) => {
		return pathname === path || pathname?.startsWith(path + "?");
	};

	return (
		<header className="w-full border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50">
			<div className="max-w-3xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
				{/* Logo */}
				<Link
					href="/"
					className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-2"
				>
					<span className="text-2xl sm:text-3xl">🐷</span>
					<span className="hidden sm:inline">Piggy</span>
				</Link>

				{/* Mobile menu button */}
				<button
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
					aria-label="Toggle menu"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						{isMenuOpen ? (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						) : (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						)}
					</svg>
				</button>

				{/* Desktop Navigation */}
				<nav className="hidden sm:flex items-center gap-6">
					{authenticated && (
						<ul className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
							<li>
								<Link
									href="/transactions?type=saving"
									className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
										pathname === "/transactions" 
											? "text-blue-600 dark:text-blue-400" 
											: ""
									}`}
								>
									Savings
								</Link>
							</li>
							<li>
								<Link
									href="/transactions?type=withdrawal"
									className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
										pathname === "/transactions" 
											? "text-blue-600 dark:text-blue-400" 
											: ""
									}`}
								>
									Withdrawals
								</Link>
							</li>
							<li>
								<Link
									href="/transactions"
									className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
										isActiveLink("/transactions") 
											? "text-blue-600 dark:text-blue-400" 
											: ""
									}`}
								>
									All Transactions
								</Link>
							</li>
						</ul>
					)}
					
					<div className="flex items-center gap-4 text-sm font-medium">
						{authenticated ? (
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
										<span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
											{userName.charAt(0).toUpperCase()}
										</span>
									</div>
									<span className="text-slate-700 dark:text-slate-300 hidden md:inline">
										{userName}
									</span>
								</div>
								<button
									onClick={handleLogout}
									className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
								>
									Logout
								</button>
							</div>
						) : (
							<div className="flex items-center gap-3">
								<Link
									href="/login"
									className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors px-2 py-1"
								>
									Login
								</Link>
								<Link
									href="/register"
									className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md"
								>
									Register
								</Link>
							</div>
						)}
					</div>
				</nav>
			</div>

			{/* Mobile Navigation */}
			{isMenuOpen && (
				<div className="sm:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
					<nav className="px-4 py-3 space-y-2">
						{authenticated ? (
							<>
								<div className="flex items-center gap-3 px-2 py-2 mb-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
									<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
										<span className="text-blue-600 dark:text-blue-400 font-semibold">
											{userName.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<p className="text-sm font-medium text-slate-700 dark:text-slate-300">
											{userName}
										</p>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											Logged in
										</p>
									</div>
								</div>
								
								<Link
									href="/"
									className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
								>
									🏠 Home
								</Link>
								<Link
									href="/transactions?type=saving"
									className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
								>
									📊 View Savings
								</Link>
								<Link
									href="/transactions?type=withdrawal"
									className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
								>
									📊 View Withdrawals
								</Link>
								<Link
									href="/transactions"
									className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
								>
									📋 All Transactions
								</Link>
								
								<div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
									<button
										onClick={handleLogout}
										className="block w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
									>
										🚪 Logout
									</button>
								</div>
							</>
						) : (
							<>
								<Link
									href="/login"
									className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
								>
									Login
								</Link>
								<Link
									href="/register"
									className="block px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center font-medium"
								>
									Create Account
								</Link>
							</>
						)}
					</nav>
				</div>
			)}
		</header>
	);
}

export default Navbar;