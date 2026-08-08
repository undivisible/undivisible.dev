import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import Page from "@/app/lab/atlas/page";

hydrateRoot(document.body, createElement(Page));
