import { C } from "@/components/brief/ui/constants";

export function Rule({ color = C.rule }: { color?: string }) {
  return <div style={{ flex: 1, height: 1, background: color }} />;
}
