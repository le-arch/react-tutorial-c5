"use client";
import TransactionsList from "@/components/TransactionsList";
import Navbar from "@/components/navbar";
import { useGetTransactions } from "@/hooks/useFetchTransactions";
import { GetTransactionsParamsType } from "@/types/interfaces";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

// Separate component that uses useSearchParams
function TransactionsContent() {
	const query = useSearchParams();
	const type = query.get("type");
	
	// Validate type parameter
	const validType = (type === "saving" || type === "withdrawal") ? type : undefined;
	
	const { transactions, loading, error } = useGetTransactions({
		type: validType,
		size: undefined,
	} as GetTransactionsParamsType);

	console.log("Transactions data:", { transactions, loading, error });

	// Get page title based on filter
	const getPageTitle = () => {
		if (type === "saving") return "All Savings";
		if (type === "withdrawal") return "All Withdrawals";
		return "All Transactions";
	};

	// Get empty state message based on filter
	const getEmptyMessage = () => {
		if (type === "saving") return "No savings found.";
		if (type === "withdrawal") return "No withdrawals found.";
		return "No transactions found.";
	};

	// Loading state
	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-pulse flex flex-col items-center gap-4">
					<div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
					<div className="h-32 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="text-center py-8">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
					<p className="text-red-600 dark:text-red-400 font-medium">Error loading transactions</p>
					<p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
					{getPageTitle()}
				</h1>
				{type && (
					<a 
						href="/transactions" 
						className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
					>
						View All
					</a>
				)}
			</div>
			
			{transactions && transactions.length > 0 ? (
				<TransactionsList transactions={transactions} />
			) : (
				<div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
					<svg 
						className="mx-auto h-12 w-12 text-slate-400" 
						fill="none" 
						viewBox="0 0 24 24" 
						stroke="currentColor"
					>
						<path 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							strokeWidth={2} 
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
						/>
					</svg>
					<p className="mt-4 text-lg font-medium">{getEmptyMessage()}</p>
					<p className="mt-2 text-sm">
						{type 
							? "Try viewing all transactions or make a new transaction." 
							: "Start by making a saving or withdrawal."
						}
					</p>
				</div>
			)}
		</>
	);
}

// Loading fallback component
function TransactionsLoading() {
	return (
		<div className="text-center py-12">
			<div className="animate-pulse flex flex-col items-center gap-4">
				<div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
				<div className="w-full space-y-3">
					{[1, 2, 3].map((i) => (
						<div 
							key={i} 
							className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-lg"
						></div>
					))}
				</div>
			</div>
		</div>
	);
}

// Error boundary component
class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean; error: Error | null }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="text-center py-12">
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
						<h2 className="text-red-600 dark:text-red-400 font-semibold">Something went wrong</h2>
						<p className="text-red-500 dark:text-red-300 text-sm mt-2">
							{this.state.error?.message || "An unexpected error occurred"}
						</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
						>
							Reload Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Main page component
function TransactionsPage() {
	return (
		<div className="flex flex-col flex-1 min-h-screen bg-slate-50 dark:bg-slate-900">
			<Navbar />
			<main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
				<ErrorBoundary>
					<Suspense fallback={<TransactionsLoading />}>
						<TransactionsContent />
					</Suspense>
				</ErrorBoundary>
			</main>
		</div>
	);
}

export default TransactionsPage;