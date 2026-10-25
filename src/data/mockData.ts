import {
  User,
  Ticket,
  IerFormA,
  IerFormB,
  ITProject,
  ProjectUpdate,
  Asset,
  SlaPolicy,
  Department,
  TicketTypeCategory,
  KnowledgeArticle,
  SystemSettings,
  AuditLogEntry
} from '../types';

export const initialUsers: User[] = [
  {
    user_id: 999,
    username: 'admin',
    full_name: 'Default Administrator',
    email: 'admin@coolaireconsolidated.com',
    department: 'IT',
    role: 'super admin',
    position: 'Chief Information Officer',
    phone: '+63 2 8555-0100',
    status: 'active'
  },
  {
    user_id: 1,
    username: 'jmontojo',
    full_name: 'Jarick Montojo',
    email: 'jarick.montojo@coolaireconsolidated.com',
    department: 'IT',
    role: 'admin',
    position: 'IT Systems Lead & Developer',
    phone: '+63 2 8555-0101',
    status: 'active'
  },
  {
    user_id: 2,
    username: 'mgarcia',
    full_name: 'Maria Garcia',
    email: 'maria.garcia@coolaireconsolidated.com',
    department: 'Operations',
    role: 'manager',
    position: 'Operations Manager',
    phone: '+63 2 8555-0102',
    status: 'active'
  },
  {
    user_id: 3,
    username: 'jdelacruz',
    full_name: 'Juan Dela Cruz',
    email: 'juan.delacruz@coolaireconsolidated.com',
    department: 'IT',
    role: 'it support',
    position: 'Senior Desktop Engineer',
    phone: '+63 2 8555-0103',
    status: 'active'
  },
  {
    user_id: 4,
    username: 'asantos',
    full_name: 'Ana Santos',
    email: 'ana.santos@coolaireconsolidated.com',
    department: 'Finance',
    role: 'employee',
    position: 'Financial Analyst',
    phone: '+63 2 8555-0104',
    status: 'active'
  },
  {
    user_id: 5,
    username: 'rreyes',
    full_name: 'Roberto Reyes',
    email: 'roberto.reyes@coolaireconsolidated.com',
    department: 'Executive',
    role: 'management',
    position: 'VP of Corporate Services',
    phone: '+63 2 8555-0105',
    status: 'active'
  },
  {
    user_id: 6,
    username: 'kbautista',
    full_name: 'Kevin Bautista',
    email: 'kevin.bautista@coolaireconsolidated.com',
    department: 'Logistics',
    role: 'employee',
    position: 'Fleet & Warehouse Coordinator',
    phone: '+63 2 8555-0106',
    status: 'active'
  }
];

export const initialDepartments: Department[] = [
  { id: 1, name: 'IT', code: 'DEPT-IT', manager_name: 'Jarick Montojo', head_count: 8 },
  { id: 2, name: 'Operations', code: 'DEPT-OPS', manager_name: 'Maria Garcia', head_count: 32 },
  { id: 3, name: 'Finance', code: 'DEPT-FIN', manager_name: 'Cynthia Tan', head_count: 14 },
  { id: 4, name: 'Logistics', code: 'DEPT-LOG', manager_name: 'Manuel Lopez', head_count: 24 },
  { id: 5, name: 'Human Resources', code: 'DEPT-HR', manager_name: 'Grace Lim', head_count: 9 },
  { id: 6, name: 'Sales & Marketing', code: 'DEPT-SALES', manager_name: 'Patrick Cruz', head_count: 21 },
  { id: 7, name: 'Executive', code: 'DEPT-EXEC', manager_name: 'Roberto Reyes', head_count: 6 }
];

export const initialTicketTypes: TicketTypeCategory[] = [
  { id: 1, name: 'Incident', department: 'IT', default_priority: 'High', description: 'Unplanned interruption or reduction in quality of an IT service.' },
  { id: 2, name: 'Request', department: 'IT', default_priority: 'Medium', description: 'Formal request for hardware, software license, or permissions.' },
  { id: 3, name: 'Inquiry', department: 'IT', default_priority: 'Low', description: 'General questions regarding tools, email setup, or systems.' },
  { id: 4, name: 'Change', department: 'IT', default_priority: 'Medium', description: 'Request for system modification or infrastructure adjustment.' },
  { id: 5, name: 'Problem', department: 'IT', default_priority: 'Urgent', description: 'Cause or potential cause of one or more recurring incidents.' }
];

export const initialSlaPolicies: SlaPolicy[] = [
  { id: 1, ticket_type: 'Incident', priority: 'Urgent', response_in_hours: 1, resolve_in_hours: 4, escalation_level: 'CIO / Lead Dev' },
  { id: 2, ticket_type: 'Incident', priority: 'High', response_in_hours: 2, resolve_in_hours: 8, escalation_level: 'IT Manager' },
  { id: 3, ticket_type: 'Incident', priority: 'Medium', response_in_hours: 4, resolve_in_hours: 24, escalation_level: 'IT Support Team' },
  { id: 4, ticket_type: 'Incident', priority: 'Low', response_in_hours: 8, resolve_in_hours: 72, escalation_level: 'Tier 1 Helpdesk' },
  { id: 5, ticket_type: 'Request', priority: 'Urgent', response_in_hours: 2, resolve_in_hours: 12, escalation_level: 'Operations Head' },
  { id: 6, ticket_type: 'Request', priority: 'High', response_in_hours: 4, resolve_in_hours: 24, escalation_level: 'IT Supervisor' },
  { id: 7, ticket_type: 'Request', priority: 'Medium', response_in_hours: 8, resolve_in_hours: 48, escalation_level: 'Tier 1 Helpdesk' },
  { id: 8, ticket_type: 'Request', priority: 'Low', response_in_hours: 24, resolve_in_hours: 120, escalation_level: 'Tier 1 Helpdesk' },
  { id: 9, ticket_type: 'Change', priority: 'High', response_in_hours: 4, resolve_in_hours: 24, escalation_level: 'Change Advisory Board' }
];

export const initialTickets: Ticket[] = [
  {
    id: 101,
    ticket_number: 'TICK-2026-101',
    employee_name: 'asantos',
    department: 'Finance',
    target_department: 'IT',
    assigned_it: 'Juan Dela Cruz',
    anydesk_id: '921 445 012',
    email: 'ana.santos@coolaireconsolidated.com',
    subject: 'SAP ERP Client Fails to Connect over VPN',
    description: 'When connecting from branch office via FortiClient VPN, SAP Logon displays Error 10061 Connection refused. Unable to finalize month-end invoice batches.',
    status: 'In Progress',
    ticket_type: 'Incident',
    priority: 'High',
    approver_id: 2,
    approver_name: 'Maria Garcia',
    approver_status: 'Approved',
    created_at: '2026-10-24 08:30:00',
    due_date: '2026-10-24 16:30:00',
    screenshot_photo_name: 'sap_connection_error.png',
    comments: [
      {
        id: 1,
        ticket_id: 101,
        sender: 'asantos',
        sender_role: 'Employee',
        message: 'Checked with local internet provider, browsing works normally. Issue is specifically reaching the 192.168.10.x SAP host.',
        timestamp: '2026-10-24 08:32:00'
      },
      {
        id: 2,
        ticket_id: 101,
        sender: 'Juan Dela Cruz',
        sender_role: 'IT Support',
        message: 'Reviewing VPN firewall rules on gateway. Re-routing through secondary VLAN tunnel now. Please retest.',
        timestamp: '2026-10-24 09:15:00'
      }
    ]
  },
  {
    id: 102,
    ticket_number: 'TICK-2026-102',
    employee_name: 'mgarcia',
    department: 'Operations',
    target_department: 'IT',
    assigned_it: 'Jarick Montojo',
    anydesk_id: '445 102 889',
    email: 'maria.garcia@coolaireconsolidated.com',
    subject: 'Warehouse Barcode Scanner Zebra TC21 Upgrade',
    description: 'We need 4 new barcode scanner units provisioned with the Coolaire WMS Mobile Inventory application for the South Distribution Center.',
    status: 'Pending Approval',
    ticket_type: 'Request',
    priority: 'Medium',
    approver_id: 5,
    approver_name: 'Roberto Reyes',
    approver_status: 'Pending',
    created_at: '2026-10-23 14:15:00',
    due_date: '2026-10-26 14:15:00',
    reference_form_name: 'IER-REQ-OPS-04.pdf',
    comments: [
      {
        id: 3,
        ticket_id: 102,
        sender: 'mgarcia',
        sender_role: 'Manager',
        message: 'Budget allocated under Q4 Warehouse modernization CapEx.',
        timestamp: '2026-10-23 14:20:00'
      }
    ]
  },
  {
    id: 103,
    ticket_number: 'TICK-2026-103',
    employee_name: 'kbautista',
    department: 'Logistics',
    target_department: 'IT',
    assigned_it: 'Juan Dela Cruz',
    anydesk_id: '772 301 990',
    email: 'kevin.bautista@coolaireconsolidated.com',
    subject: 'Main Dispatch Thermal Printer Paper Jam & Driver Issue',
    description: 'Bixolon label printer in dispatch bay 2 keeps skipping prints and blinking red indicator light after Windows 11 patch.',
    status: 'New',
    ticket_type: 'Incident',
    priority: 'Urgent',
    created_at: '2026-10-24 10:05:00',
    due_date: '2026-10-24 14:05:00',
    comments: []
  },
  {
    id: 104,
    ticket_number: 'TICK-2026-104',
    employee_name: 'jdelacruz',
    department: 'IT',
    target_department: 'IT',
    assigned_it: 'Jarick Montojo',
    email: 'juan.delacruz@coolaireconsolidated.com',
    subject: 'Core Switch Firmware Upgrade Maintenance',
    description: 'Scheduled firmware patch for Cisco Catalyst 3850 in HQ Server Room to mitigate CVE security advisory.',
    status: 'Resolved',
    ticket_type: 'Change',
    priority: 'High',
    created_at: '2026-10-22 09:00:00',
    due_date: '2026-10-23 09:00:00',
    resolved_at: '2026-10-23 03:30:00',
    resolution_notes: 'Firmware successfully flashed to v16.12.8 during 2 AM maintenance window. All trunk ports operational with zero packet loss.',
    comments: [
      {
        id: 4,
        ticket_id: 104,
        sender: 'Jarick Montojo',
        sender_role: 'Admin',
        message: 'Completed post-reboot health checks. SAN connectivity stable.',
        timestamp: '2026-10-23 03:32:00'
      }
    ]
  },
  {
    id: 105,
    ticket_number: 'TICK-2026-105',
    employee_name: 'asantos',
    department: 'Finance',
    target_department: 'IT',
    email: 'ana.santos@coolaireconsolidated.com',
    subject: 'Dual Monitor HDMI Adapter Request',
    description: 'Requesting USB-C to dual HDMI dock for Dell Latitude 5430 to support dual spreadsheet reconciliation.',
    status: 'Closed',
    ticket_type: 'Request',
    priority: 'Low',
    created_at: '2026-10-20 11:00:00',
    due_date: '2026-10-23 11:00:00',
    resolved_at: '2026-10-21 16:00:00',
    resolution_notes: 'Issued Dell DA310 USB-C hub from stock. Tested with dual 24-inch monitors.',
    comments: []
  }
];

export const initialIerFormsA: IerFormA[] = [
  {
    id: 1,
    ier_no: 'IER-A-2026-0042',
    employee_name: 'Ana Santos',
    position_title: 'Financial Analyst',
    department: 'Finance',
    asset_code: 'CCI-NB-029',
    item_description: 'Dell Latitude 5420 Laptop (14" FHD / Core i5 / 16GB RAM)',
    issue_details: 'Laptop battery swollen causing trackpad to pop out of frame. Overheating rapidly when opening PowerBI reports.',
    dept_head_id: 2,
    dept_head_name: 'Maria Garcia',
    dept_head_status: 'Approved',
    it_personnel_id: 3,
    it_staff_name: 'Juan Dela Cruz',
    it_status: 'Approved',
    workflow_status: 'Completed',
    created_by: 'asantos',
    date_reported: '2026-10-21',
    created_at: '2026-10-21 10:15:00',
    remarks: 'Battery safely removed and disposed. Replacement battery part ordered under warranty service.'
  },
  {
    id: 2,
    ier_no: 'IER-A-2026-0043',
    employee_name: 'Kevin Bautista',
    position_title: 'Logistics Coordinator',
    department: 'Logistics',
    asset_code: 'CCI-PRN-014',
    item_description: 'HP LaserJet Enterprise M507x',
    issue_details: 'Frequent fuser gear grind noise, recurring paper jam at tray 2 roller assembly.',
    dept_head_id: 2,
    dept_head_name: 'Maria Garcia',
    dept_head_status: 'Approved',
    it_personnel_id: 3,
    it_staff_name: 'Juan Dela Cruz',
    it_status: 'Pending',
    workflow_status: 'Under Review',
    created_by: 'kbautista',
    date_reported: '2026-10-23',
    created_at: '2026-10-23 11:40:00',
    remarks: 'Awaiting IT physical inspection of roller assembly kit.'
  },
  {
    id: 3,
    ier_no: 'IER-A-2026-0044',
    employee_name: 'Maria Garcia',
    position_title: 'Operations Manager',
    department: 'Operations',
    asset_code: 'CCI-SVR-003',
    item_description: 'Synology RackStation RS2423+ NAS',
    issue_details: 'Disk Tray 4 amber indicator blinking. S.M.A.R.T. bad sector threshold alert.',
    dept_head_id: 5,
    dept_head_name: 'Roberto Reyes',
    dept_head_status: 'Pending',
    it_personnel_id: 1,
    it_staff_name: 'Jarick Montojo',
    it_status: 'Pending',
    workflow_status: 'Draft',
    created_by: 'mgarcia',
    date_reported: '2026-10-24',
    created_at: '2026-10-24 09:20:00',
    remarks: 'Pre-emptive RMA replacement for RAID6 array spare drive.'
  }
];

export const initialIerFormsB: IerFormB[] = [
  {
    id: 1,
    ier_no: 'IER-B-2026-0018',
    requestor_name: 'Kevin Bautista',
    department: 'Logistics',
    equipment_type: 'Forklift Rugged Tablet PC',
    serial_number: 'RUG-7889-X9',
    service_description: 'Water damage inspection and touchscreen digitizer replacement after heavy rain exposure at loading dock.',
    parts_needed: 'IP67 Digitizer Glass Panel, Rubber Sealing Gasket Kit',
    cost_estimate: 8500,
    technician_name: 'Juan Dela Cruz',
    status: 'In Progress',
    manager_approval: 'Approved',
    management_approval: 'Approved',
    created_at: '2026-10-22 13:00:00'
  },
  {
    id: 2,
    ier_no: 'IER-B-2026-0019',
    requestor_name: 'Maria Garcia',
    department: 'Operations',
    equipment_type: 'HVAC Testing Diagnostic Console',
    serial_number: 'DIAG-HVAC-2024-03',
    service_description: 'Calibration and firmware calibration with Coolaire Central Chiller Monitoring telemetry.',
    parts_needed: 'RS485 to USB Interface converter, probe sensors',
    cost_estimate: 12000,
    technician_name: 'Jarick Montojo',
    status: 'Pending Review',
    manager_approval: 'Approved',
    management_approval: 'Pending',
    created_at: '2026-10-24 08:45:00'
  }
];

export const initialProjects: ITProject[] = [
  {
    id: 1,
    title: 'Coolaire Cloud ERP Migration (Phase 2)',
    description: 'Migrating legacy on-premise inventory, sales order processing, and payroll modules to unified cloud architecture.',
    status: 'In Progress',
    priority: 'Urgent',
    start_date: '2026-09-01',
    end_date: '2026-11-30',
    lead_it: 'Jarick Montojo',
    co_head_it: 'Juan Dela Cruz',
    department: 'IT',
    progress_percent: 65,
    created_at: '2026-09-01'
  },
  {
    id: 2,
    title: 'SD-WAN Inter-Branch Connectivity Deployment',
    description: 'Replacing aging IPsec VPNs with managed SD-WAN links across Manila HQ, Cebu, and Davao depot offices.',
    status: 'To Do',
    priority: 'High',
    start_date: '2026-10-15',
    end_date: '2026-12-15',
    lead_it: 'Juan Dela Cruz',
    co_head_it: 'Jarick Montojo',
    department: 'IT',
    progress_percent: 20,
    created_at: '2026-10-10'
  },
  {
    id: 3,
    title: 'Biometric Access Control & Attendance Integration',
    description: 'Deployment of facial recognition access terminals synced in real-time with HR payroll punch records.',
    status: 'Planning',
    priority: 'Medium',
    start_date: '2026-11-01',
    end_date: '2027-01-31',
    lead_it: 'Jarick Montojo',
    department: 'Human Resources',
    progress_percent: 5,
    created_at: '2026-10-18'
  },
  {
    id: 4,
    title: 'WMS Barcode Modernization for SDC Hub',
    description: 'Integration of real-time 2D barcode tracking for refrigeration components and reefer container parts.',
    status: 'Completed',
    priority: 'High',
    start_date: '2026-07-01',
    end_date: '2026-10-01',
    lead_it: 'Juan Dela Cruz',
    co_head_it: 'Maria Garcia',
    department: 'Operations',
    progress_percent: 100,
    created_at: '2026-07-01'
  }
];

export const initialProjectUpdates: ProjectUpdate[] = [
  {
    id: 1,
    project_id: 1,
    update_text: 'Completed database data scrubbing. 185,000 transaction records successfully mapped to new schema.',
    author: 'Jarick Montojo',
    created_at: '2026-10-22 17:30:00'
  },
  {
    id: 2,
    project_id: 1,
    update_text: 'UAT conducted with Finance team. Payroll batch exports verified against legacy reports.',
    author: 'Jarick Montojo',
    created_at: '2026-10-24 10:00:00'
  },
  {
    id: 3,
    project_id: 4,
    update_text: 'Sign-off received from Logistics and Operations management. Handover documentation published.',
    author: 'Juan Dela Cruz',
    created_at: '2026-10-01 16:00:00'
  }
];

export const initialAssets: Asset[] = [
  {
    id: 1,
    asset_tag: 'CCI-NB-029',
    category: 'Laptop',
    model: 'Dell Latitude 5420',
    serial_number: 'DL5420-7X9B82',
    assigned_user: 'Ana Santos',
    department: 'Finance',
    status: 'Under Maintenance',
    purchase_date: '2024-03-15',
    specs: 'Core i5-1145G7, 16GB RAM, 512GB NVMe SSD'
  },
  {
    id: 2,
    asset_tag: 'CCI-NB-042',
    category: 'Laptop',
    model: 'Lenovo ThinkPad T14 Gen 4',
    serial_number: 'TP-T14-998124',
    assigned_user: 'Jarick Montojo',
    department: 'IT',
    status: 'In Use',
    purchase_date: '2025-01-20',
    specs: 'AMD Ryzen 7 PRO 7840U, 32GB LPDDR5x, 1TB SSD'
  },
  {
    id: 3,
    asset_tag: 'CCI-DT-018',
    category: 'Desktop',
    model: 'HP ProDesk 400 G9',
    serial_number: 'HP-PD-441209',
    assigned_user: 'Maria Garcia',
    department: 'Operations',
    status: 'In Use',
    purchase_date: '2023-11-10',
    specs: 'Core i7-12700, 16GB RAM, Dual 24" Monitors'
  },
  {
    id: 4,
    asset_tag: 'CCI-PRN-014',
    category: 'Printer',
    model: 'HP LaserJet Enterprise M507x',
    serial_number: 'HPLJ-507-6612',
    assigned_user: 'Logistics Department',
    department: 'Logistics',
    status: 'Under Maintenance',
    purchase_date: '2023-06-01',
    specs: 'Monochrome Network Printer, Duplex, Tray 2 & 3'
  },
  {
    id: 5,
    asset_tag: 'CCI-SVR-003',
    category: 'Server',
    model: 'Synology RackStation RS2423+',
    serial_number: 'SYN-RS-2423-01',
    assigned_user: 'IT Infrastructure',
    department: 'IT',
    status: 'In Use',
    purchase_date: '2024-08-12',
    specs: '12-Bay NAS, 96TB RAW RAID6, 10GbE SFP+'
  },
  {
    id: 6,
    asset_tag: 'CCI-NB-050',
    category: 'Laptop',
    model: 'Dell Latitude 3440',
    serial_number: 'DL-3440-229910',
    assigned_user: 'Unassigned (Pool)',
    department: 'IT',
    status: 'Available',
    purchase_date: '2025-09-01',
    specs: 'Core i5-1335U, 16GB RAM, 512GB SSD'
  }
];

export const initialKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: 1,
    title: 'Connecting to Coolaire Corporate VPN (FortiClient)',
    category: 'Network & Remote Access',
    summary: 'Step-by-step instructions for remote staff to authenticate via FortiClient VPN with MFA verification.',
    content: `### Prerequisites:
1. Valid company email credentials.
2. Authenticator app configured on your mobile phone.
3. FortiClient installed from the IT Software Center.

### Connection Steps:
- Open FortiClient and select **Coolaire-SSLVPN**.
- Enter Gateway IP: \`vpn.coolaireconsolidated.com:10443\`.
- Provide your domain username (e.g. \`jdelacruz\`) and password.
- When prompted, input the 6-digit OTP from your mobile authenticator.
- Once connected, mapped network shares (\`Z:\\Shared\` and \`Y:\\Departments\`) will auto-mount.`,
    views: 342,
    helpful_count: 58,
    last_updated: '2026-10-15',
    author: 'Juan Dela Cruz'
  },
  {
    id: 2,
    title: 'Submitting and Tracking IER Inspection Forms',
    category: 'HelpDesk & Equipment Policies',
    summary: 'Guidelines on when to file IER Form A (Equipment Defect/Loss) vs IER Form B (Repair Service).',
    content: `### Form Classification:
- **IER Form A**: Must be submitted immediately whenever company IT equipment (laptop, monitor, mobile device) incurs physical damage, hardware malfunction, or requires replacement.
- **IER Form B**: Submitted by certified technicians or service vendors for repair quotations, parts replacements, and preventative maintenance.

### Approval Routing:
1. Employee submits Form A with asset tag.
2. Department Head reviews and signs within 24 hours.
3. IT Personnel evaluates physical unit and closes the loop.`,
    views: 219,
    helpful_count: 42,
    last_updated: '2026-10-12',
    author: 'Jarick Montojo'
  },
  {
    id: 3,
    title: 'Configuring Coolaire Email on Outlook Mobile (iOS / Android)',
    category: 'Email & Accounts',
    summary: 'How to add Microsoft 365 Exchange email securely to your personal or company smartphone.',
    content: `### Setup Instructions:
1. Download **Microsoft Outlook** from Apple App Store or Google Play Store.
2. Launch app and enter your corporate email address: \`username@coolaireconsolidated.com\`.
3. You will be redirected to the CCI Single Sign-On portal.
4. Complete two-factor SMS or push approval.
5. In accordance with CCI Security Policy, a device PIN or biometrics lock is required to access corporate mailbox data.`,
    views: 488,
    helpful_count: 91,
    last_updated: '2026-09-28',
    author: 'Juan Dela Cruz'
  }
];

export const initialSystemSettings: SystemSettings = {
  company_pin: '7799',
  company_name: 'Coolaire Consolidated Inc.',
  smtp_server: 'smtp.office365.com',
  smtp_port: 587,
  sender_email: 'it-helpdesk@coolaireconsolidated.com',
  system_notice: 'Scheduled server maintenance window every Sunday from 02:00 AM to 04:00 AM PHT.',
  maintenance_mode: false,
  role_permissions: {
    menu_directory: ['manager', 'management', 'admin', 'super admin', 'it support'],
    menu_ier_b: ['manager', 'management', 'admin', 'super admin', 'it support'],
    menu_admin_tools: ['management', 'admin', 'super admin'],
    menu_ier_hub: ['manager', 'management', 'admin', 'super admin', 'it support'],
    menu_it_projects: ['manager', 'management', 'admin', 'super admin', 'it support']
  }
};

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 1,
    username: 'admin',
    action: 'SYSTEM_BOOTSTRAP',
    target_type: 'System',
    target_id: '1',
    details: 'Initial workspace database initialized successfully',
    ip_address: '127.0.0.1',
    timestamp: '2026-10-24 07:00:00'
  },
  {
    id: 2,
    username: 'asantos',
    action: 'CREATE_TICKET',
    target_type: 'Ticket',
    target_id: '101',
    details: 'Submitted ticket: SAP ERP Client Fails to Connect',
    ip_address: '192.168.10.45',
    timestamp: '2026-10-24 08:30:00'
  },
  {
    id: 3,
    username: 'jdelacruz',
    action: 'ASSIGN_TICKET',
    target_type: 'Ticket',
    target_id: '101',
    details: 'Assigned to Juan Dela Cruz',
    ip_address: '192.168.10.12',
    timestamp: '2026-10-24 08:45:00'
  },
  {
    id: 4,
    username: 'admin',
    action: 'LOGIN_SUCCESS',
    target_type: 'User',
    target_id: '999',
    details: 'Hardcoded / administrative sign-in',
    ip_address: '192.168.10.1',
    timestamp: '2026-10-24 09:00:00'
  }
];
