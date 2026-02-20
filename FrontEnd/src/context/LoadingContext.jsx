import { createContext, useContext, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => {
    setIsLoading(true);
    document.body.style.overflow = "hidden";
  };

  const hideLoading = () => {
    setIsLoading(false);
    document.body.style.overflow = "auto";
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      {isLoading && <LoadingSpinner />}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
