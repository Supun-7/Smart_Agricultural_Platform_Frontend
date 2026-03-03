import "../styles/components/contractCard.css";

export function ContractCard({ contract, action }) {
  return (
    <article className="contractCard">
      <div className="contractTop">
        <div>
          <div className="contractTitle">Contract #{contract.contract_id}</div>
          <div className="contractMeta">
            <span>Farmer ID: {contract.farmer_id}</span>
            <span>Investor ID: {contract.investor_id}</span>
          </div>
        </div>
        <div className={`statusPill status-${(contract.status || "active").toLowerCase()}`}>{contract.status}</div>
      </div>

      <div className="contractGrid">
        <div className="kv"><span>Amount</span><strong>{Number(contract.amount).toLocaleString()} LKR</strong></div>
        <div className="kv"><span>Start</span><strong>{contract.start_date}</strong></div>
        <div className="kv"><span>End</span><strong>{contract.end_date}</strong></div>
      </div>

      {contract.ledger_entry ? (
        <details className="ledger">
          <summary>Ledger entry</summary>
          <pre className="ledgerPre">{JSON.stringify(contract.ledger_entry, null, 2)}</pre>
        </details>
      ) : null}

      {action ? <div className="contractActions">{action}</div> : null}
    </article>
  );
}
