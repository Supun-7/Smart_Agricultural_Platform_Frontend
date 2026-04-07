import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { investorApi } from "../services/api";

/**
 * Hook for all wallet operations.
 * Keeps balance/history in sync after every successful transaction.
 */
export function useWallet() {
  const { token } = useAuth();

  const [wallet,  setWallet]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Fetch current wallet (balance + ledger history) ──────────────────────
  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await investorApi.getWallet(token);
      setWallet(data);
    } catch (err) {
      setError(err.message || "Failed to load wallet.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Deposit ──────────────────────────────────────────────────────────────
  const deposit = useCallback(async (amount) => {
    const result = await investorApi.deposit(token, amount);
    // Refresh wallet so balance and ledger are up to date (AC-2)
    await fetchWallet();
    return result;
  }, [token, fetchWallet]);

  // ── Withdraw ─────────────────────────────────────────────────────────────
  const withdraw = useCallback(async (amount) => {
    const result = await investorApi.withdraw(token, amount);
    await fetchWallet();
    return result;
  }, [token, fetchWallet]);

  return { wallet, loading, error, fetchWallet, deposit, withdraw };
}
