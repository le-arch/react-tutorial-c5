/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllTransactions } from "@/api/get-transactions";
import { getToken } from "@/utils/auth";
import { GetTransactionsParamsType, TransactionType } from "@/types/interfaces";
import { useEffect, useState } from "react";

export const useGetTransactions = (query: GetTransactionsParamsType) => {
	const [transactions, setTransactions] = useState<TransactionType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTransactions = async () => {
		try {
			setLoading(true);
			setError(null);
			
			const token = getToken();
			if (!token) {
				setError("Not authenticated");
				setLoading(false);
				return;
			}
			
			const res = await getAllTransactions();
			
			if (res.error) {
				setError(res.error);
				setTransactions([]);
			} else {
				// Filter by type if specified
				let filteredTransactions = res.transactions || [];
				
				if (query.type && (query.type === "saving" || query.type === "withdrawal")) {
					filteredTransactions = filteredTransactions.filter(
						t => t.type === query.type
					);
				}
				
				// Limit by size if specified
				if (query.size && query.size > 0) {
					filteredTransactions = filteredTransactions.slice(0, query.size);
				}
				
				setTransactions(filteredTransactions);
				console.log("Transactions loaded:", filteredTransactions.length);
			}
		} catch (err: any) {
			console.error("Failed to fetch transactions:", err);
			setError(err.message || "Failed to load transactions");
			setTransactions([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, [query.size, query.type]);

	return { transactions, loading, error, refreshTransactions: fetchTransactions };
};