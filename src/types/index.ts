export type UserRole = 
  | 'super admin'
  | 'admin'
  | 'management'
  | 'manager'
  | 'it support'
  | 'employee';

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  department: string;
  role: UserRole;
  phone?: string;
  position?: string;
  signature?: string; // base64 data url
  avatar?: string;
  status: 'active' | 'inactive';
}

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketStatus = 
  | 'New'
  | 'Assigned'
  | 'In Progress'
  | 'Pending Approval'
  | 'Resolved'
  | 'Closed';

export type TicketType = 'Incident' | 'Request' | 'Inquiry' | 'Change' | 'Problem';

export interface TicketComment {
  id: number;
  ticket_id: number;
  sender: string;
  sender_role?: string;
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  employee_name: string;
  department: string;
  target_department: string;
  assigned_it?: string;
  anydesk_id?: string;
  email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  ticket_type: TicketType;
  priority: TicketPriority;
  approver_id?: number | null;
  approver_name?: string;
  approver_status?: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  due_date: string;
  resolved_at?: string;
  resolution_notes?: string;
  reference_form_name?: string;
  screenshot_photo_name?: string;
  comments: TicketComment[];
  is_archived?: boolean;
}

export interface IerFormA {
  id: number;
  ier_no: string;
  employee_name: string;
  position_title: string;
  department: string;
  asset_code: string;
  item_description: string;
  issue_details: string;
  dept_head_id: number;
  dept_head_name?: string;
  dept_head_status: 'Pending' | 'Approved' | 'Rejected';
  it_personnel_id: number;
  it_staff_name?: string;
  it_status: 'Pending' | 'Approved' | 'Rejected';
  workflow_status: 'Draft' | 'Under Review' | 'Approved' | 'Completed';
  created_by: string;
  date_reported: string;
  created_at: string;
  remarks?: string;
}

export interface IerFormB {
  id: number;
  ier_no: string;
  requestor_name: string;
  department: string;
  equipment_type: string;
  serial_number: string;
  service_description: string;
  parts_needed?: string;
  cost_estimate?: number;
  technician_name: string;
  status: 'Draft' | 'Pending Review' | 'In Progress' | 'Completed';
  manager_approval: 'Pending' | 'Approved' | 'Rejected';
  management_approval: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  date_serviced?: string;
}

export interface ProjectUpdate {
  id: number;
  project_id: number;
  update_text: string;
  author: string;
  created_at: string;
}

export type ProjectStatus = 'Planning' | 'To Do' | 'In Progress' | 'In Review' | 'Completed';

export interface ITProject {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: TicketPriority;
  start_date: string;
  end_date: string;
  lead_it: string;
  co_head_it?: string;
  department: string;
  progress_percent?: number;
  created_at: string;
}

export interface Asset {
  id: number;
  asset_tag: string;
  category: 'Laptop' | 'Desktop' | 'Printer' | 'Server' | 'Network' | 'Mobile';
  model: string;
  serial_number: string;
  assigned_user: string;
  department: string;
  status: 'In Use' | 'Available' | 'Under Maintenance' | 'Retired';
  purchase_date: string;
  specs?: string;
}

export interface SlaPolicy {
  id: number;
  ticket_type: TicketType;
  priority: TicketPriority;
  response_in_hours: number;
  resolve_in_hours: number;
  escalation_level: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  manager_name: string;
  head_count: number;
}

export interface TicketTypeCategory {
  id: number;
  name: TicketType;
  department: string;
  default_priority: TicketPriority;
  description: string;
}

export interface AuditLogEntry {
  id: number;
  username: string;
  action: string;
  target_type?: string;
  target_id?: string | number;
  details?: string;
  ip_address: string;
  timestamp: string;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  views: number;
  helpful_count: number;
  last_updated: string;
  author: string;
}

export interface SystemSettings {
  company_pin: string;
  company_name: string;
  smtp_server: string;
  smtp_port: number;
  sender_email: string;
  system_notice: string;
  maintenance_mode: boolean;
  role_permissions: {
    menu_directory: UserRole[];
    menu_ier_b: UserRole[];
    menu_admin_tools: UserRole[];
    menu_ier_hub: UserRole[];
    menu_it_projects: UserRole[];
  };
}
