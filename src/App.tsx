import { useState, useEffect } from 'react';
import type { MetricsData } from './types/metrics';
import type { ApiEndpoints } from './types/api';
import type { CloudProviderType } from './types/CloudProvider';
import { generateCaption } from './services/api';
import { calculateAggregatedMetrics } from './utils/metrics';
import { TestRunner } from './components/TestRunner';
import { MetricsDisplay } from './components/MetricsDisplay';
import { DataExport } from './components/DataExport';
import './App.css';

const STORAGE_KEY = 'cloud_ai_metrics';
const ENDPOINTS_STORAGE_KEY = 'cloud_ai_endpoints';

function App() {
  const [metrics, setMetrics] = useState<MetricsData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoints>({
    aws: 'http://localhost:8000/api',
    azure: 'http://localhost:8000/api',
  });

  // Load metrics and endpoints from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const metricsWithDates = parsed.map((m: MetricsData) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          responseTimestamp: m.responseTimestamp ? new Date(m.responseTimestamp) : undefined,
        }));
        setMetrics(metricsWithDates);
      } catch (error) {
        console.error('Failed to load metrics from storage:', error);
      }
    }

    const storedEndpoints = localStorage.getItem(ENDPOINTS_STORAGE_KEY);
    if (storedEndpoints) {
      try {
        const parsed = JSON.parse(storedEndpoints);
        setApiEndpoints(parsed);
      } catch (error) {
        console.error('Failed to load endpoints from storage:', error);
      }
    }
  }, []);

  // Save metrics to localStorage whenever they change
  useEffect(() => {
    if (metrics.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
    }
  }, [metrics]);

  // Save endpoints to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(ENDPOINTS_STORAGE_KEY, JSON.stringify(apiEndpoints));
  }, [apiEndpoints]);

  const handleRunTest = async (
    imageFiles: File[],
    provider: CloudProviderType,
    iterations: number
  ) => {
    setIsRunning(true);

    try {
      // Use only the first 'iterations' images (1 image per request)
      const filesToUse = imageFiles.slice(0, iterations);

      // Create pending metrics immediately for visual feedback
      const pendingMetrics: MetricsData[] = filesToUse.map((file) => ({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        provider,
        imageName: file.name,
        caption: '',
        responseTime: 0,
        statusCode: 0,
        success: false,
        isPending: true,
      }));

      // Add pending metrics to the table immediately
      setMetrics((prev) => [...prev, ...pendingMetrics]);

      // Fire all requests concurrently and update each one as it completes
      const promises = filesToUse.map((file, index) => {
        const pendingMetric = pendingMetrics[index];
        return generateCaption(file, provider, apiEndpoints).then((result) => {
          const completedMetric = {
            ...result,
            id: pendingMetric.id, // Use the same ID to replace the pending entry
            timestamp: pendingMetric.timestamp, // Preserve the original request timestamp
            isPending: false, // Explicitly mark as no longer pending
          };

          // Update this specific metric immediately upon completion
          setMetrics((prev) =>
            prev.map((metric) =>
              metric.id === pendingMetric.id ? completedMetric : metric
            )
          );

          return completedMetric;
        });
      });

      // Wait for all requests to complete
      await Promise.all(promises);
    } catch (error) {
      console.error('Test execution error:', error);
      alert('An error occurred while running the test. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearData = () => {
    setMetrics([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const aggregatedMetrics = calculateAggregatedMetrics(metrics);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cloud AI Performance Comparison</h1>
        <p>AWS vs Azure - Image Captioning Performance Analysis</p>
      </header>

      <main className="app-main">
        <section className="test-section">
          <TestRunner
            onRunTest={handleRunTest}
            isRunning={isRunning}
            apiEndpoints={apiEndpoints}
            onEndpointsChange={setApiEndpoints}
          />
        </section>

        <section className="export-section">
          <DataExport metrics={metrics} onClearData={handleClearData} />
        </section>

        <section className="metrics-section">
          <MetricsDisplay metrics={metrics} aggregated={aggregatedMetrics} />
        </section>
      </main>

      <footer className="app-footer">
        <p>
          University Thesis Project - High Availability and Cloud Performance Research
        </p>
      </footer>
    </div>
  );
}

export default App;
