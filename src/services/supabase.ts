import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ticket, User, IerFormA, IerFormB, ITProject, Asset } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastSynced?: string;
  error?: string;
}

const STORAGE_KEY_URL = 'cci_supabase_url';
const STORAGE_KEY_KEY = 'cci_supabase_anon_key';

export function getSavedSupabaseConfig(): { url: string; anonKey: string } {
  const env = (typeof import.meta !== 'undefined' ? (import.meta as any).env : {}) || {};
  const url = localStorage.getItem(STORAGE_KEY_URL) || env.VITE_SUPABASE_URL || '';
  const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || env.VITE_SUPABASE_ANON_KEY || '';
  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  cachedClient = null;
  cachedUrl = '';
  cachedKey = '';
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: false }
    });
    cachedUrl = url;
    cachedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  url?: string,
  anonKey?: string
): Promise<{ success: boolean; message: string }> {
  const targetUrl = url || getSavedSupabaseConfig().url;
  const targetKey = anonKey || getSavedSupabaseConfig().anonKey;

  if (!targetUrl || !targetKey) {
    return { success: false, message: 'Please provide both Supabase Project URL and Anon API Key.' };
  }

  try {
    const client = createClient(targetUrl, targetKey, { auth: { persistSession: false } });
    const { error } = await client.from('tickets').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Tables need initialization - use the SQL Schema generator in settings).'
        };
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, message: 'Cannot reach Supabase host. Check your Project URL.' };
      }
      if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('apiKey')) {
        return { success: false, message: 'Invalid Anon API Key. Verify your Supabase project API credentials.' };
      }
      return { success: true, message: `Connected to Supabase! (${error.message})` };
    }

    return { success: true, message: 'Successfully connected and verified Supabase database connection!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection test failed.' };
  }
}

export async function fetchRemoteTickets(): Promise<Ticket[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase tickets query note:', error?.message);
      return null;
    }
    return data as Ticket[];
  } catch (err) {
    console.error('Error fetching Supabase tickets:', err);
    return null;
  }
}

export async function syncTicketToRemote(ticket: Ticket): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('tickets').upsert({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      employee_name: ticket.employee_name,
      department: ticket.department,
      target_department: ticket.target_department || 'Information Technology',
      assigned_it: ticket.assigned_it || '',
      anydesk_id: ticket.anydesk_id || '',
      email: ticket.email,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      ticket_type: ticket.ticket_type,
      priority: ticket.priority,
      approver_id: ticket.approver_id || null,
      approver_name: ticket.approver_name || '',
      approver_status: ticket.approver_status || 'Approved',
      created_at: ticket.created_at,
      due_date: ticket.due_date || '',
      resolved_at: ticket.resolved_at || null,
      resolution_notes: ticket.resolution_notes || '',
      reference_form_name: ticket.reference_form_name || '',
      screenshot_photo_name: ticket.screenshot_photo_name || '',
      comments: ticket.comments || [],
      is_archived: Boolean(ticket.is_archived)
    });
    return !error;
  } catch (err) {
    console.error('Error syncing ticket to Supabase:', err);
    return false;
  }
}

export async function syncAssetToRemote(asset: Asset): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('assets').upsert({
      id: asset.id,
      asset_tag: asset.asset_tag,
      category: asset.category,
      model: asset.model,
      serial_number: asset.serial_number,
      assigned_user: asset.assigned_user,
      department: asset.department,
      status: asset.status,
      purchase_date: asset.purchase_date,
      specs: asset.specs || ''
    });
    return !error;
  } catch (err) {
    console.error('Error syncing asset to Supabase:', err);
    return false;
  }
}

export async function syncIerAToRemote(form: IerFormA): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('ier_forms_a').upsert({
      id: form.id,
      ier_no: form.ier_no,
      employee_name: form.employee_name,
      position_title: form.position_title,
      department: form.department,
      asset_code: form.asset_code,
      item_description: form.item_description,
      issue_details: form.issue_details,
      dept_head_id: form.dept_head_id,
      dept_head_name: form.dept_head_name || '',
      dept_head_status: form.dept_head_status,
      it_personnel_id: form.it_personnel_id,
      it_staff_name: form.it_staff_name || '',
      it_status: form.it_status,
      workflow_status: form.workflow_status,
      created_by: form.created_by,
      date_reported: form.date_reported,
      created_at: form.created_at,
      remarks: form.remarks || ''
    });
    return !error;
  } catch (err) {
    console.error('Error syncing IER Form A to Supabase:', err);
    return false;
  }
}

export async function syncIerBToRemote(form: IerFormB): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('ier_forms_b').upsert({
      id: form.id,
      ier_no: form.ier_no,
      requestor_name: form.requestor_name,
      department: form.department,
      equipment_type: form.equipment_type,
      serial_number: form.serial_number,
      service_description: form.service_description,
      parts_needed: form.parts_needed || '',
      cost_estimate: form.cost_estimate || 0,
      technician_name: form.technician_name,
      status: form.status,
      manager_approval: form.manager_approval,
      management_approval: form.management_approval,
      created_at: form.created_at,
      date_serviced: form.date_serviced || null
    });
    return !error;
  } catch (err) {
    console.error('Error syncing IER Form B to Supabase:', err);
    return false;
  }
}

export async function syncProjectToRemote(project: ITProject): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('it_projects').upsert({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      start_date: project.start_date,
      end_date: project.end_date,
      lead_it: project.lead_it,
      co_head_it: project.co_head_it || '',
      department: project.department,
      progress_percent: project.progress_percent ?? 0,
      created_at: project.created_at
    });
    return !error;
  } catch (err) {
    console.error('Error syncing Project to Supabase:', err);
    return false;
  }
}

/**
 * Pushes all workspace data to Supabase in batch.
 */
export async function pushAllDataToSupabase(data: {
  tickets: Ticket[];
  users: User[];
  assets: Asset[];
  ierFormsA: IerFormA[];
  ierFormsB: IerFormB[];
  projects: ITProject[];
}): Promise<{ success: boolean; message: string; counts: Record<string, number> }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase client is not connected. Enter your Project URL & Anon Key first.',
      counts: {}
    };
  }

  const counts: Record<string, number> = {
    tickets: 0,
    assets: 0,
    ierFormsA: 0,
    ierFormsB: 0,
    projects: 0
  };

  try {
    for (const t of data.tickets) {
      if (await syncTicketToRemote(t)) counts.tickets++;
    }
    for (const a of data.assets) {
      if (await syncAssetToRemote(a)) counts.assets++;
    }
    for (const fa of data.ierFormsA) {
      if (await syncIerAToRemote(fa)) counts.ierFormsA++;
    }
    for (const fb of data.ierFormsB) {
      if (await syncIerBToRemote(fb)) counts.ierFormsB++;
    }
    for (const p of data.projects) {
      if (await syncProjectToRemote(p)) counts.projects++;
    }

    return {
      success: true,
      message: `Pushed ${counts.tickets} tickets, ${counts.assets} assets, ${counts.ierFormsA + counts.ierFormsB} IER reports, and ${counts.projects} IT projects to Supabase!`,
      counts
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Push to Supabase failed: ${err.message}`,
      counts
    };
  }
}

/**
 * Generates ready-to-run PostgreSQL DDL SQL script for Supabase SQL Editor.
 */
export function getSupabaseSchemaSql(): string {
  return `-- ====================================================================
-- COOLAIRE CONSOLIDATED INC. (CCI) - SUPABASE POSTGRESQL SCHEMA
-- Execute this script in your Supabase Dashboard: SQL Editor -> New Query
-- ====================================================================

-- 1. HelpDesk Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
    id BIGINT PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    employee_name TEXT NOT NULL,
    department TEXT NOT NULL,
    target_department TEXT DEFAULT 'Information Technology',
    assigned_it TEXT DEFAULT '',
    anydesk_id TEXT DEFAULT '',
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    ticket_type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium',
    approver_id BIGINT,
    approver_name TEXT DEFAULT '',
    approver_status TEXT DEFAULT 'Approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TEXT,
    resolved_at TEXT,
    resolution_notes TEXT DEFAULT '',
    reference_form_name TEXT DEFAULT '',
    screenshot_photo_name TEXT DEFAULT '',
    comments JSONB DEFAULT '[]'::jsonb,
    is_archived BOOLEAN DEFAULT FALSE
);

-- 2. Hardware and IT Asset Inventory
CREATE TABLE IF NOT EXISTS public.assets (
    id BIGINT PRIMARY KEY,
    asset_tag TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    assigned_user TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'In Use',
    purchase_date TEXT NOT NULL,
    specs TEXT DEFAULT ''
);

-- 3. IER Form A: Inspection & Evaluation Reports
CREATE TABLE IF NOT EXISTS public.ier_forms_a (
    id BIGINT PRIMARY KEY,
    ier_no TEXT NOT NULL UNIQUE,
    employee_name TEXT NOT NULL,
    position_title TEXT NOT NULL,
    department TEXT NOT NULL,
    asset_code TEXT NOT NULL,
    item_description TEXT NOT NULL,
    issue_details TEXT NOT NULL,
    dept_head_id BIGINT DEFAULT 0,
    dept_head_name TEXT DEFAULT '',
    dept_head_status TEXT NOT NULL DEFAULT 'Pending',
    it_personnel_id BIGINT DEFAULT 0,
    it_staff_name TEXT DEFAULT '',
    it_status TEXT NOT NULL DEFAULT 'Pending',
    workflow_status TEXT NOT NULL DEFAULT 'Draft',
    created_by TEXT NOT NULL,
    date_reported TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remarks TEXT DEFAULT ''
);

-- 4. IER Form B: Equipment Repair & Maintenance
CREATE TABLE IF NOT EXISTS public.ier_forms_b (
    id BIGINT PRIMARY KEY,
    ier_no TEXT NOT NULL UNIQUE,
    requestor_name TEXT NOT NULL,
    department TEXT NOT NULL,
    equipment_type TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    service_description TEXT NOT NULL,
    parts_needed TEXT DEFAULT '',
    cost_estimate NUMERIC DEFAULT 0,
    technician_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    manager_approval TEXT NOT NULL DEFAULT 'Pending',
    management_approval TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_serviced TEXT
);

-- 5. IT Project Roadmap & Portfolio
CREATE TABLE IF NOT EXISTS public.it_projects (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planning',
    priority TEXT NOT NULL DEFAULT 'Medium',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    lead_it TEXT NOT NULL,
    co_head_it TEXT DEFAULT '',
    department TEXT NOT NULL,
    progress_percent INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) & Public Anon Access Policy
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ier_forms_a ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ier_forms_b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read/write tickets" ON public.tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write ier_forms_a" ON public.ier_forms_a FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write ier_forms_b" ON public.ier_forms_b FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write it_projects" ON public.it_projects FOR ALL USING (true) WITH CHECK (true);
`;
}
