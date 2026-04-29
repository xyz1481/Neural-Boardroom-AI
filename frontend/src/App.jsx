import React, { useEffect, useState } from "react";
import { LocusCheckout } from "@withlocus/checkout-react";
import { ContextPanel } from "./components/ContextPanel";
import { Feed } from "./components/Feed";
import { Sidebar } from "./components/Sidebar";

const AGENT_CATALOG = [
  {
    id: "researcher",
    name: "Researcher",
    price: 0.5,
    description: "Market research and competitor scans.",
  },
  {
    id: "cfo",
    name: "CFO",
    price: 0.5,
    description: "Budgeting, runway, and allocation.",
  },
  {
    id: "cto",
    name: "CTO",
    price: 0.5,
    description: "Architecture, stack, and delivery plan.",
  },
  {
    id: "cmo",
    name: "CMO",
    price: 0.5,
    description: "Go-to-market and growth strategy.",
  },
  {
    id: "ceo",
    name: "CEO",
    price: 0.5,
    description: "Final decision and direction.",
  },
];

const DEFAULT_SELECTED_AGENTS = AGENT_CATALOG.map((agent) => agent.id);
const AGENT_PRICE_PER_CALL = 0.5;

function buildAgentSummary(activeAgents, scenario) {
  const latestMessageByAgent = scenario.reduce((accumulator, item) => {
    accumulator[item.agent] = item.text;
    return accumulator;
  }, {});

  return [
    {
      name: "CEO",
      role: "Strategy lead",
      status: activeAgents.includes("CEO") ? "Live" : "Ready",
      colorClass: "agent-badge--ceo",
      detail:
        latestMessageByAgent.CEO ||
        "Final decision synthesis and prioritization.",
    },
    {
      name: "CTO",
      role: "Product and stack",
      status: activeAgents.includes("CTO") ? "Live" : "Ready",
      colorClass: "agent-badge--cto",
      detail:
        latestMessageByAgent.CTO ||
        "Architecture, tooling, and execution plan.",
    },
    {
      name: "CFO",
      role: "Budget and runway",
      status: activeAgents.includes("CFO") ? "Live" : "Ready",
      colorClass: "agent-badge--cfo",
      detail:
        latestMessageByAgent.CFO ||
        "Allocation, burn rate, and financial safety.",
    },
    {
      name: "CMO",
      role: "Growth and demand",
      status: activeAgents.includes("CMO") ? "Live" : "Ready",
      colorClass: "agent-badge--cmo",
      detail:
        latestMessageByAgent.CMO || "Channel strategy and launch positioning.",
    },
    {
      name: "Researcher",
      role: "Market context",
      status: activeAgents.includes("Researcher") ? "Live" : "Ready",
      colorClass: "agent-badge--researcher",
      detail:
        latestMessageByAgent.Researcher ||
        "Competitive landscape and market signals.",
    },
  ];
}

function AgentsView({ activeAgents, scenario, objective, onStartChat }) {
  const agents = buildAgentSummary(activeAgents, scenario);

  return (
    <div className="dashboard-view">
      <div className="dashboard-hero">
        <div>
          <div className="eyebrow">Agents</div>
          <h2>Boardroom specialists</h2>
          <p>
            Each agent owns a different part of the strategy stack and
            contributes to the final answer.
          </p>
        </div>
        <button
          className="primary-action primary-action--compact"
          onClick={onStartChat}
        >
          Back to chat
        </button>
      </div>

      <div className="dashboard-grid dashboard-grid--agents">
        {agents.map((agent) => (
          <div key={agent.name} className="dashboard-card agent-card">
            <div className="message-meta">
              <span className={`agent-badge ${agent.colorClass}`}>
                {agent.name}
              </span>
              <span className="message-action">{agent.status}</span>
            </div>
            <div className="agent-role">{agent.role}</div>
            <p className="agent-detail">{agent.detail}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-card dashboard-card--full">
        <div className="context-label">Current objective</div>
        <div className="dashboard-copy">
          {objective ||
            "Start a session to see the agents collaborate on a live objective."}
        </div>
        <div className="agent-flow">
          {scenario.length > 0
            ? scenario.map((step, index) => (
                <div key={`${step.agent}-${index}`} className="flow-item">
                  <span>{step.agent}</span>
                  <p>{step.text}</p>
                </div>
              ))
            : [
                "Research market signals",
                "Allocate capital",
                "Choose the stack",
                "Plan the launch",
              ].map((item) => (
                <div key={item} className="flow-item flow-item--empty">
                  <span>{item}</span>
                  <p>Waiting for the next session to activate this stage.</p>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({
  scenario,
  activeAgents,
  tokenUsage,
  simulationState,
  onStartChat,
}) {
  const totalSteps = scenario.length;
  const agentCount = activeAgents.length;
  const coverage = Math.min(
    100,
    Math.max(24, totalSteps * 22 + agentCount * 10),
  );

  return (
    <div className="dashboard-view">
      <div className="dashboard-hero">
        <div>
          <div className="eyebrow">Analytics</div>
          <h2>Strategy performance</h2>
          <p>
            Track how much work the boardroom has done, what it has covered, and
            how much value the simulation is producing.
          </p>
        </div>
        <button
          className="primary-action primary-action--compact"
          onClick={onStartChat}
        >
          Back to chat
        </button>
      </div>

      <div className="dashboard-grid dashboard-grid--analytics">
        <div className="dashboard-card metric-card">
          <div className="context-label">Steps produced</div>
          <div className="metric-big">{totalSteps}</div>
          <p>Agent responses collected from the current session.</p>
        </div>
        <div className="dashboard-card metric-card">
          <div className="context-label">Active agents</div>
          <div className="metric-big">{agentCount}</div>
          <p>Specialists that have already contributed to the boardroom.</p>
        </div>
        <div className="dashboard-card metric-card">
          <div className="context-label">Estimated coverage</div>
          <div className="metric-big">{coverage}%</div>
          <p>How much of the strategy surface has been explored so far.</p>
        </div>
        <div className="dashboard-card metric-card">
          <div className="context-label">Session state</div>
          <div className="metric-big">
            {simulationState === "resolved"
              ? "Resolved"
              : simulationState === "running"
                ? "Running"
                : "Idle"}
          </div>
          <p>Current lifecycle state of the boardroom simulation.</p>
        </div>
      </div>

      <div className="dashboard-card dashboard-card--full">
        <div className="context-label">Usage summary</div>
        <div className="dashboard-copy">
          Cost and token signals for the current strategy run.
        </div>
        <div className="analytics-bars">
          <div className="analytics-bar">
            <span>Tokens</span>
            <div className="analytics-track">
              <div
                className="analytics-fill analytics-fill--cyan"
                style={{ width: `${Math.min(100, tokenUsage.tokens / 120)}%` }}
              />
            </div>
            <strong>{tokenUsage.tokens}</strong>
          </div>
          <div className="analytics-bar">
            <span>Cost</span>
            <div className="analytics-track">
              <div
                className="analytics-fill analytics-fill--violet"
                style={{ width: `${Math.min(100, tokenUsage.cost * 100)}%` }}
              />
            </div>
            <strong>${tokenUsage.cost.toFixed(4)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ onNewSession }) {
  return (
    <div className="dashboard-view">
      <div className="dashboard-hero">
        <div>
          <div className="eyebrow">Settings</div>
          <h2>Workspace preferences</h2>
          <p>
            Basic configuration panels for the interface and session behavior.
          </p>
        </div>
        <button
          className="primary-action primary-action--compact"
          onClick={onNewSession}
        >
          Reset session
        </button>
      </div>

      <div className="dashboard-grid dashboard-grid--settings">
        <div className="dashboard-card">
          <div className="context-label">Theme</div>
          <div className="settings-toggle-row">
            <span>Dark workspace</span>
            <strong>Enabled</strong>
          </div>
          <div className="settings-toggle-row">
            <span>Compact navigation</span>
            <strong>Enabled</strong>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="context-label">Session behavior</div>
          <div className="settings-toggle-row">
            <span>Auto-open chat on launch</span>
            <strong>On</strong>
          </div>
          <div className="settings-toggle-row">
            <span>Keep latest objective</span>
            <strong>On</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const BACKEND_URL = import.meta.env.DEV ? "http://localhost:8000" : "https://neural-boardroom-aiboardroom-backend.onrender.com";

function App() {
  const [simulationState, setSimulationState] = useState("idle");
  const [scenario, setScenario] = useState([]);
  const [activeAgents, setActiveAgents] = useState([]);
  const [objective, setObjective] = useState("");
  const [tokenUsage] = useState({ tokens: 0, cost: 0 });
  const [locusSessionId, setLocusSessionId] = useState(null);
  const [activeView, setActiveView] = useState("home");
  const [selectedAgents, setSelectedAgents] = useState(DEFAULT_SELECTED_AGENTS);
  const [treasurySummary, setTreasurySummary] = useState(null);
  const [lastPayout, setLastPayout] = useState(null);

  const selectedAgentLabels = AGENT_CATALOG.filter((agent) =>
    selectedAgents.includes(agent.id),
  ).map((agent) => agent.name);
  const selectedAgentCharge = (
    selectedAgents.length * AGENT_PRICE_PER_CALL
  ).toFixed(2);

  const fetchTreasurySummary = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/treasury/summary`);
      const data = await response.json();
      setTreasurySummary(data);
    } catch (error) {
      console.error("Failed to fetch treasury summary:", error);
    }
  };

  useEffect(() => {
    fetchTreasurySummary();
    const intervalId = setInterval(fetchTreasurySummary, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const resetSession = () => {
    setSimulationState("idle");
    setScenario([]);
    setObjective("");
    setActiveAgents([]);
    setLocusSessionId(null);
    setActiveView("home");
    setSelectedAgents(DEFAULT_SELECTED_AGENTS);
  };

  const toggleAgentSelection = (agentId) => {
    setSelectedAgents((currentSelectedAgents) =>
      currentSelectedAgents.includes(agentId)
        ? currentSelectedAgents.length === 1
          ? currentSelectedAgents
          : currentSelectedAgents.filter(
              (selectedAgent) => selectedAgent !== agentId,
            )
        : [...currentSelectedAgents, agentId],
    );
  };

  const startCheckout = async (inputObjective, agentsToRun) => {
    if (!inputObjective) return;
    setObjective(inputObjective);
    setActiveView("home");

    try {
      const response = await fetch(`${BACKEND_URL}/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: inputObjective,
          selected_agents: agentsToRun,
        }),
      });
      const data = await response.json();
      if (data.sessionId) {
        setLocusSessionId(data.sessionId);
        if (data.sessionId.startsWith("test_session")) {
          setTimeout(() => {
            setLocusSessionId(null);
            runSimulation(inputObjective, agentsToRun);
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Checkout creation failed:", error);
    }
  };

  const runSimulation = async (inputObjective, agentsToRun) => {
    setSimulationState("running");
    setScenario([]);
    setActiveAgents([]);
    setLocusSessionId(null);
    setActiveView("home");

    try {
      const response = await fetch(`${BACKEND_URL}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: inputObjective,
          selected_agents: agentsToRun,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "step") {
                setScenario((prev) => [...prev, data]);
                setActiveAgents((prev) =>
                  prev.includes(data.agent) ? prev : [...prev, data.agent],
                );
              } else if (data.type === "payout") {
                setLastPayout(data);
              } else if (data.type === "final") {
                setSimulationState("resolved");
                fetchTreasurySummary();
              }
            } catch (error) {
              console.error("Error parsing SSE data:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Simulation failed:", error);
      setSimulationState("idle");
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onNewSession={resetSession}
        onRecentSessionSelect={(sessionName) => {
          setObjective(sessionName);
          setActiveView("home");
        }}
      />

      <main className="main-content">
        {activeView === "home" && (
          <Feed
            simulationState={simulationState}
            scenario={scenario}
            startSimulation={startCheckout}
            bypassSimulation={runSimulation}
            objective={objective}
            activeAgents={activeAgents}
            selectedAgents={selectedAgents}
            onToggleAgent={toggleAgentSelection}
            agentCatalog={AGENT_CATALOG}
            selectedAgentCharge={selectedAgentCharge}
          />
        )}

        {activeView === "agents" && (
          <AgentsView
            activeAgents={activeAgents}
            scenario={scenario}
            objective={objective}
            onStartChat={() => setActiveView("home")}
          />
        )}

        {activeView === "analytics" && (
          <AnalyticsView
            scenario={scenario}
            activeAgents={activeAgents}
            tokenUsage={tokenUsage}
            simulationState={simulationState}
            onStartChat={() => setActiveView("home")}
          />
        )}

        {activeView === "settings" && (
          <SettingsView onNewSession={resetSession} />
        )}
      </main>

      {activeView === "home" ? (
        <aside className="right-context-panel">
          <ContextPanel
            objective={objective}
            activeAgents={activeAgents}
            tokenUsage={tokenUsage}
            simulationState={simulationState}
            selectedAgents={selectedAgents}
            agentCatalog={AGENT_CATALOG}
            selectedAgentCharge={selectedAgentCharge}
            selectedAgentLabels={selectedAgentLabels}
            treasurySummary={treasurySummary}
            lastPayout={lastPayout}
          />
        </aside>
      ) : null}

      {locusSessionId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(2,6,23,0.78)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="checkout-modal">
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "#60a5fa",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  marginBottom: "8px",
                }}
              >
                Payment Required
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "white",
                  margin: 0,
                }}
              >
                Authorize Session
              </h2>
              <p
                style={{ fontSize: "14px", color: "#94a3b8", marginTop: "8px" }}
              >
                Pay {selectedAgentCharge} USDC to activate the selected agents.
              </p>
            </div>

            {locusSessionId.startsWith("test_session") ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#60a5fa",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    animation: "pulse 1.5s infinite",
                  }}
                >
                  Developer mode: automating payment...
                </div>
              </div>
            ) : (
              <LocusCheckout
                sessionId={locusSessionId}
                checkoutUrl="https://beta-checkout.paywithlocus.com"
                onSuccess={() => runSimulation(objective, selectedAgents)}
                mode="embedded"
              />
            )}

            <button
              onClick={() => runSimulation(objective, selectedAgents)}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "12px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#334155";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1e293b";
              }}
            >
              Skip Payment (Test Mode)
            </button>

            <button
              onClick={() => setLocusSessionId(null)}
              style={{
                width: "100%",
                marginTop: "16px",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
