import { create } from "zustand";
import {axiosInstance} from "../services/axios.service.js";
import toast from"react-hot-toast";
export const useAuthStore =create((set)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIng:false,
    isUpdatingProfile:false,
    onlineUsers:[],
    isCheckingAuth:true,
    
    checkAuth: async()=>{
      try{
        const res=await axiosInstance.get("/auth/check");
        set ({authUser:res.data})  
    }
      catch(error){
       console.log("Error in check Auth:",error);
       set({authUser:null});
      }
      finally{
        set({isCheckingAuth:false});
      }
    },
    signup: async (data) => {
      set({ isSigningUp: true });
      try {
        const res = await axiosInstance.post("/auth/signup", data);
        set({ authUser: res.data });
        toast.success("Account created successfully");
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Signup failed"; // ✅ Define first
        toast.error(errorMessage);
        console.error("Signup Error:", errorMessage);
      } finally {
        set({ isSigningUp: false });
      }
    },     
    logout:async()=>{
     try{
      await axiosInstance.post("/auth/logout");
      set({authUser:null});
      toast.success("Logged out successfully"); 
    }
     catch(error){
      toast.error(error.response.data.message);
     }
    },   
    login:async(data)=>{
     set({isLoggingIng:true});
     try{
       const res =await axiosInstance.post("/auth/login",data);
       set({authUser:res.data});
       toast.success("Logged in successfully");
     }
     catch(error){  
       toast.error(error.response.data.message);
     }
     finally{
      set({isLoggingIng:false});
     }
    },
    updateProfile: async (data) => {
      set({ isUpdatingProfile: true });
    
      try {
        const res = await axiosInstance.put("/auth/update-profile", data);
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      } catch (error) {
        console.log("Error updating profile:", error);
        const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
        toast.error(errorMessage);
      } finally {
        set({ isUpdatingProfile: false });
      }
    }
    
}));