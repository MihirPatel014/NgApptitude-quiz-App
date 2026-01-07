import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the shape of the loader context
interface LoaderContextType {
  loading: boolean;
  setLoading: (loading: boolean, source?: string) => void;
}

// Create the context with an initial undefined value
const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

// Define the props type for the provider
interface LoaderProviderProps {
  children: ReactNode;
}

export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
  const [loading, setLoadingState] = useState<boolean>(false);
  const [loadingSource, setLoadingSource] = useState<string>("unknown");

  const setLoading = (newLoading: boolean, source: string = "unknown") => {
    const timestamp = new Date().toLocaleTimeString();

    setLoadingState(newLoading);
    setLoadingSource(source);
  };

  useEffect(() => {

  }, [loading, loadingSource]);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="loader"></div>
        </div>
      )}
      {children}
    </LoaderContext.Provider>
  );
};

// Custom hook to use the LoaderContext
export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
