import type { MetricsData } from '../types/metrics';
import { exportToCSV, exportToJSON, downloadFile } from '../utils/metrics';

interface DataExportProps {
  metrics: MetricsData[];
  onClearData: () => void;
}

export function DataExport({ metrics, onClearData }: DataExportProps) {
  const handleExportCSV = () => {
    const csv = exportToCSV(metrics);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(csv, `metrics_${timestamp}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const json = exportToJSON(metrics);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(json, `metrics_${timestamp}.json`, 'application/json');
  };

  const handleClearData = () => {
    if (
      window.confirm(
        `Are you sure you want to clear all ${metrics.length} recorded metrics? This action cannot be undone.`
      )
    ) {
      onClearData();
    }
  };

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="data-export">
      <h3>Export Data</h3>
      <p>
        Total records: <strong>{metrics.length}</strong>
      </p>
      <div className="export-buttons">
        <button onClick={handleExportCSV} className="btn-export">
          Export as CSV
        </button>
        <button onClick={handleExportJSON} className="btn-export">
          Export as JSON
        </button>
        <button onClick={handleClearData} className="btn-danger">
          Clear All Data
        </button>
      </div>
    </div>
  );
}
