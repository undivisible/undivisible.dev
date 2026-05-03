import { C, mono } from "@/components/brief/ui/constants";

export function Ft({ left, right, dark }: { left: string; right: string; dark?: boolean }) {
  return (
    <div style={{
      background: dark ? C.orange : C.black,
      borderTop: dark ? "none" : `1px solid rgba(255,87,5,0.22)`,
      padding: "5px 26px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: mono, fontSize: 5.5, letterSpacing: "-0.05em", textTransform: "uppercase", color: dark ? "rgba(10,10,10,0.55)" : "rgba(255,248,230,0.2)", whiteSpace: "nowrap" }}>{left}</span>
      <a href="https://undivisible.dev" style={{ fontFamily: mono, fontSize: 5.5, letterSpacing: "-0.05em", textTransform: "uppercase", color: dark ? C.black : C.orange, whiteSpace: "nowrap", fontWeight: dark ? 600 : 400, textDecoration: "none" }}>{right}</a>
    </div>
  );
}
