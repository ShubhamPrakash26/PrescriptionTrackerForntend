import axios from "axios";

export const axiosInstance=axios.create({
baseURL:`https://prescriptiontracker.onrender.com/api`,
withCredentials:true,
});

