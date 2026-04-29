import React, { useState } from "react";
import { ArrowUpRight, Paperclip, Sparkles } from "lucide-react";

export function Feed({
  simulationState,
  scenario,
  startSimulation,
  bypassSimulation,
  objective,
  activeAgents,
  selectedAgents,
  onToggleAgent,
  agentCatalog,
  selectedAgentCharge,
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      startSimulation(inputValue || objective, selectedAgents);
    }
  };

  if (simulationState === "idle") {
    return (
      <div className="feed-shell feed-shell--idle">
        <div className="hero-block">
          <div className="hero-badge">
            <Sparkles size={14} />
            ChatGPT-style strategy workspace
          </div>
          <h1>What should the boardroom solve today?</h1>
          <p>
            Give the app a goal and it will research, budget, plan, and resolve
            the best next move.
          </p>
        </div>

        <div className="composer-card composer-card--large">
          <textarea
            className="composer-input"
            placeholder="Describe the startup objective, product idea, or strategy question..."
            rows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="composer-footer">
            <div className="composer-tools">
              <button type="button">
                <Paperclip size={14} /> Attach
              </button>
              <button type="button">Web search</button>
              <button type="button">Analysis</button>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="send-button"
                style={{ background: "#334155", color: "#94a3b8", width: "auto", padding: "0 16px", borderRadius: "100px", fontSize: "12px", fontWeight: "600" }}
                onClick={() =>
                  bypassSimulation(
                    inputValue || "Launch a SaaS product",
                    selectedAgents,
                  )
                }
              >
                Bypass Checkout (Test)
              </button>
              <button
                className="send-button"
                onClick={() =>
                  startSimulation(
                    inputValue || "Launch a SaaS product",
                    selectedAgents,
                  )
                }
              >
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="agent-picker">
          <div className="agent-picker-header">
            <div>
              <div className="eyebrow">Pay per use</div>
              <h3>Select agents you need</h3>
            </div>
            <div className="agent-picker-total">
              {selectedAgents.length} selected · {selectedAgentCharge} USDC
            </div>
          </div>

          <div className="agent-picker-grid">
            {agentCatalog.map((agent) => {
              const isSelected = selectedAgents.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  type="button"
                  className={`agent-select-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onToggleAgent(agent.id)}
                >
                  <div className="agent-select-top">
                    <span className="agent-select-name">{agent.name}</span>
                    <span className="agent-select-price">
                      ${agent.price.toFixed(1)}
                    </span>
                  </div>
                  <div className="agent-select-desc">{agent.description}</div>
                  <div className="agent-select-footer">
                    <span>{isSelected ? "Included" : "Tap to add"}</span>
                    <strong>{isSelected ? "On" : "Off"}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="prompt-grid">
          {[
            "Launch a SaaS product",
            "Go-to-market strategy",
            "Startup idea validation",
            "Reduce churn in a mobile app",
          ].map((s) => (
            <button
              key={s}
              className="prompt-chip"
              onClick={() => {
                setInputValue(s);
                startSimulation(s, selectedAgents);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="feed-shell">
      <div className="feed-header">
        <div>
          <div className="eyebrow">Live boardroom</div>
          <h2>{objective || "Strategic session"}</h2>
        </div>
        <div className="status-pill status-pill--active">
          {simulationState === "running" ? "Running" : "Resolved"}
        </div>
      </div>

      {simulationState === "running" && (
        <div className="status-banner">
          <div className="status-dot" />
          Analyzing with {activeAgents.length || 0} active agents and live
          context sources.
        </div>
      )}

      {simulationState === "resolved" && (
        <div className="resolution-banner">
          <div className="resolution-title">Consensus reached</div>
          <div className="resolution-copy">
            The boardroom has produced a strategy-ready output for your
            objective.
          </div>
        </div>
      )}

      <div className="message-list">
        {scenario.map((msg, index) => (
          <div key={index} className="message-card">
            <div className="message-meta">
              <span
                className={`agent-badge agent-badge--${msg.agent.toLowerCase()}`}
              >
                {msg.agent}
              </span>
              <span className="message-action">Insight</span>
            </div>
            <div className="message-text">{msg.text}</div>
            <div className="message-actions">
              <button type="button">Share</button>
              <button type="button">Rewrite</button>
              <button type="button">Copy</button>
            </div>
          </div>
        ))}
      </div>

      {simulationState === "running" && (
        <div className="thinking-line">Searching and analyzing context...</div>
      )}

      <div className="composer-card composer-card--sticky">
        <input
          className="composer-input composer-input--single"
          placeholder="Ask a follow-up question..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="composer-footer composer-footer--compact">
          <div className="composer-tools">
            <button type="button">
              <Paperclip size={14} /> Attach
            </button>
            <button type="button">Web search</button>
            <button type="button">Analysis</button>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="send-button"
              style={{ background: "#334155", color: "#94a3b8", width: "auto", padding: "0 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "600" }}
              onClick={() =>
                bypassSimulation(inputValue || objective, selectedAgents)
              }
            >
              Bypass
            </button>
            <button
              className="send-button"
              onClick={() =>
                startSimulation(inputValue || objective, selectedAgents)
              }
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
