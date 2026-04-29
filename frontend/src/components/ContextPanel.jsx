export function ContextPanel({
  objective,
  activeAgents,
  tokenUsage,
  simulationState,
  selectedAgents,
  agentCatalog,
  selectedAgentCharge,
  selectedAgentLabels,
  treasurySummary,
  lastPayout,
}) {
  const treasuryBalances = treasurySummary?.agent_wallets || [];
  const payoutResult = treasurySummary?.last_payout_result || {};

  return (
    <div className="context-stack">
      <div className="context-card">
        <div className="context-label">Current objective</div>
        <div className="context-value">
          {objective || "Describe the goal you want the boardroom to solve."}
        </div>
      </div>

      <div className="context-card">
        <div className="context-label">Selected agents</div>
        <div className="selected-agent-list">
          {agentCatalog.map((agent) => {
            const isSelected = selectedAgents.includes(agent.id);
            return (
              <div
                key={agent.id}
                className={`selected-agent-row ${isSelected ? "is-selected" : ""}`}
              >
                <span>{agent.name}</span>
                <strong>${agent.price.toFixed(1)}</strong>
              </div>
            );
          })}
        </div>
        <div className="selected-agent-summary">
          <span>{selectedAgentLabels.length} active</span>
          <strong>{selectedAgentCharge} USDC</strong>
        </div>
      </div>

      <div className="context-card">
        <div className="context-label">Treasury</div>
        <div className="treasury-summary">
          <div className="treasury-pill treasury-pill--platform">
            <span>Platform</span>
            <strong>
              {treasurySummary
                ? `${treasurySummary.platform_balance.toFixed(2)} USDC`
                : "—"}
            </strong>
          </div>
          <div className="treasury-pill treasury-pill--live">
            <span>Ledger</span>
            <strong>{treasurySummary?.mode || "loading"}</strong>
          </div>
        </div>

        <div className="treasury-balance-list">
          {treasuryBalances.length > 0 ? (
            treasuryBalances.map((agent) => (
              <div key={agent.agent} className="treasury-balance-row">
                <div>
                  <span>{agent.agent}</span>
                  <small>{agent.wallet}</small>
                </div>
                <strong>{agent.balance.toFixed(2)} USDC</strong>
              </div>
            ))
          ) : (
            <div className="treasury-empty">Waiting for treasury data...</div>
          )}
        </div>

        <div className="last-payout-banner">
          <span>Last payout</span>
          <strong>
            {lastPayout
              ? `+${Number(lastPayout.amount).toFixed(2)} USDC to ${lastPayout.agent}`
              : "No payouts yet"}
          </strong>
        </div>

        <div className="last-payout-banner last-payout-banner--secondary">
          <span>On-chain status</span>
          <strong>
            {payoutResult.status || treasurySummary?.mode || "pending"}
          </strong>
        </div>

        {Array.isArray(payoutResult.tx_hashes) &&
          payoutResult.tx_hashes.length > 0 && (
            <div className="tx-hash-list">
              {payoutResult.tx_hashes.map((hash) => (
                <div key={hash} className="tx-hash-row">
                  <span>Tx</span>
                  <strong>{hash}</strong>
                </div>
              ))}
            </div>
          )}
      </div>

      <div className="context-card">
        <div className="context-label">Agent sync</div>
        {["CEO", "CTO", "CFO", "CMO", "Researcher"].map((agent) => {
          const isActive = activeAgents.includes(agent);
          const isResolved = simulationState === "resolved";
          return (
            <div key={agent} className="agent-sync-row">
              <div
                className={`agent-sync-dot ${isActive ? "is-active" : ""} ${isResolved ? "is-resolved" : ""}`}
              />
              <span>{agent}</span>
              <strong>
                {isResolved && isActive ? "SYNCED" : isActive ? "LIVE" : "IDLE"}
              </strong>
            </div>
          );
        })}
      </div>

      <div className="context-card">
        <div className="context-label">Usage</div>
        <div className="metric-row">
          <span>Tokens</span>
          <strong>{tokenUsage.tokens}</strong>
        </div>
        <div className="metric-row">
          <span>Cost</span>
          <strong>${tokenUsage.cost.toFixed(4)}</strong>
        </div>
        <div className="metric-row">
          <span>Latency</span>
          <strong>0.8s</strong>
        </div>
      </div>

      <div className="context-card">
        <div className="context-label">Context sources</div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="source-row">
            <div className="source-icon" />
            <div className="source-lines">
              <div className="source-line source-line--title" />
              <div className="source-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
