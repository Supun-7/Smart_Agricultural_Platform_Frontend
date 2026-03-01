// userService.js
import axios from "axios";

const API_BASE = "http://localhost:8080/api/users";

/**
 * Login  →  POST /api/users/login
 * Body:     { email, password }
 * Returns:  User object  { userId, fullName, email, role, passwordHash }
 *           or 401 → throws / returns { error }
 */
export async function loginUser(email, password) {
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

/**
 * Register  →  POST /api/users/register
 * Body:        { fullName, email, passwordHash, role }
 * Returns:     saved User object
 */
export async function registerUser({ fullName, email, password, role }) {
  try {
    const res = await axios.post(`${API_BASE}/register`, {
      fullName,
      email,
      passwordHash: password,   // backend field name is passwordHash
      role,
    });
    return { data: res.data, error: null };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      (err.response?.status === 409 ? "Email already registered." : null) ||
      err.message ||
      "Registration failed.";
    return { data: null, error: { message: msg } };
  }
}
