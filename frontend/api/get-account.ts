import { UserAccountInfo } from "@/types/interfaces";
import { api } from "@/utils/auth";

export interface UserAccountResponse {
	data: UserAccountInfo | null;
	error: string | null;
}

export const getUserAccountInfo = async (): Promise<UserAccountResponse> => {
	try {
		const response = await api.get("/api/v1/account");
		console.log("Account info received:", response.data);
		
		// Ensure balance is a number
		const accountData: UserAccountInfo = {
			id: response.data.id,
			email: response.data.email || "",
			name: response.data.name || "",
			balance: Number(response.data.balance) || 0,
			createdAt: response.data.createdAt || new Date().toISOString(),
		};
		
		return {
			data: accountData,
			error: null,
		};
	} catch (error: any) {
		console.error("Failed to fetch account info:", error.response?.data || error.message);
		return {
			data: null,
			error: error.response?.data?.error || error.message || "Failed to load account information",
		};
	}
};