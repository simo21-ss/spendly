import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, ArrowRight, FileText, History, Trash2, X } from 'lucide-react';
import Papa from 'papaparse';
import { createTransactionImport, bulkCreateTransactions, getTransactionImports, deleteTransactionImport } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useImport } from '../contexts/ImportContext';
import './Import.css';

const STEPS = {
  UPLOAD: 'upload',
  MAPPING: 'mapping',
  VALIDATION: 'validation',
  IMPORTING: 'importing',
  COMPLETE: 'complete'
};

export default function ImportPage() {
  const navigate = useNavigate();
  const { startImport, completeImport, failImport } = useImport();
  
  // File and parsing state
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [parseError, setParseError] = useState(null);
  
  // Flow state
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
  const [isDragging, setIsDragging] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Mapping state
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    description: '',
    amount: '',
    merchant: '',
    notes: ''
  });
  
  // Validation state
  const [validatedTransactions, setValidatedTransactions] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Import state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState(new Set());

  // Import history state
  const [imports, setImports] = useState([]);
  const [importsLoading, setImportsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load import history
  useEffect(() => {
    loadImports();
  }, []);

  useEffect(() => {
    if (!isImportModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isImportModalOpen]);

  const loadImports = async () => {
    try {
      setImportsLoading(true);
      const data = await getTransactionImports({ 
        take: 10, 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      });
      setImports(data.imports || []);
    } catch (err) {
      console.error('Failed to load imports:', err);
    } finally {
      setImportsLoading(false);
    }
  };

  const handleDeleteClick = (importRecord) => {
    setDeleteConfirm(importRecord);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteTransactionImport(deleteConfirm.id, true);
      setImports(imports.filter(imp => imp.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete import: ' + err.message);
      setDeleteConfirm(null);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  // Process uploaded file
  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setParseError(null);
    
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    setFileType(fileExtension);

    if (fileExtension === 'csv') {
      parseCSV(selectedFile);
    } else if (fileExtension === 'json') {
      parseJSON(selectedFile);
    } else {
      setParseError('Unsupported file type. Please upload a CSV or JSON file.');
    }
  };

  // Parse CSV file
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }
        
        const fileHeaders = results.meta.fields || [];
        setHeaders(fileHeaders);
        setParsedData(results.data);
        
        // Auto-detect column mapping
        autoDetectColumns(fileHeaders);
        setCurrentStep(STEPS.MAPPING);
        setIsImportModalOpen(true);
      },
      error: (error) => {
        setParseError(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  // Parse JSON file
  const parseJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const dataArray = Array.isArray(json) ? json : [json];
        
        if (dataArray.length === 0) {
          setParseError('JSON file is empty');
          return;
        }
        
        const fileHeaders = Object.keys(dataArray[0]);
        setHeaders(fileHeaders);
        setParsedData(dataArray);
        
        // Auto-detect column mapping
        autoDetectColumns(fileHeaders);
        setCurrentStep(STEPS.MAPPING);
        setIsImportModalOpen(true);
      } catch (error) {
        setParseError(`Failed to parse JSON: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Auto-detect column mapping based on header names
  const autoDetectColumns = (fileHeaders) => {
    const mapping = {
      date: '',
      description: '',
      amount: '',
      merchant: '',
      notes: ''
    };

    fileHeaders.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      if (!mapping.date && (lowerHeader.includes('date') || lowerHeader === 'when')) {
        mapping.date = header;
      }
      if (!mapping.description && (lowerHeader.includes('description') || lowerHeader.includes('desc') || lowerHeader.includes('details'))) {
        mapping.description = header;
      }
      if (!mapping.amount && (lowerHeader.includes('amount') || lowerHeader === 'value' || lowerHeader === 'total')) {
        mapping.amount = header;
      }
      if (!mapping.merchant && (lowerHeader.includes('merchant') || lowerHeader.includes('payee') || lowerHeader.includes('vendor'))) {
        mapping.merchant = header;
      }
      if (!mapping.notes && (lowerHeader.includes('note') || lowerHeader.includes('memo') || lowerHeader.includes('comment'))) {
        mapping.notes = header;
      }
    });

    setColumnMapping(mapping);
  };

  // Handle column mapping change
  const handleMappingChange = (field, column) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: column
    }));
  };

  // Validate mapping and proceed to validation
  const handleMapColumns = () => {
    // Check required fields
    if (!columnMapping.date || !columnMapping.description || !columnMapping.amount) {
      alert('Please map all required fields: Date, Description, and Amount');
      return;
    }

    validateTransactions();
  };

  // Validate transactions
  const validateTransactions = () => {
    setCurrentStep(STEPS.VALIDATION);
    
    const validated = [];
    const errors = [];

    parsedData.forEach((row, index) => {
      const transaction = {
        date: row[columnMapping.date],
        description: row[columnMapping.description],
        amount: row[columnMapping.amount],
        merchant: columnMapping.merchant ? row[columnMapping.merchant] : null,
        notes: columnMapping.notes ? row[columnMapping.notes] : null
      };

      // Validate required fields
      if (!transaction.date || !transaction.description || !transaction.amount) {
        errors.push({
          row: index + 1,
          error: 'Missing required field',
          data: transaction
        });
        return;
      }

      // Validate and parse date
      const dateObj = new Date(transaction.date);
      if (isNaN(dateObj.getTime())) {
        errors.push({
          row: index + 1,
          error: 'Invalid date format',
          data: transaction
        });
        return;
      }

      // Validate and parse amount
      let amountStr = String(transaction.amount).replace(/[$,€£]/g, '').trim();
      // Handle parentheses for negative (accounting format)
      if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
        amountStr = '-' + amountStr.slice(1, -1);
      }
      const amountNum = parseFloat(amountStr);
      
      if (isNaN(amountNum)) {
        errors.push({
          row: index + 1,
          error: 'Invalid amount format',
          data: transaction
        });
        return;
      }

      validated.push({
        ...transaction,
        date: dateObj.toISOString(),
        amount: amountNum
      });
    });

    setValidatedTransactions(validated);
    setValidationErrors(errors);
  };

  // Proceed to import
  const handleImport = async () => {
    try {
      setImporting(true);
      setCurrentStep(STEPS.IMPORTING);
      setParseError(null);
      
      startImport(file.name);

      // Create transaction import record
      const importRecord = await createTransactionImport({
        filename: file.name,
        fileType: fileType,
        totalRows: parsedData.length,
        validRows: validatedTransactions.length,
        columnMapping: columnMapping
      });

      // Bulk create transactions
      const result = await bulkCreateTransactions(
        importRecord.id,
        validatedTransactions
      );

      setImportResult(result);
      
      // If there are duplicates, show them for user decision
      if (result.duplicates && result.duplicates.length > 0) {
        setDuplicates(result.duplicates);
        setSelectedDuplicates(new Set());
        setImporting(false);
      } else {
        completeImport({ filename: file.name, imported: result.imported });
        setCurrentStep(STEPS.COMPLETE);
        loadImports(); // Reload import history
        setImporting(false);
      }
    } catch (error) {
      console.error('Import failed:', error);
      failImport(error);
      setParseError(`Import failed: ${error.message}`);
      setCurrentStep(STEPS.VALIDATION); // Go back to validation step
      setImporting(false);
    }
  };

  // Handle duplicate selection
  const toggleDuplicate = (rowIndex) => {
    setSelectedDuplicates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  };

  // Import selected duplicates
  const handleImportDuplicates = async () => {
    try {
      setImporting(true);
      
      // Get transactions for selected duplicates
      const transactionsToImport = duplicates
        .filter(dup => selectedDuplicates.has(dup.row))
        .map(dup => dup.new);

      if (transactionsToImport.length === 0) {
        completeImport({ filename: file.name, imported: importResult.imported });
        setCurrentStep(STEPS.COMPLETE);
        loadImports();
        setImporting(false);
        return;
      }

      // Import selected duplicates
      const result = await bulkCreateTransactions(
        importResult.transactionImportId,
        transactionsToImport
      );

      // Update import result
      setImportResult(prev => ({
        ...prev,
        imported: prev.imported + result.imported
      }));

      completeImport({ filename: file.name, imported: (importResult.imported || 0) + result.imported });
      setCurrentStep(STEPS.COMPLETE);
      loadImports(); // Reload import history
    } catch (error) {
      console.error('Failed to import duplicates:', error);
      failImport(error);
      setParseError(`Failed to import duplicates: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Skip duplicates and complete
  const handleSkipDuplicates = () => {
    completeImport({ filename: file.name, imported: importResult.imported });
    setCurrentStep(STEPS.COMPLETE);
    loadImports(); // Reload import history
  };

  // Reset to start over
  const handleReset = () => {
    setFile(null);
    setFileType(null);
    setParsedData([]);
    setHeaders([]);
    setParseError(null);
    setCurrentStep(STEPS.UPLOAD);
    setColumnMapping({
      date: '',
      description: '',
      amount: '',
      merchant: '',
      notes: ''
    });
    setValidatedTransactions([]);
    setValidationErrors([]);
    setImporting(false);
    setImportResult(null);
    setDuplicates([]);
    setSelectedDuplicates(new Set());
    setIsImportModalOpen(false);
  };

  const handleModalClose = () => {
    if (importing) return;
    handleReset();
  };

  const getModalStepKey = () => {
    if (duplicates.length > 0 && currentStep === STEPS.IMPORTING) {
      return 'duplicates';
    }
    return currentStep;
  };

  const getModalStepLabel = (step) => {
    switch (step) {
      case STEPS.MAPPING:
        return 'Map columns';
      case STEPS.VALIDATION:
        return 'Validate data';
      case STEPS.IMPORTING:
        return 'Importing';
      case 'duplicates':
        return 'Resolve duplicates';
      case STEPS.COMPLETE:
        return 'Complete';
      default:
        return 'Import';
    }
  };

  const renderImportLauncher = () => (
    <div className="import-quick">
      <div
        className={`upload-zone upload-zone--compact ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={36} />
        <div className="upload-zone__text">
          <h3>Drop a CSV or JSON file</h3>
          <p>We will guide you through mapping and validation</p>
        </div>
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input" className="btn btn-primary">
          Choose File
        </label>
      </div>

      {parseError && (
        <div className="error-message">
          <XCircle size={20} />
          <span>{parseError}</span>
        </div>
      )}
    </div>
  );

  // Render mapping step
  const renderMappingStep = () => (
    <div className="import-mapping">
      <div className="mapping-header">
        <FileText size={24} />
        <div>
          <h2>Map Columns</h2>
          <p>Match your file columns to transaction fields</p>
        </div>
      </div>

      <div className="mapping-grid">
        {/* Required fields */}
        <div className="mapping-field required">
          <label>Date *</label>
          <select
            value={columnMapping.date}
            onChange={(e) => handleMappingChange('date', e.target.value)}
          >
            <option value="">-- Select Column --</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div className="mapping-field required">
          <label>Description *</label>
          <select
            value={columnMapping.description}
            onChange={(e) => handleMappingChange('description', e.target.value)}
          >
            <option value="">-- Select Column --</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div className="mapping-field required">
          <label>Amount *</label>
          <select
            value={columnMapping.amount}
            onChange={(e) => handleMappingChange('amount', e.target.value)}
          >
            <option value="">-- Select Column --</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        {/* Optional fields */}
        <div className="mapping-field">
          <label>Merchant</label>
          <select
            value={columnMapping.merchant}
            onChange={(e) => handleMappingChange('merchant', e.target.value)}
          >
            <option value="">-- Select Column --</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div className="mapping-field">
          <label>Notes</label>
          <select
            value={columnMapping.notes}
            onChange={(e) => handleMappingChange('notes', e.target.value)}
          >
            <option value="">-- Select Column --</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="mapping-preview">
        <h3>Preview (first 5 rows)</h3>
        <div className="preview-table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Merchant</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.slice(0, 5).map((row, idx) => (
                <tr key={idx}>
                  <td>{columnMapping.date ? row[columnMapping.date] : '-'}</td>
                  <td>{columnMapping.description ? row[columnMapping.description] : '-'}</td>
                  <td>{columnMapping.amount ? row[columnMapping.amount] : '-'}</td>
                  <td>{columnMapping.merchant ? row[columnMapping.merchant] : '-'}</td>
                  <td>{columnMapping.notes ? row[columnMapping.notes] : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mapping-actions">
        <button onClick={handleReset} className="btn btn-secondary">
          Cancel
        </button>
        <button onClick={handleMapColumns} className="btn btn-primary">
          Validate & Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  // Render validation step
  const renderValidationStep = () => (
    <div className="import-validation">
      {parseError && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{parseError}</span>
        </div>
      )}
      
      <div className="validation-summary">
        <div className="summary-card success">
          <CheckCircle size={24} />
          <div>
            <div className="summary-number">{validatedTransactions.length}</div>
            <div className="summary-label">Valid Transactions</div>
          </div>
        </div>

        <div className="summary-card error">
          <XCircle size={24} />
          <div>
            <div className="summary-number">{validationErrors.length}</div>
            <div className="summary-label">Validation Errors</div>
          </div>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h3>
            <AlertCircle size={20} />
            Validation Errors
          </h3>
          <div className="errors-list">
            {validationErrors.slice(0, 10).map((error, idx) => (
              <div key={idx} className="error-item">
                <strong>Row {error.row}:</strong> {error.error}
                <div className="error-data">
                  {JSON.stringify(error.data, null, 2)}
                </div>
              </div>
            ))}
            {validationErrors.length > 10 && (
              <p className="muted">... and {validationErrors.length - 10} more errors</p>
            )}
          </div>
        </div>
      )}

      <div className="validation-actions">
        <button onClick={handleReset} className="btn btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleImport}
          className="btn btn-primary"
          disabled={validatedTransactions.length === 0 || importing}
        >
          {importing ? 'Importing...' : `Import ${validatedTransactions.length} Transactions`}
        </button>
      </div>
    </div>
  );

  // Render importing step
  const renderImportingStep = () => (
    <div className="import-progress">
      {!parseError ? (
        <>
          <div className="spinner"></div>
          <h2>Importing transactions...</h2>
          <p>Please wait while we process your data</p>
        </>
      ) : (
        <>
          <XCircle size={64} className="error-icon" />
          <h2>Import Failed</h2>
          <p className="error-text">{parseError}</p>
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentStep(STEPS.VALIDATION)}
          >
            Go Back to Validation
          </button>
        </>
      )}
    </div>
  );

  // Render duplicates step
  const renderDuplicatesStep = () => (
    <div className="import-duplicates">
      <div className="duplicates-header">
        <AlertCircle size={32} />
        <h2>Duplicate Transactions Found</h2>
        <p>
          {duplicates.length} transaction(s) appear to be duplicates.
          Select which ones you want to import anyway.
        </p>
      </div>

      <div className="duplicates-list">
        {duplicates.map((dup, idx) => (
          <div key={idx} className="duplicate-item">
            <input
              type="checkbox"
              checked={selectedDuplicates.has(dup.row)}
              onChange={() => toggleDuplicate(dup.row)}
              id={`dup-${idx}`}
            />
            <label htmlFor={`dup-${idx}`}>
              <div className="duplicate-info">
                <strong>Row {dup.row}</strong>
                <div>{dup.new.description}</div>
                <div className="duplicate-details">
                  {new Date(dup.new.date).toLocaleDateString()} • ${dup.new.amount}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="duplicates-actions">
        <button onClick={handleSkipDuplicates} className="btn btn-secondary">
          Skip All Duplicates
        </button>
        <button
          onClick={handleImportDuplicates}
          className="btn btn-primary"
          disabled={selectedDuplicates.size === 0}
        >
          Import {selectedDuplicates.size} Selected
        </button>
      </div>
    </div>
  );

  // Render complete step
  const renderCompleteStep = () => (
    <div className="import-complete">
      <CheckCircle size={64} className="success-icon" />
      <h2>Import Complete!</h2>

      {importResult && (
        <div className="import-summary">
          <div className="summary-item">
            <span className="summary-label">Imported:</span>
            <span className="summary-value success">{importResult.imported}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Skipped (duplicates):</span>
            <span className="summary-value muted">{importResult.skipped}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Errors:</span>
            <span className="summary-value error">{importResult.errors}</span>
          </div>
        </div>
      )}

      <div className="complete-actions">
        <button onClick={handleReset} className="btn btn-secondary">
          Import Another File
        </button>
        <button
          onClick={() => navigate('/transactions')}
          className="btn btn-primary"
        >
          View Transactions
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeader__icon">
          <Upload />
        </div>
        <div className="pageHeader__text">
          <h1 className="pageTitle">Import Data</h1>
          <p className="muted">
            Import transactions from CSV or JSON files
          </p>
        </div>
      </header>

      {/* Import History */}
      <div className="panel imports-history">
        <div className="imports-history-header">
          <div className="imports-history-title">
            <History size={20} />
            <h3>Recent Imports</h3>
          </div>
        </div>
        {renderImportLauncher()}
        {importsLoading ? (
          <p className="loading-text">Loading import history...</p>
        ) : imports.length === 0 ? (
          <p className="empty-text">No imports yet</p>
        ) : (
          <div className="imports-list">
            {imports.map((imp) => (
                <div key={imp.id} className="import-item">
                  <div className="import-item__info">
                    <div className="import-item__filename">{imp.filename}</div>
                    <div className="import-item__meta">
                      <span className={`status-badge status-${imp.status}`}>
                        {imp.status}
                      </span>
                      <span className="import-item__date">
                        {new Date(imp.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="import-item__count">
                        {imp.importedCount || 0} imported
                      </span>
                    </div>
                  </div>
                  <div className="import-item__actions">
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDeleteClick(imp)}
                      title="Delete import"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {isImportModalOpen && (
        <>
          <div className="importFlowOverlay" onClick={handleModalClose} />
          <div className="importFlowModal" role="dialog" aria-modal="true">
            <div className="importFlowModal__header">
              <div className="importFlowModal__title">
                <FileText size={18} />
                <div>
                  <h3>{file?.name || 'Import file'}</h3>
                  <span className="importFlowModal__step">
                    {getModalStepLabel(getModalStepKey())}
                  </span>
                </div>
              </div>
              <button
                className="importFlowModal__close"
                onClick={handleModalClose}
                disabled={importing}
                aria-label="Close import flow"
              >
                <X size={18} />
              </button>
            </div>
            <div className="importFlowModal__body">
              {getModalStepKey() === STEPS.MAPPING && renderMappingStep()}
              {getModalStepKey() === STEPS.VALIDATION && renderValidationStep()}
              {getModalStepKey() === STEPS.IMPORTING && renderImportingStep()}
              {getModalStepKey() === 'duplicates' && renderDuplicatesStep()}
              {getModalStepKey() === STEPS.COMPLETE && renderCompleteStep()}
            </div>
          </div>
        </>
      )}

      {deleteConfirm && (
        <>
          <div className="deleteConfirmOverlay" onClick={() => setDeleteConfirm(null)} />
          <div className="deleteConfirmModal">
            <div className="deleteConfirmModal__header">
              <div className="deleteConfirmModal__icon">
                <AlertCircle size={24} />
              </div>
              <h3>Delete Import?</h3>
              <button
                className="deleteConfirmModal__close"
                onClick={() => setDeleteConfirm(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="deleteConfirmModal__body">
              <p>Are you sure you want to delete the import <strong>{deleteConfirm.filename}</strong>?</p>
              <p className="deleteConfirmModal__meta">
                Imported on {new Date(deleteConfirm.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div className="deleteConfirmModal__warning">
                <AlertCircle size={16} />
                <span>This will permanently delete all {deleteConfirm.importedCount || 0} associated transactions.</span>
              </div>
              <p className="deleteConfirmModal__note">This action cannot be undone.</p>
            </div>
            <div className="deleteConfirmModal__actions">
              <button
                className="btn btn--ghost"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn--danger"
                onClick={handleDeleteConfirm}
              >
                Delete Import
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

