"use client";

export default function MicButton({
  onPress,
  onRelease,
  active,
}: {
  onPress?: () => void;
  onRelease?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={active ? onRelease : undefined}
      onTouchStart={onPress}
      onTouchEnd={onRelease}
      style={{
        marginTop: 48,
        width: 120,
        height: 52,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.35)",
        background: active ? "white" : "transparent",
        color: active ? "#000" : "white",
        fontSize: 13,
        letterSpacing: "0.12em",
        cursor: "pointer",
        transition: "all 0.25s ease",
        opacity: active ? 0.85 : 1,
        userSelect: "none",
      }}
    >
      {active ? "Hablando…" : "Mantén para hablar"}
    </button>
  );
}
