import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Membership from './pages/membership.jsx'
import { useNavigate } from "react-router-dom";

function App() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    bedding: "",
    feed: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      name: formData.name,
      email: formData.email,
      address: formData.address,
      bedding: count1,
      feed: count2,
    };

    try {
      const res = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert("✅ Thank you! Your order has been submitted.");
        setFormData({ name: "", email: "", address: "" });
        setCount1(0);
        setCount2(0);
      } else {
        alert("⚠️ Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("❌ Unable to connect to the server.");
    }
  };


  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);


  return (
    <>

      {/* Navigation link */}
      <p
        onClick={() => navigate("/membership")}
        className="text-blue-600 underline cursor-pointer hover:text-blue-800 absolute left-4 top-4"
      >
        Sign up Membership
      </p>

      {/* Define your routes */}
      <Routes>
        <Route path="/" element={
          <div>


            <h1>Hamster Supplies</h1>

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-4">
              <form
                onSubmit={handleSubmit}
                className="relative bg-white/90 backdrop-blur-lg p-8 rounded-[2rem] shadow-[0_10px_25px_rgba(0,0,0,0.1)] w-full max-w-md border border-white/40"
              >
                {/* Decorative bubbles */}
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-blue-200 rounded-full blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-300 rounded-full blur-2xl opacity-70 animate-pulse"></div>

                <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
                  Delivery Form
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block mb-2 text-gray-700 font-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => {
                        const regex = /^[A-Za-z\s()]*$/; // Only letters, spaces, and ()
                        if (regex.test(e.target.value)) {
                          handleChange(e);
                        }
                      }}
                      required
                      className="border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 rounded-full w-full outline-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-700 font-semibold">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 rounded-full w-full outline-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-700 font-semibold">
                      Delivery Address
                    </label>
                    <textarea
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 rounded-3xl w-full outline-none shadow-sm resize-none"
                    ></textarea>
                  </div>



                  <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800">Our Products</h2>

                    <div className="grid grid-cols-2">
                      {/* Bedding */}
                      <div className="bg-white rounded-2xl p-4 gap-2 justify-center shadow-md flex flex-col items-center">

                        <img
                          src="https://hamster-supplies-assets.s3.us-east-1.amazonaws.com/bedding.jpg"
                          alt="Bedding"
                          className="w-8 h-8 object-cover rounded-md"
                          loading="lazy"
                        />

                        <p className="font-semibold text-gray-700">Bedding 5 kg</p>
                        <label className="mt-2 text-sm text-gray-600">Select Quantity:</label>
                        <select
                          value={count1}
                          onChange={(e) => setCount1(Number(e.target.value))}
                          className="border border-gray-300 rounded-lg p-2 w-28 text-center shadow-sm mt-1"
                        >
                          {[...Array(21)].map((_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Feed */}
                      <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center">
                        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center mb-3">
                          <img
                            src="https://hamster-supplies-assets.s3.us-east-1.amazonaws.com/feed.jpeg"
                            alt="Feed"
                            className="w-full h-full object-cover block"
                            loading="lazy"
                          />
                        </div>
                        <p className="font-semibold text-gray-700">Feed 1 kg</p>
                        <label className="mt-2 text-sm text-gray-600">Select Quantity:</label>
                        <select
                          value={count2}
                          onChange={(e) => setCount2(Number(e.target.value))}
                          className="border border-gray-300 rounded-lg p-2 w-28 text-center shadow-sm mt-1">
                          {[...Array(21)].map((_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </div>


                    </div>
                  </div>


                  <br></br>
                  <br></br>


                  <button
                    type="submit"
                    className="w-full py-3 mt-3 bg-gradient-to-r from-indigo-500 to-blue-600 font-semibold rounded-full shadow-md hover:scale-105 transition-transform duration-200"
                  >
                    Submit Order
                  </button>
                </div>
              </form>
            </div>


          </div>
        } />

        <Route path="/membership" element={<Membership />} />
      </Routes>

    </>
  )
}

export default App
