/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateTransactionPayload } from "@/types/interfaces";
import { api } from "@/utils/auth";

export interface ResponseType {
	success: boolean;
	error: string | null;
}

export const saveTransaction = async (payload: CreateTransactionPayload): Promise<ResponseType> => {
	console.log("Saving transaction:", payload);
	
	try {
		const response = await api.post("/api/v1/transactions", payload);
		console.log("Transaction saved:", response.data);
		return {
			error: null,
			success: true,
		};
	} catch (err: any) {
		console.error("Failed to save transaction:", err.response?.data || err.message);
		return {
			error: err.response?.data?.error || err.message || "Failed to save transaction",
			success: false,
		};
	}
};