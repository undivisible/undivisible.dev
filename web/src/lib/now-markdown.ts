import { nowMarkdownFromRepo } from "@/data/now-markdown.generated";

export function getNowMarkdown(): string | null {
  return nowMarkdownFromRepo;
}
