import axios from "axios";
const API_BASE = "http://localhost:8080/api/users";

const MOCK_USERS = [
  {
    email: "auditor@gmail.com",
    password: "12345678",
    user: { userId: 9002, fullName: "Auditor User", email: "auditor@gmail.com", role: "auditor" },
  },
];

export async function loginUser(email, password) {
  const mock = MOCK_USERS.find(
    (m) => m.email.toLowerCase() === email.toLowerCase() && m.password === password
  );
  if (mock) return { data: mock.user, error: null };

  try {
    const res = await axios.post(`${API_BASE}/login`, { email, password });
    return { data: res.data, error: null };
  } catch (err) {
    const msg =
      err.response?.status === 401
        ? "Invalid email or password."
        : err.response?.data?.message || err.message || "Login failed.";
    return { data: null, error: { message: msg } };
  }
}

export async function registerUser({ fullName, email, password, role }) {
  try {
    const res = await axios.post(`${API_BASE}/register`, {
      fullName, email, passwordHash: password, role,
    });
    return { data: res.data, error: null };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      (err.response?.status === 409 ? "Email already registered." : null) ||
      err.message || "Registration failed.";
    return { data: null, error: { message: msg } };
  }
}
