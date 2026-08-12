import { C, mono } from "@/components/brief/ui/constants";

export function Tb({ left, right, dark }: { left: string; right: string; dark?: boolean }) {
  return (
    <div style={{
      background: dark ? C.orange : C.black,
      padding: "7px 26px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: mono, fontSize: 6, letterSpacing: "-0.05em", textTransform: "uppercase", color: dark ? "rgba(10,10,10,0.6)" : "rgba(255,248,230,0.38)", whiteSpace: "nowrap" }}>{left}</span>
      <span style={{ fontFamily: mono, fontSize: 6, letterSpacing: "-0.05em", textTransform: "uppercase", color: dark ? C.black : C.orange, whiteSpace: "nowrap", fontWeight: dark ? 600 : 400 }}>{right}</span>
    </div>
  );
}
