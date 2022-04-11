import { createContext } from "react";

interface SidebarContextInterface {
  doneAnimating: boolean;
}

export const SidebarContext = createContext<SidebarContextInterface>({
  doneAnimating: false,
});
