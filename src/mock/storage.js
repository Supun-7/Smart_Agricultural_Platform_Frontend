import { MOCK_CONTRACTS, MOCK_PROFILE, MOCK_TRANSACTIONS, MOCK_WALLET } from "./mockData.js";

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function ensureMockSeed() {
  // Seed profile + role (used by InvestorOnly).
  if (!localStorage.getItem("role")) localStorage.setItem("role", MOCK_PROFILE.role);
  if (!localStorage.getItem("profile")) localStorage.setItem("profile", JSON.stringify(MOCK_PROFILE));

  // Seed contracts.
  if (!localStorage.getItem("investor_contracts")) {
    localStorage.setItem("investor_contracts", JSON.stringify(MOCK_CONTRACTS));
  }

  // Seed wallet.
  if (!localStorage.getItem("investor_wallet")) {
    localStorage.setItem("investor_wallet", JSON.stringify(MOCK_WALLET));
  }

  // Seed transactions.
  if (!localStorage.getItem("investor_transactions")) {
    localStorage.setItem("investor_transactions", JSON.stringify(MOCK_TRANSACTIONS));
  }
}

export function loadProfile() {
  return safeParse(localStorage.getItem("profile") || "", MOCK_PROFILE);
}

export function saveProfile(profile) {
  const next = { ...MOCK_PROFILE, ...profile };
  // Keep role in sync with the investor-only build.
  if (!next.role) next.role = "investor";
  localStorage.setItem("profile", JSON.stringify(next));
}

export function loadContracts() {
  return safeParse(localStorage.getItem("investor_contracts") || "[]", []);
}

export function saveContracts(contracts) {
  localStorage.setItem("investor_contracts", JSON.stringify(contracts));
}

export function loadWallet() {
  return safeParse(localStorage.getItem("investor_wallet") || "", MOCK_WALLET);
}

export function loadTransactions() {
  return safeParse(localStorage.getItem("investor_transactions") || "[]", []);
}
