import type { ReactNode } from "react";
import { C, sans } from "@/components/brief/ui/constants";
import { Ft } from "@/components/brief/ui/Ft";
import { CHROME, PAGE_H, PAGE_W, pt } from "@/components/home/print/print-metrics";

export function PrintPage({
  children,
  page,
  total,
  surface = "cream",
}: {
  children: ReactNode;
  page: number;
  total: number;
  surface?: "cream" | "alt";
}) {
  const bg = surface === "alt" ? C.bgAlt : C.cream;
  return (
    <div
      className="page-wrapper"
      style={{
        width: PAGE_W,
        height: PAGE_H,
        background: bg,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: PAGE_W,
          height: PAGE_H,
          background: bg,
          color: C.black,
          display: "flex",
          flexDirection: "column",
          fontFamily: sans,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {children}
        <Ft
          left="Max Carter — Resume"
          right={`undivisible.dev · ${page}/${total}`}
          fontSize={CHROME.ft}
        />
      </div>
    </div>
  );
}
