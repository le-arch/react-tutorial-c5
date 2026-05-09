"use client";
import { saveTransaction } from "@/api/create-transaction";
import Button from "@/components/Button";
import Navbar from "@/components/navbar";
import { CreateTransactionPayload } from "@/types/interfaces";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

function WithdrawPage() {
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleWithdraw = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		
		console.log("Withdrawal initiated!");
		
		// Validate amount
		const trimmedAmount = amount.trim();
		if (!trimmedAmount) {
			toast.error("Please enter an amount");
			return;
		}

		const amountNum = parseFloat(trimmedAmount);
		if (isNaN(amountNum) || amountNum <= 0) {
			toast.error("Please enter a valid amount greater than 0");
			return;
		}

		setLoading(true);

		const payload: CreateTransactionPayload = {
			amount: trimmedAmount,
			reason: reason.trim(),
			type: "withdrawal",
		};

		console.log("Sending withdrawal payload:", payload);

		try {
			const res = await saveTransaction(payload);
			
			if (res.success) {
				toast.success("Withdrawal successful! Redirecting...");
				setAmount("");
				setReason("");
				setTimeout(() => {
					router.push("/");
				}, 1500);
			} else {
				toast.error(res.error || "Failed to withdraw money!");
			}
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleAmountChange = (value: string) => {
		// Only allow numbers and one decimal point with max 2 decimal places
		const regex = /^\d*\.?\d{0,2}$/;
		if (value === "" || regex.test(value)) {
			setAmount(value);
		}
	};

	return (
		<div className="flex flex-col flex-1 min-h-screen bg-slate-50 dark:bg-slate-900">
			<Navbar />
			<main className="flex flex-1 items-center justify-center px-6 py-10">
				<div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
					<h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
						Make a Withdrawal
					</h1>
					<form onSubmit={handleWithdraw} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Amount (CFA)
							</label>
							<input
								type="text"
								inputMode="decimal"
								className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 disabled:opacity-50"
								placeholder="e.g. 1000.00"
								value={amount}
								onChange={(v) => handleAmountChange(v.target.value)}
								disabled={loading}
								required
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Reason (Optional)
							</label>
							<input
								type="text"
								className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 disabled:opacity-50"
								placeholder="e.g. Groceries"
								value={reason}
								onChange={(v) => setReason(v.target.value)}
								disabled={loading}
								maxLength={255}
							/>
						</div>
						<div className="pt-2">
							<Button 
								text={loading ? "Withdrawing..." : "Withdraw Money"} 
								onClick={handleWithdraw} 
								disabled={loading || !amount.trim()}
							/>
						</div>
					</form>
				</div>
			</main>
			<ToastContainer />
		</div>
	);
}

export default WithdrawPage;