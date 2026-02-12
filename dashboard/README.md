# Super25 LLM-FW Dashboard

Enterprise AI Security Dashboard for monitoring and managing LLM firewall protection.

## Features

- **Real-time Threat Monitoring**: Live visualization of attacks and blocked threats
- **Security Metrics**: Track requests, latency, false positives, and uptime
- **Threat Intelligence**: Detailed breakdown of attack types and sources
- **Event Logging**: Comprehensive audit trail of all security events
- **Geographic Analysis**: Visualize attack origins by country
- **Dark Mode UI**: Professional security operations center aesthetic

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Recharts** - Data Visualization
- **Lucide React** - Icons
- **Vite** - Build Tool

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Dashboard Components

### Overview Tab
- 6 Key Metrics Cards
- Traffic & Threats Chart (24h timeline)
- Threat Types Distribution (Pie Chart)
- Severity Distribution (Bar Chart)
- Geographic Attack Sources
- Recent Threat Events Table

### Navigation
- Overview
- Threat Intelligence
- Events & Logs
- Models & Endpoints
- Rules & Policies
- Settings

## Metrics Explained

| Metric | Description |
|--------|-------------|
| Total Requests | All API calls processed |
| Threats Blocked | Requests blocked by firewall |
| Threats Detected | Total threats identified |
| Avg Latency | P99 inspection time |
| False Positives | Legitimate requests blocked |
| Uptime | Service availability |

## Threat Types

- **Prompt Injection** - Attempts to override system instructions
- **Jailbreak** - Attempts to bypass safety constraints
- **Data Exfiltration** - Attempts to extract sensitive data
- **Adversarial Input** - Obfuscated/encoded attacks

## Action Types

- **Blocked** - Request prevented from reaching model
- **Flagged** - Request allowed but marked for review
- **Allowed** - Request passed inspection

## License

Proprietary - Super25 AI Security
