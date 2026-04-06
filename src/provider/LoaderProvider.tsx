import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import "../common/loader.css";

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
  const [activeSources, setActiveSources] = useState<Set<string>>(new Set());

  const setLoading = useCallback((isLoading: boolean, source: string = "unknown") => {
    setActiveSources(prev => {
      if (isLoading && prev.has(source)) return prev;
      if (!isLoading && !prev.has(source)) return prev;

      const next = new Set(prev);
      if (isLoading) {
        next.add(source);
      } else {
        next.delete(source);
      }
      return next;
    });
  }, []);

  const loading = activeSources.size > 0;

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {loading && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(2px)'
          }}
        >
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
