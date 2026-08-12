import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import Page from "@/app/page";

hydrateRoot(document.body, createElement(Page));
