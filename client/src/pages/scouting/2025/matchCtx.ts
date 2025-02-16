import { createContext } from "react";
import { MatchContextType } from "./match";

export const MatchContext = createContext<MatchContextType | null>(null);
