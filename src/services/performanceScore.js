export function computeMilestoneCompletionPct(groups) {
  const all = groups.flatMap((g) => g.items || []);
  const total = all.length;
  const done = all.filter((m) => m.status === "complete").length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function computePerformanceScore({ projects, milestoneGroups, transactions }) {
  const milestonePct = computeMilestoneCompletionPct(milestoneGroups) / 100;

  const raised = projects.reduce((s, p) => s + Number(p.raised || 0), 0);
  // Escrow health is approximated from funds: in this MVP, escrow is stored in farmer_funds.
  // But to keep score independent, we infer escrow deposits vs releases from transactions.
  const escrowDeposits = transactions
    .filter((t) => String(t.status || "").toLowerCase().includes("escrow"))
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const released = transactions
    .filter((t) => String(t.status || "").toLowerCase() === "released")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const escrowBalance = Math.max(0, escrowDeposits + (raised - escrowDeposits) - released);
  const escrowHealth = raised ? Math.min(1, escrowBalance / raised) : 0;

  const now = Date.now();
  const recentTx = transactions.filter((t) => {
    const dt = new Date(t.date).getTime();
    return Number.isFinite(dt) && now - dt <= 30 * 24 * 60 * 60 * 1000;
  }).length;
  const activity = Math.min(1, recentTx / 8);

  const score = milestonePct * 40 + escrowHealth * 30 + milestonePct * 20 + activity * 10;
  return Math.round(score);
}
