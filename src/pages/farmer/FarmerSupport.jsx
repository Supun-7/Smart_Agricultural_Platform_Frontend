import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { BASE_URL } from "../../services/api.js";
import "../../styles/pages/farmerSupport.css";

const WELCOME =
  "ආයුබෝවන්! 🌾 මම CHC ගොවි තාක්ෂණික සහාය සේවාවයි.\n\nඩෑශ්බෝඩ් ගැටළු, ඉඩම් ලියාපදිංචිය, සාක්ෂි උඩුගත් කිරීම, හෝ ගෙවීම් පිළිබඳ ඔබට කෙසේ උදව් කළ හැකිද?";

const CHIPS = [
  "ඩෑශ්බෝඩ් නොපෙනේ",
  "ඉඩම් ලියාපදිංචිය කෙසේද?",
  "සාක්ෂි upload කරන්නේ කෙසේද?",
  "ගෙවීම ප්‍රමාද වෙලා",
];

function timestamp() {
  return new Date().toLocaleTimeString("si-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FarmerSupport() {
  const { token } = useAuth();

  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME, ts: timestamp() },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  async function send() {
    const trimmed = input.trim();
    setError(null);

    if (!trimmed) {
      setError("කරුණාකර ඔබේ ප්‍රශ්නය ටයිප් කරන්න.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed, ts: timestamp() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/chatbot/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.success
            ? data.reply
            : "සමාවෙන්න, දෝෂයක් ඇති විය. නැවත උත්සාහ කරන්න.",
          ts: timestamp(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "සේවාවට සම්බන්ධ වීමට නොහැකි විය. ඔබේ internet සම්බන්ධතාව පරීක්ෂා කරන්න.",
          ts: timestamp(),
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  async function clearChat() {
    try {
      await fetch(`${BASE_URL}/chatbot/history`, {
        method: "DELETE",
      });
    } catch {
      // silent — still reset UI
    }
    setMessages([{ role: "assistant", content: WELCOME, ts: timestamp() }]);
    setError(null);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleChip(text) {
    setInput(text);
    textareaRef.current?.focus();
  }

  return (
    <div className="fs-shell" role="main" aria-label="24/7 AI Farmer Support">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="fs-header">
        <div className="fs-header-left">
          <div className="fs-avatar-ring">
            <span className="fs-avatar-icon">🌾</span>
            <span className="fs-online-dot" aria-label="Online" />
          </div>
          <div>
            <div className="fs-title">CHC ගොවි සහාය</div>
            <div className="fs-subtitle">24/7 Support · Powered by AI</div>
          </div>
        </div>
        <button
          className="fs-clear-btn"
          onClick={clearChat}
          aria-label="Start new conversation"
        >
          නව සංවාදය
        </button>
      </div>

      {/* ── Messages ──────────────────────────────────────── */}
      <div className="fs-messages" role="log" aria-live="polite">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={"fs-row " + (msg.role === "user" ? "fs-row--user" : "fs-row--bot")}
          >
            {msg.role === "assistant" && (
              <div className="fs-bot-icon" aria-hidden="true">🌾</div>
            )}
            <div className="fs-bubble-wrap">
              <div
                className={
                  "fs-bubble " +
                  (msg.role === "user" ? "fs-bubble--user" : "fs-bubble--bot")
                }
              >
                {msg.content.split("\n").map((line, j) =>
                  line ? (
                    <p key={j} style={{ margin: 0 }}>{line}</p>
                  ) : (
                    <br key={j} />
                  )
                )}
              </div>
              <div className="fs-ts">{msg.ts}</div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="fs-row fs-row--bot">
            <div className="fs-bot-icon" aria-hidden="true">🌾</div>
            <div className="fs-bubble fs-bubble--bot fs-typing" aria-label="Thinking">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick chips — only shown at start ─────────────── */}
      {messages.length <= 2 && !loading && (
        <div className="fs-chips" aria-label="Quick questions">
          {CHIPS.map((chip) => (
            <button key={chip} className="fs-chip" onClick={() => handleChip(chip)}>
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── Validation error ───────────────────────────────── */}
      {error && (
        <div className="fs-error" role="alert">{error}</div>
      )}

      {/* ── Input bar ─────────────────────────────────────── */}
      <div className="fs-input-bar">
        <textarea
          ref={textareaRef}
          className="fs-textarea"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(null); }}
          onKeyDown={handleKeyDown}
          placeholder="ඔබේ ප්‍රශ්නය ටයිප් කරන්න…  (Enter = යවන්න)"
          aria-label="Type your question"
          rows={1}
          disabled={loading}
        />
        <button
          className="fs-send-btn"
          onClick={send}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <div className="fs-footer">
        සිංහල හෝ English භාවිතා කරන්න · Shift+Enter නව රේඛාව
      </div>
    </div>
  );
}
