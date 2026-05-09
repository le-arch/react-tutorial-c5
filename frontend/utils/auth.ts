import axios from "axios";

const BASEURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const getToken = (): string | null => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("token");
	}
	return null;
};

export const getUser = () => {
	if (typeof window !== "undefined") {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	}
	return null;
};

export const logout = () => {
	if (typeof window !== "undefined") {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		window.location.href = "/login";
	}
};

export const isAuthenticated = (): boolean => {
	return getToken() !== null;
};

// Create authenticated axios instance
export const api = axios.create({
	baseURL: BASEURL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add interceptor to attach token
api.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Add interceptor to handle unauthorized responses
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			logout();
		}
		return Promise.reject(error);
	}
);

export const refreshPage = () => {
	if (typeof window !== "undefined") {
		window.location.reload();
	}
};