import { useEffect, useState } from "react";
import { useWallet } from "../../hooks/useWallet";
import "../../styles/pages/investor/wallet.css";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val, currency = "LKR") {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-LK", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Transaction panel (reused for deposit & withdrawal) ──────────────────────

function TransactionPanel({ type, onSubmit }) {
  const isDeposit = type === "DEPOSIT";
  const [amount, setAmount]   = useState("");
  const [busy,   setBusy]     = useState(false);
  const [msg,    setMsg]      = useState(null);   // { ok: bool, text: string }

  async function handleSubmit() {
    const parsed = parseFloat(amount);
    // AC-7: client-side guard (server also validates)
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setMsg({ ok: false, text: "Please enter a positive amount." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await onSubmit(parsed);
      setMsg({
        ok: true,
        text: `${isDeposit ? "Deposited" : "Withdrawn"} ${fmt(res.amount, res.currency)} — new balance: ${fmt(res.newBalance, res.currency)}`,
      });
      setAmount("");
    } catch (err) {
      setMsg({ ok: false, text: err.message || "Transaction failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="walletPanel">
      <h3 className="walletPanelTitle">
        {isDeposit ? "💳 Deposit Funds" : "🏧 Withdraw Funds"}
      </h3>

      <div className="walletAmountField">
        <label className="walletAmountLabel">Amount (LKR)</label>
        <input
          className="walletAmountInput"
          type="number"
          min="1"
          step="any"
          placeholder={isDeposit ? "e.g. 50000" : "e.g. 10000"}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={busy}
        />
      </div>

      {msg && (
        <p className={`walletMsg ${msg.ok ? "walletMsgOk" : "walletMsgErr"}`}>
          {msg.text}
        </p>
      )}

      <button
        className={`walletBtn ${isDeposit ? "walletBtnDeposit" : "walletBtnWithdraw"}`}
        onClick={handleSubmit}
        disabled={busy}
      >
        {busy
          ? (isDeposit ? "Processing…" : "Withdrawing…")
          : (isDeposit ? "Deposit" : "Withdraw")}
      </button>
    </div>
  );
}

// ── Ledger row ────────────────────────────────────────────────────────────────

function LedgerRow({ entry }) {
  const isDeposit = entry.transactionType === "DEPOSIT";
  return (
    <div className="walletLedgerRow">
      <span className={`walletLedgerBadge ${isDeposit ? "badgeDeposit" : "badgeWithdrawal"}`}>
        {isDeposit ? "Deposit" : "Withdraw"}
      </span>
      <span className="walletLedgerRef" title={entry.gatewayReference}>
        {entry.gatewayReference}
      </span>
      <span className="walletLedgerDate">{fmtDate(entry.createdAt)}</span>
      <span className={`walletLedgerAmount ${isDeposit ? "amountDeposit" : "amountWithdrawal"}`}>
        {isDeposit ? "+" : "−"}{fmt(entry.amount)}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InvestorWallet() {
  const { wallet, loading, error, fetchWallet, deposit, withdraw } = useWallet();

  // Load wallet on mount
  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  if (loading && !wallet) {
    return (
      <div className="walletPage">
        <div className="walletLoading">
          <div className="walletSpin" />
          <p>Loading wallet…</p>
        </div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="walletPage">
        <div className="walletError">
          <p>⚠️ {error}</p>
          <button className="walletBtn walletBtnDeposit" style={{ width: "auto", padding: ".6rem 1.5rem" }} onClick={fetchWallet}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { balance = 0, currency = "LKR", history = [] } = wallet ?? {};

  return (
    <div className="walletPage">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="walletHeader">
        <div>
          <h1 className="walletTitle">My Wallet</h1>
          <p className="walletSub">Manage your investment capital</p>
        </div>
      </div>

      {/* ── Balance card — AC-2: updates immediately after tx ── */}
      <div className="walletBalanceCard">
        <span className="walletBalanceIcon">💰</span>
        <div>
          <p className="walletBalanceLabel">Available Balance</p>
          <p className="walletBalanceAmount">{fmt(balance, currency)}</p>
          <p className="walletCurrency">{currency} · Ceylon Harvest Capital</p>
        </div>
      </div>

      {/* ── Action panels ──────────────────────────────── */}
      <div className="walletActions">
        {/* AC-1: deposit form */}
        <TransactionPanel type="DEPOSIT"    onSubmit={deposit}   />
        {/* AC-4: withdrawal form */}
        <TransactionPanel type="WITHDRAWAL" onSubmit={withdraw}  />
      </div>

      {/* ── Ledger history — AC-3 / AC-6 / AC-8 ───────── */}
      <div className="walletSection">
        <h2 className="walletSectionTitle">Transaction History</h2>
        <div className="walletLedger">
          {history.length === 0 ? (
            <div className="walletEmpty">No transactions yet. Make your first deposit to get started.</div>
          ) : (
            history.map((entry) => <LedgerRow key={entry.ledgerId} entry={entry} />)
          )}
        </div>
      </div>

    </div>
  );
}
