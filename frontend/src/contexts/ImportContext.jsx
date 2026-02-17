import { createContext, useContext, useState, useCallback } from 'react';

const ImportContext = createContext();

export const useImport = () => {
  const context = useContext(ImportContext);
  if (!context) {
    throw new Error('useImport must be used within ImportProvider');
  }
  return context;
};

export const ImportProvider = ({ children }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);

  const startImport = useCallback((filename) => {
    setIsImporting(true);
    setImportProgress({ filename, status: 'importing' });
  }, []);

  const completeImport = useCallback((result) => {
    setIsImporting(false);
    setImportProgress({ ...result, status: 'completed' });
    // Clear progress after 5 seconds
    setTimeout(() => setImportProgress(null), 5000);
  }, []);

  const failImport = useCallback((error) => {
    setIsImporting(false);
    setImportProgress({ error: error.message, status: 'failed' });
    // Clear progress after 5 seconds
    setTimeout(() => setImportProgress(null), 5000);
  }, []);

  const clearImport = useCallback(() => {
    setIsImporting(false);
    setImportProgress(null);
  }, []);

  return (
    <ImportContext.Provider
      value={{
        isImporting,
        importProgress,
        startImport,
        completeImport,
        failImport,
        clearImport,
      }}
    >
      {children}
    </ImportContext.Provider>
  );
};
