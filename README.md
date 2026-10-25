# CCI HelpDesk Workspace

A full-featured enterprise IT helpdesk, equipment inspection (IER Forms A & B), project management, and asset inventory platform for **Coolaire Consolidated Inc.**, rewritten as a modern React TypeScript application with Vite and Tailwind CSS.

## Features

- **Secure Gateway & Authentication**: PIN-secured gate (default: `7799`) followed by role-based authentication (`super admin`, `admin`, `management`, `manager`, `it support`, `employee`) and quick persona switching.
- **HelpDesk & Ticketing Operations**:
  - Full lifecycle tracking: New, Assigned, In Progress, Pending Approval, Resolved, Closed.
  - Multi-tier approval routing for requests and changes.
  - Live discussion comments, AnyDesk remote ID support, SLA target tracking.
- **Inspection & Evaluation Reports (IER Hub)**:
  - **IER Form A**: Equipment defect, inspection, and multi-tier approval (Manager sign & IT verification).
  - **IER Form B**: Maintenance, technical service scope, and CapEx/OpEx parts replacement quotation.
  - **Print Preview**: Official formatted printable documents for physical signing and filing.
  - **IER Central Hub**: Unified searchable registry of all inspection records.
- **IT Project Office**:
  - Kanban roadmap board (Planning, To Do, In Progress, In Review, Completed).
  - Project milestone progress tracking and meeting logs.
  - Project portfolio delivery analytics.
- **Asset Inventory**:
  - Hardware tracking (Laptops, Desktops, Printers, Servers, Network units, Mobile devices).
  - Custodian assignments, serial numbers, warranty specs, and maintenance status.
- **Administration & RBAC**:
  - Dynamic Role Permissions matrix.
  - SLA policy thresholds configuration and compliance analytics.
  - User and department management.
  - Immutable security audit trail with IP and action logging.
  - Historical archives search.
- **Employee Directory & Knowledge Base**:
  - Contact lookup by department and extension.
  - Self-service troubleshooting guides with voting.
- **User Profile**:
  - HTML5 Canvas digital signature pad for instant IER authorization.

## Technology Stack

- **Framework**: React 19, TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS, Bento glassmorphic tokens, Plus Jakarta Sans typography
- **Icons**: Lucide React
