# Cloud AI Performance Comparison - Frontend

A React-based web application for comparing AWS and Azure cloud performance when running AI image captioning workloads. This is the frontend component of a university thesis project focused on high availability and cloud performance research.

## Overview

This application provides a comprehensive interface for:
- Sending image URLs to AI captioning APIs deployed on AWS and Azure
- Tracking detailed performance metrics (response time, latency, success rates)
- Comparing performance across different cloud providers and configurations
- Visualizing aggregated statistics (mean, median, standard deviation)
- Exporting data for further analysis (CSV/JSON formats)

## Features

- **Multi-Provider Testing**: Run tests on AWS, Azure, or both simultaneously
- **Real-time Metrics**: Track response times, status codes, and error rates
- **Performance Analytics**: View aggregated statistics including average response time, min/max, median, and standard deviation
- **Configuration Tracking**: Record CPU and RAM configurations for each test
- **Data Persistence**: Metrics are saved to localStorage and persist across sessions
- **Data Export**: Export all collected data in CSV or JSON format for analysis
- **Health Monitoring**: Check API endpoint availability before running tests
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Custom styling with CSS variables

## Project Structure

```
src/
├── components/
│   ├── TestRunner.tsx        # Test configuration and execution UI
│   ├── MetricsDisplay.tsx    # Performance metrics visualization
│   └── DataExport.tsx        # Data export functionality
├── services/
│   └── api.ts                # API client and request handling
├── utils/
│   └── metrics.ts            # Metrics calculations and export utilities
├── types.ts                  # TypeScript type definitions
├── App.tsx                   # Main application component
├── App.css                   # Application styles
└── main.tsx                  # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Access to deployed API endpoints (AWS and/or Azure)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tcc_high_availability_front
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoints:
```bash
cp .env.example .env
```

Edit `.env` and set your API endpoint URLs:
```env
VITE_AWS_API_URL=http://your-aws-instance.com/api
VITE_AZURE_API_URL=http://your-azure-instance.com/api
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

1. **Check API Health**: Click "Check API Health" to verify your endpoints are accessible

2. **Configure Test**:
   - Enter a publicly accessible image URL
   - Select cloud provider (AWS or Azure)
   - Set number of iterations (1-100)
   - Optionally specify CPU and RAM configurations

3. **Run Test**:
   - Click "Run Test on [PROVIDER]" for a single provider
   - Click "Run on Both Providers" to test both simultaneously

4. **View Results**:
   - Real-time metrics appear as tests complete
   - Aggregated statistics show overall performance
   - Detailed results table shows individual requests

5. **Export Data**:
   - Use "Export as CSV" for spreadsheet analysis
   - Use "Export as JSON" for programmatic processing
   - Use "Clear All Data" to reset metrics

## API Integration

The application expects the backend API to provide these endpoints:

- `GET /api/health` - Health check endpoint
  - Returns: `{ status: "ok" | "not_loaded", model: string, device: string }`

- `POST /api/caption` - Image captioning endpoint
  - Request: `{ imageUrl: string }`
  - Returns: `{ caption: string }`

See the [backend repository](../tcc_high_availability_api) for API implementation details.

## Metrics Tracked

For each request, the application tracks:
- Response time (milliseconds)
- HTTP status code
- Success/failure status
- Generated caption or error message
- Timestamp
- Cloud provider
- CPU/RAM configuration (optional)

Aggregated metrics include:
- Total requests
- Success rate
- Average response time
- Min/Max response time
- Median response time
- Standard deviation

## Data Export Format

### CSV Export
Includes all tracked metrics in a spreadsheet-friendly format with headers.

### JSON Export
Provides raw data in JSON format for programmatic analysis:
```json
[
  {
    "id": "uuid",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "provider": "aws",
    "imageUrl": "https://...",
    "caption": "a cat sitting on a couch",
    "responseTime": 1250.5,
    "statusCode": 200,
    "success": true,
    "cpuConfig": "2 vCPUs",
    "ramConfig": "4GB"
  }
]
```

## Research Use

This application is designed for academic research comparing cloud provider performance. Key research metrics supported:

- **Response Time Analysis**: Measure and compare latency across providers
- **Cold Start Behavior**: Track initial request performance
- **Load Testing**: Run multiple iterations to test under load
- **Resource Utilization**: Track performance across different CPU/RAM configurations
- **Cost-Effectiveness**: Export data for cost-per-request analysis

## License

This project is part of a university thesis. See LICENSE file for details.

## Related Projects

- [Backend API](../tcc_high_availability_api) - FastAPI service with BLIP image captioning model

## Contributing

This is a thesis project. For questions or issues, please contact the repository owner.
