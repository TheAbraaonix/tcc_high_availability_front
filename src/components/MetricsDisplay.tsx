import { useState, useMemo } from 'react';
import type { MetricsData, AggregatedMetrics } from '../types/metrics';
import { LiveResponseTimer } from './LiveResponseTimer';

interface MetricsDisplayProps {
  metrics: MetricsData[];
  aggregated: AggregatedMetrics[];
}

type ProviderFilter = 'all' | 'aws' | 'azure';
type StatusFilter = 'all' | 'success' | 'failed' | 'pending';
type ResponseTimeFilter = 'all' | 'fast' | 'medium' | 'slow';
type SortDirection = 'asc' | 'desc' | null;

export function MetricsDisplay({ metrics, aggregated }: MetricsDisplayProps) {
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [responseTimeFilter, setResponseTimeFilter] = useState<ResponseTimeFilter>('all');
  const [displayLimit, setDisplayLimit] = useState<number>(50);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filtering and sorting logic with memoization
  const filteredAndSortedMetrics = useMemo(() => {
    let filtered = metrics.filter((metric) => {
      // Always show pending requests
      if (metric.isPending) return true;

      // Provider filter
      if (providerFilter !== 'all' && metric.provider !== providerFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'success' && !metric.success) return false;
      if (statusFilter === 'failed' && metric.success) return false;
      if (statusFilter === 'pending' && !metric.isPending) return false;

      // Response time filter (Fast ≤15s, Medium 15s-30s, Slow >30s)
      if (responseTimeFilter !== 'all') {
        const timeInSeconds = metric.responseTime / 1000;
        if (responseTimeFilter === 'fast' && timeInSeconds > 15) return false;
        if (responseTimeFilter === 'medium' && (timeInSeconds <= 15 || timeInSeconds > 30)) return false;
        if (responseTimeFilter === 'slow' && timeInSeconds <= 30) return false;
      }

      return true;
    });

    // Sort by response time if direction is set
    if (sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const diff = a.responseTime - b.responseTime;
        return sortDirection === 'asc' ? diff : -diff;
      });
    } else {
      // Default: newest first
      filtered = [...filtered].reverse();
    }

    // Apply display limit
    if (displayLimit > 0 && displayLimit < filtered.length) {
      // Always include pending requests in the limit
      const pending = filtered.filter(m => m.isPending);
      const nonPending = filtered.filter(m => !m.isPending);
      filtered = [...pending, ...nonPending.slice(0, displayLimit - pending.length)];
    }

    return filtered;
  }, [metrics, providerFilter, statusFilter, responseTimeFilter, displayLimit, sortDirection]);

  const clearFilters = () => {
    setProviderFilter('all');
    setStatusFilter('all');
    setResponseTimeFilter('all');
    setDisplayLimit(50);
    setSortDirection(null);
  };

  const handleProviderCardClick = (provider: string) => {
    setProviderFilter(provider as ProviderFilter);
  };

  if (metrics.length === 0) {
    return (
      <div className="metrics-empty">
        <p>No data yet. Start by sending image requests to generate metrics.</p>
      </div>
    );
  }

  return (
    <div className="metrics-container">
      <h2>Performance Metrics</h2>

      {/* Aggregated Statistics */}
      <div className="aggregated-metrics">
        {aggregated.map((agg) => (
          <div
            key={agg.provider}
            className={`metric-card ${agg.provider} ${providerFilter === agg.provider ? 'active' : ''}`}
            onClick={() => handleProviderCardClick(agg.provider)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{agg.provider.toUpperCase()}</h3>
            <div className="metric-grid">
              <div className="metric-item">
                <span className="metric-label">Total Requests:</span>
                <span className="metric-value">{agg.totalRequests}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Success Rate:</span>
                <span className="metric-value">
                  {((agg.successfulRequests / agg.totalRequests) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Avg Response Time:</span>
                <span className="metric-value">
                  {agg.averageResponseTime.toFixed(2)} ms
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Min Response Time:</span>
                <span className="metric-value">
                  {agg.minResponseTime.toFixed(2)} ms
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Max Response Time:</span>
                <span className="metric-value">
                  {agg.maxResponseTime.toFixed(2)} ms
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Median:</span>
                <span className="metric-value">
                  {agg.medianResponseTime.toFixed(2)} ms
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Std Deviation:</span>
                <span className="metric-value">
                  {agg.standardDeviation.toFixed(2)} ms
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Failed Requests:</span>
                <span className="metric-value error">
                  {agg.failedRequests}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-row">
          <div className="filter-group">
            <label>Provider:</label>
            <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value as ProviderFilter)}>
              <option value="all">All</option>
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Response Time:</label>
            <select value={responseTimeFilter} onChange={(e) => setResponseTimeFilter(e.target.value as ResponseTimeFilter)}>
              <option value="all">All</option>
              <option value="fast">Fast (≤15s)</option>
              <option value="medium">Medium (15s-30s)</option>
              <option value="slow">Slow (&gt;30s)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Show:</label>
            <select value={displayLimit} onChange={(e) => setDisplayLimit(Number(e.target.value))}>
              <option value="10">Latest 10</option>
              <option value="25">Latest 25</option>
              <option value="50">Latest 50</option>
              <option value="100">Latest 100</option>
              <option value="0">All</option>
            </select>
          </div>

          <button onClick={clearFilters} className="btn-clear-filters">
            Clear Filters
          </button>
        </div>

        <div className="filter-info">
          Showing {filteredAndSortedMetrics.length} of {metrics.length} records
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="results-table-container">
        <h3>Detailed Results</h3>
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Request Time</th>
                <th>Response Time</th>
                <th>Provider</th>
                <th
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to sort by response time"
                >
                  Response Time (ms) {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '⇅'}
                </th>
                <th>Status</th>
                <th>Caption</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMetrics.map((metric) => (
                  <tr
                    key={metric.id}
                    className={
                      metric.isPending
                        ? 'pending'
                        : metric.success
                        ? 'success'
                        : 'error'
                    }
                  >
                    <td>
                      {new Date(metric.timestamp).toLocaleDateString('en-CA')} {new Date(metric.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      {metric.responseTimestamp
                        ? `${new Date(metric.responseTimestamp).toLocaleDateString('en-CA')} ${new Date(metric.responseTimestamp).toLocaleTimeString()}`
                        : '...'}
                    </td>
                    <td>
                      <span className={`provider-badge ${metric.provider}`}>
                        {metric.provider.toUpperCase()}
                      </span>
                    </td>
                    <td className="response-time">
                      <LiveResponseTimer
                        startTime={metric.timestamp}
                        isPending={metric.isPending || false}
                        finalTime={metric.responseTime}
                      />
                    </td>
                    <td>
                      {metric.isPending ? (
                        <span className="status-pending">Pending...</span>
                      ) : metric.success ? (
                        <span className="status-success">Success</span>
                      ) : (
                        <span className="status-error">
                          Failed ({metric.statusCode || 'N/A'})
                        </span>
                      )}
                    </td>
                    <td className="caption">
                      {metric.isPending
                        ? '...'
                        : metric.success
                        ? metric.caption
                        : metric.error || 'N/A'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
