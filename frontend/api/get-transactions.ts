/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionType } from "@/types/interfaces";
import { api } from "@/utils/auth";

export interface GetTransactionsRes {
	transactions: TransactionType[];
	error: string | null;
}

export const getAllTransactions = async (): Promise<GetTransactionsRes> => {
	try {
		const response = await api.get("/api/v1/transactions");
		console.log("Transactions received:", response.data);
		
		// Ensure each transaction has proper types
		const transactions = (response.data || []).map((t: any) => ({
			id: Number(t.id),
			amount: String(t.amount || "0"),
			reason: String(t.reason || ""),
			createdAt: String(t.createdAt || new Date().toISOString()),
			type: t.type || "saving",
			userId: Number(t.userId || t.user_id || 0),
		}));
		
		return {
			transactions,
			error: null,
		};
	} catch (error: any) {
		console.error("Failed to fetch transactions:", error.response?.data || error.message);
		return {
			transactions: [],
			error: error.response?.data?.error || error.message || "Failed to load transactions",
		};
	}
};