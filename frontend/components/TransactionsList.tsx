"use client";
import React from "react";
import Transaction from "./Transaction";
import { TransactionType } from "@/types/interfaces";

export interface TransactionsListProps {
	transactions: TransactionType[];
}

function TransactionsList({ transactions }: TransactionsListProps) {
	if (!transactions || transactions.length === 0) {
		return (
			<div className="w-full text-center py-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
				No transactions to display.
			</div>
		);
	}

	return (
		<div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
			<table className="w-full text-sm">
				<thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
					<tr>
						<th className="py-3 px-4 text-left font-semibold">Amount</th>
						<th className="py-3 px-4 text-left font-semibold">Type</th>
						<th className="py-3 px-4 text-left font-semibold">Reason</th>
						<th className="py-3 px-4 text-left font-semibold">Date</th>
					</tr>
				</thead>
				<tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-700">
					{transactions.map((trnx, index) => (
						<Transaction key={trnx.id || index} {...trnx} />
					))}
				</tbody>
			</table>
		</div>
	);
}

export default TransactionsList;