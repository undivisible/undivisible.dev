import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import NotFound from "@/app/not-found";

hydrateRoot(document.body, createElement(NotFound));
