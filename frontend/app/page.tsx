"use client";
import StatsCard from "@/components/Card";
import Navbar from "@/components/navbar";
import TransactionsList from "@/components/TransactionsList";
import Button from "@/components/Button";
import { useGetTransactions } from "@/hooks/useFetchTransactions";
import { useFetchAccountInfo } from "@/hooks/useFetchAccountInfo";
import { useEffect } from "react";

export default function Home() {
	const { transactions, loading: transactionsLoading, refreshTransactions } = useGetTransactions({ size: 5 });
	const { accountInfo, loading: accountLoading } = useFetchAccountInfo();

	// Refresh transactions when account info changes
	useEffect(() => {
		if (accountInfo) {
			refreshTransactions();
		}
	}, [accountInfo]);

	// Format balance to always show 2 decimal places with thousands separator
	const formatBalance = (balance: number): string => {
		if (balance === null || balance === undefined) return "0.00";
		return balance.toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	console.log("Home - Account Info:", accountInfo);
	console.log("Home - Transactions:", transactions);

	return (
		<>
			<div className="flex flex-col flex-1 min-h-screen bg-slate-50 dark:bg-slate-900">
				<Navbar />
				<main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
					<section className="flex gap-4">
						<StatsCard 
							title="Current Balance" 
							text={accountInfo 
								? `${formatBalance(accountInfo.balance)} CFA` 
								: accountLoading 
									? "Loading..." 
									: "0.00 CFA"
							} 
						/>
						<StatsCard
							title="Account Status"
							text={accountInfo ? "Active" : accountLoading ? "Loading..." : "Not logged in"}
						/>
					</section>
					<section className="flex gap-3">
						<Button
							text="Add Savings"
							onClick={() => {
								window.location.href = "/save";
							}}
						/>
						<Button
							text="Make Withdrawal"
							variant="secondary"
							onClick={() => {
								window.location.href = "/withdraw";
							}}
						/>
					</section>
					<section>
						<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">
							Recent Transactions
						</h2>
						{transactionsLoading ? (
							<div className="text-center py-4">Loading transactions...</div>
						) : (
							<TransactionsList transactions={transactions} />
						)}
					</section>
				</main>
			</div>
		</>
	);
}