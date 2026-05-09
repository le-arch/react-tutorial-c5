/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserAccountInfo, UserAccountInfo } from "@/api/get-account";
import { getToken } from "@/utils/auth";
import { useEffect, useState } from "react";

export const useFetchAccountInfo = () => {
	const [accountInfo, setAccountInfo] = useState<UserAccountInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAccountInfo = async () => {
		try {
			setLoading(true);
			setError(null);
			
			const token = getToken();
			if (!token) {
				setError("Not authenticated");
				setLoading(false);
				return;
			}
			
			const res = await getUserAccountInfo();
			
			if (res.error) {
				setError(res.error);
				setAccountInfo(null);
			} else {
				setAccountInfo(res.data);
				console.log("Account info loaded:", res.data);
			}
		} catch (err: any) {
			console.error("Failed to fetch account info:", err);
			setError(err.message || "Failed to load account information");
			setAccountInfo(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAccountInfo();
	}, []);

	return { accountInfo, loading, error, refreshAccount: fetchAccountInfo };
};