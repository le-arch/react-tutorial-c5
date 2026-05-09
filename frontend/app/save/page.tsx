"use client";
import { saveTransaction } from "@/api/create-transaction";
import Button from "@/components/Button";
import Navbar from "@/components/navbar";
import { CreateTransactionPayload } from "@/types/interfaces";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

function SavePage() {
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSave = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		
		const trimmedAmount = amount.trim();
		if (!trimmedAmount || parseFloat(trimmedAmount) <= 0) {
			toast.error("Please enter a valid amount greater than 0");
			return;
		}

		setLoading(true);

		const payload: CreateTransactionPayload = {
			amount: trimmedAmount,
			reason: reason.trim(),
			type: "saving",
		};

		console.log("Saving:", payload);
		const res = await saveTransaction(payload);

		if (res.success) {
			toast.success("Savings added successfully! Redirecting...");
			setAmount("");
			setReason("");
			setTimeout(() => {
				router.push("/");
				router.refresh();
			}, 1500);
		} else {
			toast.error(res.error || "Failed to save money!");
		}
		
		setLoading(false);
	};

	return (
		<div className="flex flex-col flex-1 min-h-screen bg-slate-50 dark:bg-slate-900">
			<Navbar />
			<main className="flex flex-1 items-center justify-center px-6 py-10">
				<div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
					<h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
						Make a Saving
					</h1>
					<form onSubmit={handleSave} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Amount (CFA)
							</label>
							<input
								type="number"
								step="0.01"
								min="0.01"
								className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 disabled:opacity-50"
								placeholder="e.g. 5000.00"
								value={amount}
								onChange={(v) => setAmount(v.target.value)}
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
								placeholder="e.g. Salary"
								value={reason}
								onChange={(v) => setReason(v.target.value)}
								disabled={loading}
							/>
						</div>
						<div className="pt-2">
							<Button 
								text={loading ? "Saving..." : "Save Money"} 
								onClick={handleSave} 
								disabled={loading}
							/>
						</div>
					</form>
				</div>
			</main>
			<ToastContainer />
		</div>
	);
}

export default SavePage;