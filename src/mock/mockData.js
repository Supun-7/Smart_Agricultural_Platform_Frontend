// Front-end only: mock data used across the Investor dashboard.

export const MOCK_PROFILE = {
  name: "Sachith Asmadala",
  email: "investor@example.com",
  role: "investor"
};
//.........
export const MOCK_PROJECTS = [
  {
    id: "PRJ-001",
    title: "Organic Cinnamon Expansion",
    location: "Matale",
    durationMonths: 12,
    roi: 16,
    target: 3000000,
    raised: 1250000,
    risk: "Medium"
  },
  {
    id: "PRJ-002",
    title: "Pepper Drying Facility",
    location: "Kegalle",
    durationMonths: 9,
    roi: 14,
    target: 2200000,
    raised: 900000,
    risk: "Low"
  },
  {
    id: "PRJ-003",
    title: "Tea Replanting (High-Grown)",
    location: "Nuwara Eliya",
    durationMonths: 18,
    roi: 18,
    target: 5000000,
    raised: 1800000,
    risk: "Medium"
  }
];

export const MOCK_CONTRACTS = [
  {
    contract_id: "CN-100234",
    project_id: "PRJ-001",
    project_title: "Organic Cinnamon Expansion",
    amount: 450000,
    start_date: "2026-01-10",
    end_date: "2027-01-10",
    status: "active"
  },
  {
    contract_id: "CN-100189",
    project_id: "PRJ-002",
    project_title: "Pepper Drying Facility",
    amount: 250000,
    start_date: "2026-02-01",
    end_date: "2026-11-01",
    status: "active"
  },
  {
    contract_id: "CN-100112",
    project_id: "PRJ-003",
    project_title: "Tea Replanting (High-Grown)",
    amount: 150000,
    start_date: "2026-02-20",
    end_date: "2027-08-20",
    status: "pending"
  }
];

export const MOCK_WALLET = {
  currency: "LKR",
  balance: 1250000,
  availableToInvest: 980000,
  lastUpdated: "2026-03-01"
};

export const MOCK_TRANSACTIONS = [
  {
    id: "TX-700901",
    date: "2026-02-25",
    type: "deposit",
    description: "Bank deposit",
    amount: 500000
  },
  {
    id: "TX-700855",
    date: "2026-02-20",
    type: "investment",
    description: "Contract CN-100112 (Tea Replanting)",
    amount: -150000
  },
  {
    id: "TX-700612",
    date: "2026-02-01",
    type: "investment",
    description: "Contract CN-100189 (Pepper Drying Facility)",
    amount: -250000
  },
  {
    id: "TX-700190",
    date: "2026-01-10",
    type: "investment",
    description: "Contract CN-100234 (Cinnamon Expansion)",
    amount: -450000
  },
  {
    id: "TX-699912",
    date: "2026-01-05",
    type: "deposit",
    description: "Initial wallet top-up",
    amount: 1000000
  }
];
