# Technical Documentation

## Architecture Overview

This is a React-based single-page application (SPA) built with TypeScript and Vite for comparing cloud provider performance when running AI workloads. The application follows a component-based architecture with clear separation of concerns.

### Technology Stack

- **React 19.1.1** - UI framework with hooks-based state management
- **TypeScript 5.9.3** - Static typing and enhanced IDE support
- **Vite 7.1.7** - Fast build tool and development server with HMR (Hot Module Replacement)
- **CSS3** - Custom styling using CSS variables for theming
- **Browser APIs** - localStorage for persistence, Performance API for metrics

### Project Structure

```
src/
├── components/           # React UI components
│   ├── TestRunner.tsx    # Test configuration and execution
│   ├── MetricsDisplay.tsx # Performance visualization
│   └── DataExport.tsx    # Data export utilities
├── services/            # External integrations
│   └── api.ts           # HTTP client for backend APIs
├── utils/               # Helper functions
│   └── metrics.ts       # Statistical calculations and exports
├── types.ts             # TypeScript type definitions
├── App.tsx              # Root application component
├── App.css              # Global styles
├── main.tsx             # Application entry point
└── index.css            # Base CSS reset and variables
```

## Core Components

### App.tsx (Root Component)

**Purpose**: Main application orchestrator that manages global state and coordinates child components.

**State Management**:
- `metrics: MetricsData[]` - Array of all test results
- `isRunning: boolean` - Test execution status flag
- `apiEndpoints: ApiEndpoints` - AWS and Azure API endpoint URLs

**Key Features**:
1. **LocalStorage Persistence**: Automatically saves metrics to `localStorage` with key `cloud_ai_metrics` and endpoints with key `cloud_ai_endpoints`
2. **Data Hydration**: On mount, loads saved metrics and API endpoints, converts timestamp strings back to Date objects
3. **Dynamic API Configuration**: Users can configure API endpoints directly in the UI
4. **Concurrent Stress Testing**: Fires all requests simultaneously using `Promise.all()` for true load testing
5. **Batch Results Update**: All results are added to state at once after all requests complete

**Data Flow**:
```
User Input → TestRunner → handleRunTest → generateCaption (API call)
→ Update metrics state → Auto-save to localStorage → Re-render displays
```

### TestRunner.tsx

**Purpose**: User interface for configuring and executing performance tests.

**Features**:
- **API Endpoint Configuration**: Input fields for AWS and Azure API URLs
- Image URL input with validation
- Cloud provider selection (AWS/Azure)
- Iteration count (1-100)
- Health check functionality
- Single or dual-provider testing

**State Management**:
- Receives `apiEndpoints` from parent component
- Calls `onEndpointsChange` when user updates URLs
- Endpoints are persisted to localStorage automatically

**API Integration**:
- Health checks: `GET /api/health` on both providers
- Shows online/offline status before testing

**User Flow**:
1. Configure AWS and Azure API endpoint URLs (persisted across sessions)
2. Optional: Check API health status
3. Enter publicly accessible image URL
4. Select provider or choose "Run on Both"
5. Execute test(s)
6. Results appear in real-time

### MetricsDisplay.tsx

**Purpose**: Visualize performance data with aggregated statistics and detailed results.

**Displays**:

1. **Aggregated Metrics** (per provider):
   - Total Requests
   - Success Rate (%)
   - Average Response Time (ms)
   - Min/Max Response Time (ms)
   - Median Response Time (ms)
   - Standard Deviation (ms)
   - Failed Requests count

2. **Detailed Results Table**:
   - Timestamp
   - Provider (color-coded badge)
   - Response Time
   - Status (Success/Failed)
   - Generated Caption or Error Message

**Styling**:
- AWS: Orange theme (#ff9900)
- Azure: Blue theme (#0089d6)
- Error rows: Red background tint
- Success rows: Green background tint

### DataExport.tsx

**Purpose**: Export collected metrics for external analysis.

**Export Formats**:

1. **CSV Export**:
   - Spreadsheet-friendly format
   - Headers: ID, Timestamp, Provider, Image URL, Caption, Response Time, Status Code, Success, Error
   - Proper escaping for commas and quotes in text fields
   - Filename: `metrics_YYYY-MM-DDTHH-mm-ss.csv`

2. **JSON Export**:
   - Raw JSON array of all metrics objects
   - Preserves all data types and structure
   - Filename: `metrics_YYYY-MM-DDTHH-mm-ss.json`

3. **Clear Data**:
   - Confirmation dialog before deletion
   - Clears both state and localStorage

## Services Layer

### api.ts

**Purpose**: HTTP client for backend API communication with built-in performance tracking.

**Configuration**:
API endpoints are now dynamically provided by the caller rather than hardcoded. This allows users to configure endpoints directly in the UI.

**Functions**:

#### `generateCaption(imageUrl, provider, apiEndpoints)`

Sends image URL to provider's caption endpoint and tracks performance.

**Parameters**:
- `imageUrl: string` - Publicly accessible image URL
- `provider: CloudProvider` - 'aws' or 'azure'
- `apiEndpoints: ApiEndpoints` - Object containing AWS and Azure API URLs

**Request**:
- Method: POST
- Endpoint: `${API_ENDPOINTS[provider]}/caption`
- Headers: `Content-Type: application/json`
- Body: `{ imageUrl: string }`

**Response Handling**:
- Success (200): Returns caption with performance metrics
- HTTP Error (4xx/5xx): Captures error message and response time
- Network Error: Records timeout/connection failure

**Performance Tracking**:
```typescript
const startTime = performance.now();
// ... make request ...
const endTime = performance.now();
const responseTime = endTime - startTime; // milliseconds
```

**Return Type**: `MetricsData` object containing:
- Unique ID (UUID v4)
- Timestamp (Date object)
- Provider identifier
- Response time in milliseconds
- HTTP status code
- Success/failure boolean
- Caption text or error message

#### `checkHealth(provider, apiEndpoints)`

Checks if API endpoint is accessible.

**Parameters**:
- `provider: CloudProvider` - 'aws' or 'azure'
- `apiEndpoints: ApiEndpoints` - Object containing AWS and Azure API URLs

**Request**:
- Method: GET
- Endpoint: `${apiEndpoints[provider]}/health`

**Returns**: `boolean` - true if endpoint responds with 2xx status

## Utilities Layer

### metrics.ts

**Purpose**: Statistical calculations and data export utilities.

#### `calculateAggregatedMetrics(data, provider?)`

Computes statistical summary of performance data.

**Algorithm**:
1. Filter data by provider (if specified)
2. Group by provider
3. For each provider:
   - Extract and sort response times
   - Calculate average (arithmetic mean)
   - Calculate median (middle value or average of two middle values)
   - Calculate variance and standard deviation
   - Count successes and failures

**Statistical Formulas**:
- **Average**: `sum(times) / count(times)`
- **Median**: Middle value of sorted array
- **Variance**: `sum((time - average)²) / count(times)`
- **Std Deviation**: `√variance`

**Returns**: Array of `AggregatedMetrics` objects

#### `exportToCSV(data)`

Converts metrics array to CSV format.

**Features**:
- Header row with column names
- Proper CSV escaping (quotes doubled, fields wrapped in quotes)
- Timestamp in ISO 8601 format
- Response time rounded to 2 decimal places

#### `exportToJSON(data)`

Converts metrics array to formatted JSON.

**Features**:
- Pretty-printed with 2-space indentation
- Preserves all data types
- Ready for programmatic consumption

#### `downloadFile(content, filename, mimeType)`

Triggers browser download of generated file.

**Implementation**:
1. Create Blob from content
2. Generate object URL
3. Create temporary `<a>` element
4. Trigger click event
5. Clean up: remove element and revoke URL

## Type System

### Core Types

```typescript
type CloudProvider = 'aws' | 'azure';

interface ApiEndpoints {
  aws: string;     // AWS API endpoint URL
  azure: string;   // Azure API endpoint URL
}

interface MetricsData {
  id: string;                    // UUID v4
  timestamp: Date;               // Request time
  provider: CloudProvider;       // Which cloud provider
  imageUrl: string;              // Input image URL
  caption: string;               // AI-generated caption
  responseTime: number;          // Milliseconds
  statusCode: number;            // HTTP status code
  success: boolean;              // Request succeeded
  error?: string;                // Error message if failed
}

interface AggregatedMetrics {
  provider: CloudProvider;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  medianResponseTime: number;
  standardDeviation: number;
}
```

## Styling Architecture

### CSS Variables (Design Tokens)

```css
:root {
  --primary-color: #4a90e2;      /* Primary blue */
  --secondary-color: #50c878;    /* Success green */
  --aws-color: #ff9900;          /* AWS orange */
  --azure-color: #0089d6;        /* Azure blue */
  --danger-color: #e74c3c;       /* Error red */
  --bg-primary: #1a1a2e;         /* Dark background */
  --bg-secondary: #16213e;       /* Card background */
  --bg-tertiary: #0f3460;        /* Input background */
  --text-primary: #eaeaea;       /* Main text */
  --text-secondary: #a0a0a0;     /* Secondary text */
  --border-color: #2d3748;       /* Borders */
}
```

### Responsive Design

**Breakpoint**: `768px` (tablet/mobile)

**Mobile Adaptations**:
- Single column layouts
- Full-width buttons
- Stacked form rows
- Simplified metric grids

## Data Persistence

### LocalStorage Strategy

**Storage Keys**:
- `cloud_ai_metrics` - Test results data
- `cloud_ai_endpoints` - API endpoint URLs

**Serialization**:
- State → JSON → localStorage (on every update)
- localStorage → JSON → State with Date hydration (on app load)

**Data Stored**:
1. **Metrics**: All test results with timestamps
2. **API Endpoints**: User-configured AWS and Azure URLs (persisted across sessions)

**Date Handling**:
```typescript
// Save: Dates automatically converted to ISO strings
localStorage.setItem(key, JSON.stringify(metrics));

// Load: Convert ISO strings back to Date objects
const parsed = JSON.parse(stored);
const withDates = parsed.map(m => ({
  ...m,
  timestamp: new Date(m.timestamp)
}));
```

**Advantages**:
- Persist across browser sessions
- Survive page refreshes
- No backend required for data storage
- Instant load times
- User preferences (API URLs) automatically saved

**Limitations**:
- ~5-10MB storage limit (browser-dependent)
- Data lost if browser cache cleared
- Not shared across devices

## Performance Considerations

### Measurement Accuracy

Uses `performance.now()` for high-resolution timing:
- Microsecond precision
- Monotonic clock (unaffected by system time changes)
- Includes network latency, server processing, and response parsing

### Optimization Strategies

1. **Concurrent Request Execution**: All test requests fire simultaneously using `Promise.all()` for true stress testing
2. **Parallel Health Checks**: Both providers checked simultaneously
3. **Batch State Updates**: All results added to state at once to minimize re-renders
4. **Efficient Re-renders**: React state updates trigger minimal re-renders

## API Contract

### Expected Backend Endpoints

#### Health Check

```
GET /api/health

Response: {
  status: "ok" | "not_loaded",
  model: string,
  device: string
}
```

#### Image Caption

```
POST /api/caption
Content-Type: application/json

Request: {
  imageUrl: string
}

Response: {
  caption: string
}

Error Response: {
  detail: string
}
```

## Configuration

### API Endpoints

**As of the latest version, API endpoints are configured directly in the UI, not via environment variables.**

Users can input their API endpoints in the application interface:
- AWS API Endpoint field
- Azure API Endpoint field

**Placeholders**:
```
AWS:   http://localhost:8000/api
Azure: http://localhost:8000/api
```

**Configuration Persistence**:
- Endpoints are automatically saved to localStorage
- Persist across browser sessions
- No need to rebuild or restart the application to change endpoints

**URL Format**:
```
http(s)://hostname:port/api
```

Examples:
- Local: `http://localhost:8000/api`
- AWS EC2: `http://ec2-XX-XX-XX-XX.compute-1.amazonaws.com:8000/api`
- Azure: `https://your-app.azurewebsites.net/api`

**Important Notes**:
- Include the full URL with protocol, host, port (if not 80/443), and path
- Both endpoints must include the `/api` path suffix
- Port 8000 is the default for the FastAPI backend
- For local testing of both providers, run each backend on a different port

### TypeScript Configuration

**Key Settings**:
- `verbatimModuleSyntax: true` - Requires explicit `import type` for types
- `moduleResolution: "bundler"` - Vite-optimized resolution
- `strict: true` - Full type checking enabled

## Development Workflow

### Setup

```bash
npm install
npm run dev
```

On first launch, configure your API endpoints in the UI (they will be saved automatically).

### Development Server

- Port: `5173` (default)
- HMR enabled (instant updates without refresh)
- TypeScript checking in real-time

### Building for Production

```bash
npm run build       # Creates dist/ folder
npm run preview     # Preview production build locally
```

### Code Quality

```bash
npm run lint        # ESLint with React rules
```

## Testing Strategy

### Manual Testing Checklist

1. **Health Checks**:
   - [ ] AWS endpoint responds correctly
   - [ ] Azure endpoint responds correctly
   - [ ] Offline detection works

2. **Single Provider Tests**:
   - [ ] AWS test completes successfully
   - [ ] Azure test completes successfully
   - [ ] Errors are captured and displayed

3. **Dual Provider Tests**:
   - [ ] Both providers tested sequentially
   - [ ] Metrics correctly labeled by provider

4. **Metrics Accuracy**:
   - [ ] Response times are reasonable
   - [ ] Aggregated statistics are correct
   - [ ] Table displays all fields

5. **Data Persistence**:
   - [ ] Metrics survive page refresh
   - [ ] Clear data removes localStorage entry

6. **Export Functionality**:
   - [ ] CSV export downloads correctly
   - [ ] JSON export is valid JSON
   - [ ] Filenames include timestamp

## Common Issues & Solutions

### Module Import Errors

**Issue**: `The requested module does not provide an export named...`

**Solution**:
- Ensure using `import type` for type-only imports
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server

### CORS Errors

**Issue**: Cannot connect to API endpoints

**Solution**:
The backend API (`tcc_high_availability_api`) includes CORS middleware configured to allow all origins (`*`). This is intentionally permissive for the following reasons:
- Open source research project - anyone should be able to run it
- No sensitive data or authentication
- Academic reproducibility is prioritized
- Users may run frontend from various ports/domains during testing

If you encounter CORS errors:
1. Ensure the backend service is running with the CORS middleware enabled
2. Restart the backend service after making changes
3. Check browser console for specific CORS error messages

**Backend Configuration** (already included in `app.py`):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### LocalStorage Quota Exceeded

**Issue**: Too much data stored

**Solution**:
- Export data to CSV/JSON
- Clear old data using "Clear All Data" button
- Implement data rotation strategy

## Browser Compatibility

**Minimum Requirements**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features**:
- ES2022 support
- Fetch API
- Performance API
- LocalStorage
- Crypto.randomUUID()

## Security Considerations

### Data Privacy

- All data stored locally in browser
- No telemetry or analytics
- Image URLs sent to user-configured endpoints only

### Input Validation

- URL format validation on image input
- Iteration count clamped to 1-100
- Provider selection restricted to valid options

### API Communication

- HTTPS recommended for production endpoints
- No API keys exposed in frontend code
- CORS-protected endpoints

## Future Enhancements

Potential improvements for this application:

1. **Charts and Graphs**: Add visualization libraries (Chart.js, Recharts)
2. **Comparison View**: Side-by-side provider comparison charts
3. **Historical Tracking**: Track performance over time
4. **Advanced Filtering**: Filter results by date, provider, status
5. **Batch Testing**: Upload multiple image URLs
6. **Custom Configurations**: Support for different model types
7. **Export to Google Sheets**: Direct integration
8. **Dark/Light Mode Toggle**: User preference
9. **API Key Management**: Secure credential handling
10. **Real-time WebSocket**: Live performance monitoring

## License

MIT License - See LICENSE file for details.

---

## Changelog

### v1.1.4 - Concurrent Stress Testing
- **Breaking Change**: Requests now fire concurrently instead of sequentially
- All test iterations execute simultaneously using `Promise.all()`
- Removed 500ms delay between requests for true stress/load testing
- Results are batched and added to state all at once
- Better simulates real-world concurrent load on cloud infrastructure

### v1.1.3 - Removed Configuration Fields
- **Breaking Change**: Removed CPU and RAM configuration fields completely
- Simplified data model by removing `cpuConfig` and `ramConfig` from `MetricsData` interface
- Removed configuration column from results table
- Updated CSV export to exclude configuration fields
- Configuration information should now be tracked externally if needed

### v1.1.2 - UI Improvements
- **Timestamp Format**: Changed date portion to ISO format (YYYY-MM-DD) while keeping time display (HH:MM:SS)
- **Caption Display**: Enabled text wrapping in caption column to show full text
- Caption column now expands vertically to accommodate longer captions
- Improved readability with proper line height and increased max-width to 400px

### v1.1.1 - CORS Configuration
- **Backend Change**: Added CORS middleware to `tcc_high_availability_api/app.py`
- Configured to allow all origins (`*`) for open source research purposes
- Documented CORS setup in troubleshooting section
- This change must be deployed to both AWS and Azure backends

### v1.1.0 - Dynamic API Configuration
- **Breaking Change**: API endpoints are now configured in the UI instead of environment variables
- Added API endpoint input fields in TestRunner component
- Endpoints persist to localStorage for convenience
- Updated all API functions to accept dynamic endpoints as parameters
- Removed dependency on `.env` file for endpoint configuration

---

**Last Updated**: 2025-01-15

**Maintained By**: University Thesis Project
