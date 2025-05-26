import { useState } from "react";
import { useAuthStore } from "../context/useAuthStore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      try {
       const response = await fetch('http://localhost:5000/api/updateProfileImage', {
        method: 'POST',
         headers: {
         'Content-Type': 'application/json',
            },
           credentials: 'include', // ← ADD THIS LINE
          body: JSON.stringify({
           userId: authUser._id,
           profilePic: base64Image,
           }),
        });


        if (!response.ok) {
          // If response is not OK, read error text from response
          const errorData = await response.json();
          console.error("Error updating profile:", errorData.message);
          return;
        }

        const data = await response.json();
        console.log("Profile picture updated:", data.message);
      } catch (error) {
        console.error("Error during image upload:", error);
      }
    };
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <p className="mt-1 text-gray-500">Your profile details</p>
        </div>

        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <img
              src={selectedImg || authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
            />
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer transition-all ${
                isUpdatingProfile ? "animate-pulse pointer-events-none opacity-50" : ""
              }`}
            >
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {isUpdatingProfile ? "Uploading photo..." : "Click the camera icon to update"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <User className="w-4 h-4" />
              Full Name
            </div>
            <p className="px-4 py-2 bg-gray-100 rounded-md border text-gray-700">
              {authUser?.name || "Not Provided"}
            </p>
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <p className="px-4 py-2 bg-gray-100 rounded-md border text-gray-700">
              {authUser?.email || "Not Provided"}
            </p>
          </div>
        </div>

        <div className="mt-10 bg-blue-50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">Account Information</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between border-b pb-2">
              <span>Member Since</span>
              <span>{authUser?.createdAt?.split("T")[0] || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span>Account Status</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
