import type { ReactNode } from "react";
import { C, mono } from "@/components/brief/ui/constants";

export function Tb({
  left,
  right,
  dark,
  fontSize = 6,
}: {
  left: ReactNode;
  right: ReactNode;
  dark?: boolean;
  fontSize?: number;
}) {
  return (
    <div
      style={{
        background: dark ? C.orange : C.black,
        padding: "7px 26px",
        height: 20,
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          textTransform: "uppercase",
          color: dark ? "rgba(10,10,10,0.6)" : "rgba(255,248,230,0.38)",
          whiteSpace: "nowrap",
        }}
      >
        {left}
      </span>
      <span
        style={{
          fontFamily: mono,
          fontSize,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          textTransform: "uppercase",
          color: dark ? C.black : C.orange,
          whiteSpace: "nowrap",
          fontWeight: dark ? 600 : 400,
        }}
      >
        {right}
      </span>
    </div>
  );
}
