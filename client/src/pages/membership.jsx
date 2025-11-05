import { useRef, useState } from "react";
import '../App.css';

export default function Membership() {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });

  const handlePick = () => fileInputRef.current?.click();

  const handleFile = (e) => {
    setErrors("");
    const f = e.target.files?.[0];
    if (!f) return;

    // Basic validation
    if (!f.type.startsWith("image/")) {
      setErrors("Please choose an image file.");
      return;
    }
    const MAX_MB = 5;
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrors(`Image must be ≤ ${MAX_MB} MB.`);
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");

    // Basic validations first
    if (!form.email || !form.password) {
      setErrors("Email and password are required.");
      return;
    }
    if (!file) {
      setErrors("Please upload a profile picture.");
      return;
    }

    // 1) Get presigned POST from your server
    const presignRes = await fetch("http://localhost:5000/api/auth/avatar/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        fileName: file.name,
        contentType: file.type,
      }),
    });
    if (!presignRes.ok) {
      const txt = await presignRes.text().catch(() => "");
      setErrors(`Failed to get upload URL (${presignRes.status}): ${txt || "no body"}`);
      return;
    }
    const { url, fields, key } = await presignRes.json();

    // 2) Upload directly to S3 (fields first, then Content-Type, then file)
    const s3Form = new FormData();
    Object.entries(fields).forEach(([k, v]) => s3Form.append(k, v));
    s3Form.append("Content-Type", file.type);
    s3Form.append("file", file);

    const s3Res = await fetch(url, { method: "POST", body: s3Form });
    if (!s3Res.ok) {
      const txt = await s3Res.text().catch(() => "");
      setErrors(`Upload to S3 failed (${s3Res.status}): ${txt || "no body"}`);
      return;
    }

    // 3) Finish signup with JSON (no file here)
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        username: form.username, // if you collect it
        avatarKey: key,
      }),
    });
    if (!res.ok) {
      const msg = (await res.json().catch(() => null))?.message || "Sign up failed. Please try again.";
      setErrors(msg);
      return;
    }

    alert("✅ Account created!");
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-lg p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-white/40 flex flex-col items-center"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
          Create Your Account
        </h1>

        {/* Spherical, centered avatar */}
        <div className="mb-5 flex flex-col items-center">
          <div className="aspect-square w-40 rounded-full overflow-hidden"
            onClick={handlePick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handlePick()}
            aria-label="Upload profile picture"
            title="Upload profile picture"
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="circular w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600">
                Upload
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handlePick}
            className="mt-3 px-4 py-2 rounded-full shadow-sm border border-gray-300 hover:shadow-md"
          >
            Choose Photo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Email */}
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="mb-4 w-full rounded-full border border-gray-300 p-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="mb-6 w-full rounded-full border border-gray-300 p-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        />

        {errors && (
          <p className="mb-4 text-sm text-red-600 text-center">{errors}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-full shadow-md hover:scale-105 transition-transform duration-200"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
