import { TransactionType } from "@/types/interfaces";
import React from "react";

function Transaction({ amount, type, reason, createdAt }: TransactionType) {
	const isSaving = type === "saving";
	
	// Format the amount string to always show 2 decimal places
	const formatAmount = (amountStr: string): string => {
		const num = parseFloat(amountStr);
		if (isNaN(num)) return "0.00";
		return num.toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};
	
	const formatDate = (dateStr: string): string => {
		try {
			return new Date(dateStr).toLocaleDateString();
		} catch {
			return dateStr || "N/A";
		}
	};
	
	return (
		<tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
			<td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
				{formatAmount(amount)} CFA
			</td>
			<td className="py-3 px-4">
				<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
					isSaving
						? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
						: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
				}`}>
					{isSaving ? "↑ Saving" : "↓ Withdrawal"}
				</span>
			</td>
			<td className="py-3 px-4 text-slate-600 dark:text-slate-400">
				{reason || "No reason"}
			</td>
			<td className="py-3 px-4 text-slate-500 dark:text-slate-500 text-sm">
				{formatDate(createdAt)}
			</td>
		</tr>
	);
}

export default Transaction;