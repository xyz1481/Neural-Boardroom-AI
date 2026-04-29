import React from "react";
import {
  ChevronDown,
  LayoutGrid,
  MessageSquareText,
  Plus,
  Sparkles,
  Settings,
  Search,
} from "lucide-react";

export function Sidebar({
  activeView,
  onNavigate,
  onNewSession,
  onRecentSessionSelect,
}) {
  const recentSessions = [
    "SaaS Market Entry",
    "Product Launch Strategy",
    "Hiring Roadmap Q4",
    "Competitive Analysis",
  ];

  return (
    <aside className="sidebar-shell">
      <div className="sidebar-top">
        <button
          className="brand-pill"
          type="button"
          onClick={() => onNavigate("home")}
        >
          <span className="brand-mark">B</span>
          <span className="brand-copy">
            <strong>Boardroom AI</strong>
            <small>Strategic workspace</small>
          </span>
          <ChevronDown size={14} />
        </button>

        <button className="primary-action" onClick={onNewSession}>
          <Plus size={16} />
          New chat
        </button>

        <div className="sidebar-search">
          <Search size={14} />
          <span>Search chats</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <button
          className={`nav-item ${activeView === "home" ? "active" : ""}`}
          onClick={() => onNavigate("home")}
          type="button"
        >
          <MessageSquareText size={16} />
          Home
        </button>
        <button
          className={`nav-item ${activeView === "agents" ? "active" : ""}`}
          onClick={() => onNavigate("agents")}
          type="button"
        >
          <LayoutGrid size={16} />
          Agents
        </button>
        <button
          className={`nav-item ${activeView === "analytics" ? "active" : ""}`}
          onClick={() => onNavigate("analytics")}
          type="button"
        >
          <Sparkles size={16} />
          Analytics
        </button>
        <button
          className={`nav-item ${activeView === "settings" ? "active" : ""}`}
          onClick={() => onNavigate("settings")}
          type="button"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>

      <div className="sidebar-section-title">Recent chats</div>
      {recentSessions.map((s, i) => (
        <button
          key={i}
          className="recent-chat-item"
          type="button"
          onClick={() => onRecentSessionSelect(s)}
        >
          <span>{s}</span>
          <span className="recent-chat-meta">Draft</span>
        </button>
      ))}

      <div className="sidebar-footer">
        <div className="user-avatar">U</div>
        <div className="user-copy">
          <span>Neural User</span>
          <small>Pro plan</small>
        </div>
      </div>
    </aside>
  );
}
