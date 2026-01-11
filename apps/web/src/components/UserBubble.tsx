export default function UserBubble({ text }: { text: string }) {
  return (
    <div
      style={{
        maxWidth: 560,
        marginBottom: 28,
        marginLeft: "auto",
        padding: "16px 20px",
        borderRadius: "18px 18px 6px 18px",
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
        color: "rgba(255,255,255,0.9)",
        fontSize: 15,
        lineHeight: 1.6,
        textAlign: "right",
      }}
    >
      {text}
    </div>
  );
}
