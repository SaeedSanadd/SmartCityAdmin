import axios from "axios";

export async function sendLoginData(values) {
    try {
        const { data } = await axios.post("/api/users/signin", values);
        return data;
    } catch (err) {
        console.log("STATUS:", err?.response?.status);
        console.log("DATA:", err?.response?.data);
        return { error: err?.response?.data?.message || "Login failed" };
    }
}