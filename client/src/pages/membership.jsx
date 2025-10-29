import { useState } from "react";

function Membership() {
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    profilePic: null,
  });

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: file });
      setImagePreview(URL.createObjectURL(file)); // show preview
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
    alert("✅ Membership sign-up submitted!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-lg p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-white/40 flex flex-col items-center"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
          Membership Sign-Up
        </h2>

        {/* Profile Picture Bubble */}
        <label htmlFor="profilePic" className="relative cursor-pointer">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-indigo-400 shadow-md mb-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-500">Upload</span>
            )}
          </div>
          <input
            id="profilePic"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        {/* Username Input */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 rounded-full w-full outline-none shadow-sm mb-4"
        />

        {/* Password Input */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 rounded-full w-full outline-none shadow-sm mb-6"
        />

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-full shadow-md hover:scale-105 transition-transform duration-200"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}

export default Membership;
