import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import Page from "@/app/lab/signal/page";

hydrateRoot(document.body, createElement(Page));
