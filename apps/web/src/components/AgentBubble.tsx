export default function AgentBubble({ text }: { text: string }) {
  return (
    <div
      style={{
        maxWidth: 560,
        marginBottom: 28,
        padding: "16px 20px",
        borderRadius: "18px 18px 18px 6px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        color: "rgba(255,255,255,0.92)",
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      {text}
    </div>
  );
}
