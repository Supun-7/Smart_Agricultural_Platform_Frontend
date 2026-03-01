import { StatCard } from "../components/StatCard.jsx";
import { IconCoin, IconTrend } from "../components/icons.jsx";
import "../styles/pages/roleDash.css";
import { loadWallet } from "../mock/storage.js";
import { useMemo } from "react";

export default function InvestorWallet() {
  const wallet = useMemo(() => loadWallet(), []);

  return (
    <div className="dashPage">
      <div className="pageTop">
        <h1 className="pageTitle">Wallet</h1>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Balance & Funding</h2>
        <p className="sectionSubtitle">Mock wallet data (no database connection).</p>

        <div className="statGrid">
          <StatCard
            variant="plain"
            kicker="Current Balance"
            valueTop={wallet.currency}
            value={Number(wallet.balance || 0).toLocaleString()}
            icon={<IconCoin />}
          />
          <StatCard
            variant="plain"
            kicker="Available to Invest"
            valueTop={wallet.currency}
            value={Number(wallet.availableToInvest || 0).toLocaleString()}
            icon={<IconTrend />}
          />
        </div>

        <p className="sectionSubtitle" style={{ marginTop: 10 }}>
          Last updated: <span className="cap">{wallet.lastUpdated}</span>
        </p>
      </section>
    </div>
  );
}
