import { useState } from 'react';
import type { ApiEndpoints } from '../types/api';
import { checkHealth } from '../services/api';
import { CloudProvider, type CloudProviderType } from '../types/CloudProvider';

interface TestRunnerProps {
  onRunTest: (
    imageUrl: string,
    provider: CloudProviderType,
    iterations: number
  ) => void;
  isRunning: boolean;
  apiEndpoints: ApiEndpoints;
  onEndpointsChange: (endpoints: ApiEndpoints) => void;
}

export function TestRunner({ onRunTest, isRunning, apiEndpoints, onEndpointsChange }: TestRunnerProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [provider, setProvider] = useState<CloudProviderType>(CloudProvider.AWS);
  const [iterations, setIterations] = useState(1);
  const [awsHealth, setAwsHealth] = useState<boolean | null>(null);
  const [azureHealth, setAzureHealth] = useState<boolean | null>(null);

  const handleCheckHealth = async () => {
    const [awsStatus, azureStatus] = await Promise.all([
      checkHealth(CloudProvider.AWS, apiEndpoints),
      checkHealth(CloudProvider.AZURE, apiEndpoints),
    ]);
    setAwsHealth(awsStatus);
    setAzureHealth(azureStatus);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }
    onRunTest(imageUrl, provider, iterations);
  };

  const handleRunBoth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }
    onRunTest(imageUrl, CloudProvider.AWS, iterations);
    setTimeout(() => {
      onRunTest(imageUrl, CloudProvider.AZURE, iterations);
    }, 100);
  };

  return (
    <div className="test-runner">
      <h2>Cloud AI Performance Tester</h2>
      <p className="subtitle">
        Compare AWS and Azure performance for AI image captioning
      </p>

      <div className="health-check">
        <button onClick={handleCheckHealth} disabled={isRunning} className="btn-secondary">
          Check API Health
        </button>
        {awsHealth !== null && (
          <div className="health-status">
            <span className={awsHealth ? 'status-ok' : 'status-down'}>
              AWS: {awsHealth ? 'Online' : 'Offline'}
            </span>
          </div>
        )}
        {azureHealth !== null && (
          <div className="health-status">
            <span className={azureHealth ? 'status-ok' : 'status-down'}>
              Azure: {azureHealth ? 'Online' : 'Offline'}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="test-form">
        <div className="form-group">
          <label htmlFor="awsUrl">AWS API Endpoint *</label>
          <input
            type="url"
            id="awsUrl"
            value={apiEndpoints.aws}
            onChange={(e) => onEndpointsChange({ ...apiEndpoints, aws: e.target.value })}
            placeholder="http://localhost:8000/api"
            required
            disabled={isRunning}
          />
          <small>AWS API endpoint URL including /api path</small>
        </div>

        <div className="form-group">
          <label htmlFor="azureUrl">Azure API Endpoint *</label>
          <input
            type="url"
            id="azureUrl"
            value={apiEndpoints.azure}
            onChange={(e) => onEndpointsChange({ ...apiEndpoints, azure: e.target.value })}
            placeholder="http://localhost:8000/api"
            required
            disabled={isRunning}
          />
          <small>Azure API endpoint URL including /api path</small>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL *</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            required
            disabled={isRunning}
          />
          <small>Enter a publicly accessible image URL</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="provider">Cloud Provider *</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as CloudProviderType)}
              disabled={isRunning}
            >
              <option value={CloudProvider.AWS}>Amazon AWS</option>
              <option value={CloudProvider.AZURE}>Microsoft Azure</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="iterations">Iterations</label>
            <input
              type="number"
              id="iterations"
              value={iterations}
              onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="100"
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="button-group">
          <button type="submit" disabled={isRunning} className="btn-primary">
            {isRunning ? 'Running...' : `Run Test on ${provider.toUpperCase()}`}
          </button>
          <button
            type="button"
            onClick={handleRunBoth}
            disabled={isRunning}
            className="btn-both"
          >
            Run on Both Providers
          </button>
        </div>
      </form>
    </div>
  );
}
