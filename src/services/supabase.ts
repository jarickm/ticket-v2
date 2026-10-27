import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ticket, User, IerFormA, IerFormB, ITProject, Asset, Department, SlaPolicy } from '../types';

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
  // First attempt live PostgreSQL database API
  try {
    const res = await fetch('/api/db/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket)
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn('Backend ticket sync note:', e);
  }

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

export async function syncTicketCommentToRemote(ticketId: number, sender: string, message: string): Promise<boolean> {
  try {
    const res = await fetch('/api/db/ticket/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, sender, message })
    });
    return res.ok;
  } catch (e) {
    console.warn('Backend ticket comment sync note:', e);
    return false;
  }
}

export async function syncTicketStatusToRemote(ticketId: number, status: string, resolutionNotes?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/db/ticket/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, status, resolutionNotes })
    });
    return res.ok;
  } catch (e) {
    console.warn('Backend ticket status sync note:', e);
    return false;
  }
}

export async function syncTicketAssignToRemote(ticketId: number, assignedIt: string): Promise<boolean> {
  try {
    const res = await fetch('/api/db/ticket/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, assignedIt })
    });
    return res.ok;
  } catch (e) {
    console.warn('Backend ticket assign sync note:', e);
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
  // First attempt live PostgreSQL database API
  try {
    const res = await fetch('/api/db/ier-a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn('Backend IER-A sync note:', e);
  }

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
  // First attempt live PostgreSQL database API
  try {
    const res = await fetch('/api/db/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn('Backend Project sync note:', e);
  }

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

export async function fetchRemoteAssets(): Promise<Asset[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('assets')
      .select('*')
      .order('id', { ascending: false });

    if (error || !data) {
      console.warn('Supabase assets query note:', error?.message);
      return null;
    }
    return data as Asset[];
  } catch (err) {
    console.error('Error fetching Supabase assets:', err);
    return null;
  }
}

export async function fetchRemoteIerFormsA(): Promise<IerFormA[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('ier_forms_a')
      .select('*')
      .order('id', { ascending: false });

    if (error || !data) {
      console.warn('Supabase ier_forms_a query note:', error?.message);
      return null;
    }
    return data as IerFormA[];
  } catch (err) {
    console.error('Error fetching Supabase ier_forms_a:', err);
    return null;
  }
}

export async function fetchRemoteIerFormsB(): Promise<IerFormB[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('ier_forms_b')
      .select('*')
      .order('id', { ascending: false });

    if (error || !data) {
      console.warn('Supabase ier_forms_b query note:', error?.message);
      return null;
    }
    return data as IerFormB[];
  } catch (err) {
    console.error('Error fetching Supabase ier_forms_b:', err);
    return null;
  }
}

export async function fetchRemoteProjects(): Promise<ITProject[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('it_projects')
      .select('*')
      .order('id', { ascending: false });

    if (error || !data) {
      console.warn('Supabase it_projects query note:', error?.message);
      return null;
    }
    return data as ITProject[];
  } catch (err) {
    console.error('Error fetching Supabase it_projects:', err);
    return null;
  }
}

export async function fetchRemoteUsers(): Promise<User[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .order('user_id', { ascending: false });

    if (error || !data) {
      console.warn('Supabase users query note:', error?.message);
      return null;
    }
    return data as User[];
  } catch (err) {
    console.error('Error fetching Supabase users:', err);
    return null;
  }
}

export async function syncUserToRemote(user: User): Promise<boolean> {
  // First attempt live PostgreSQL database API
  try {
    const res = await fetch('/api/db/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn('Backend user sync note:', e);
  }

  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('users').upsert({
      user_id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      department: user.department,
      role: user.role,
      phone: user.phone || '',
      position: user.position || '',
      status: user.status || 'active',
      avatar: user.avatar || ''
    });
    return !error;
  } catch (err) {
    console.error('Error syncing user to Supabase:', err);
    return false;
  }
}

export async function deleteTicketFromRemote(id: number): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('tickets').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteAssetFromRemote(id: number): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('assets').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteProjectFromRemote(id: number): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('it_projects').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchRemoteDepartments(): Promise<Department[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('departments')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data) {
      return null;
    }
    return data as Department[];
  } catch (err) {
    console.error('Error fetching Supabase departments:', err);
    return null;
  }
}

export async function syncDepartmentToRemote(dept: Department): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('departments').upsert({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      manager_name: dept.manager_name || '',
      head_count: dept.head_count || 1
    });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchRemoteSlaPolicies(): Promise<SlaPolicy[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('sla_policies')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data) {
      return null;
    }
    return data as SlaPolicy[];
  } catch (err) {
    console.error('Error fetching Supabase SLA policies:', err);
    return null;
  }
}

export async function syncSlaPolicyToRemote(policy: SlaPolicy): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('sla_policies').upsert({
      id: policy.id,
      ticket_type: policy.ticket_type,
      priority: policy.priority,
      response_in_hours: policy.response_in_hours,
      resolve_in_hours: policy.resolve_in_hours,
      escalation_level: policy.escalation_level || 'Tier 1'
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Subscribes to real-time postgres changes across Supabase tables.
 */
export function subscribeToSupabaseChanges(onChange: (table: string) => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('public_cloud_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          if (payload && payload.table) {
            onChange(payload.table);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Realtime subscription error:', e);
    return () => {};
  }
}

/**
 * Pulls all records from Supabase tables to ensure existing data is loaded.
 */
export async function pullAllDataFromSupabase(): Promise<{
  success: boolean;
  message: string;
  data: {
    tickets?: Ticket[];
    assets?: Asset[];
    ierFormsA?: IerFormA[];
    ierFormsB?: IerFormB[];
    projects?: ITProject[];
    projectUpdates?: any[];
    users?: User[];
    departments?: Department[];
    slaPolicies?: SlaPolicy[];
    knowledgeArticles?: any[];
    systemSettings?: any;
    auditLogs?: any[];
  };
}> {
  // 1. Primary: Direct live PostgreSQL connection to Supabase cloud database
  try {
    const res = await fetch('/api/db/pull-all');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const ticketCount = json.counts?.tickets ?? json.data.tickets?.length ?? 0;
        const userCount = json.counts?.users ?? json.data.users?.length ?? 0;
        return {
          success: true,
          message: `Connected to Supabase! Loaded ${ticketCount} live tickets, ${userCount} corporate users, and enterprise tables.`,
          data: json.data
        };
      }
    }
  } catch (err: any) {
    console.warn('[Supabase Live API Pull Note]:', err?.message || err);
  }

  // 2. Secondary fallback: direct Supabase JS SDK client
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase is not connected. Enter Project URL and Anon API Key.',
      data: {}
    };
  }

  try {
    const [
      remoteTickets,
      remoteAssets,
      remoteIerA,
      remoteIerB,
      remoteProjects,
      remoteUsers,
      remoteDepts,
      remoteSlas
    ] = await Promise.all([
      fetchRemoteTickets(),
      fetchRemoteAssets(),
      fetchRemoteIerFormsA(),
      fetchRemoteIerFormsB(),
      fetchRemoteProjects(),
      fetchRemoteUsers(),
      fetchRemoteDepartments(),
      fetchRemoteSlaPolicies()
    ]);

    const resultData: {
      tickets?: Ticket[];
      assets?: Asset[];
      ierFormsA?: IerFormA[];
      ierFormsB?: IerFormB[];
      projects?: ITProject[];
      users?: User[];
      departments?: Department[];
      slaPolicies?: SlaPolicy[];
    } = {};

    let totalFetched = 0;
    if (remoteTickets && remoteTickets.length > 0) {
      resultData.tickets = remoteTickets;
      totalFetched += remoteTickets.length;
    }
    if (remoteAssets && remoteAssets.length > 0) {
      resultData.assets = remoteAssets;
      totalFetched += remoteAssets.length;
    }
    if (remoteIerA && remoteIerA.length > 0) {
      resultData.ierFormsA = remoteIerA;
      totalFetched += remoteIerA.length;
    }
    if (remoteIerB && remoteIerB.length > 0) {
      resultData.ierFormsB = remoteIerB;
      totalFetched += remoteIerB.length;
    }
    if (remoteProjects && remoteProjects.length > 0) {
      resultData.projects = remoteProjects;
      totalFetched += remoteProjects.length;
    }
    if (remoteUsers && remoteUsers.length > 0) {
      resultData.users = remoteUsers;
      totalFetched += remoteUsers.length;
    }
    if (remoteDepts && remoteDepts.length > 0) {
      resultData.departments = remoteDepts;
      totalFetched += remoteDepts.length;
    }
    if (remoteSlas && remoteSlas.length > 0) {
      resultData.slaPolicies = remoteSlas;
      totalFetched += remoteSlas.length;
    }

    return {
      success: true,
      message: `Retrieved ${totalFetched} records directly from Supabase tables!`,
      data: resultData
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error pulling data from Supabase.',
      data: {}
    };
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
  departments?: Department[];
  slaPolicies?: SlaPolicy[];
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
    projects: 0,
    users: 0,
    departments: 0,
    slaPolicies: 0
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
    for (const u of data.users) {
      if (await syncUserToRemote(u)) counts.users++;
    }
    if (data.departments) {
      for (const d of data.departments) {
        if (await syncDepartmentToRemote(d)) counts.departments++;
      }
    }
    if (data.slaPolicies) {
      for (const s of data.slaPolicies) {
        if (await syncSlaPolicyToRemote(s)) counts.slaPolicies++;
      }
    }

    return {
      success: true,
      message: `Pushed ${counts.tickets} tickets, ${counts.assets} assets, ${counts.ierFormsA + counts.ierFormsB} IER reports, ${counts.projects} IT projects, and ${counts.users} users to Supabase!`,
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

-- 6. Users & Personnel Directory Table
CREATE TABLE IF NOT EXISTS public.users (
    user_id BIGINT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    phone TEXT DEFAULT '',
    position TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    avatar TEXT DEFAULT ''
);

-- 7. Corporate Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL,
    manager_name TEXT DEFAULT '',
    head_count INT DEFAULT 1
);

-- 8. SLA Policies Master Table
CREATE TABLE IF NOT EXISTS public.sla_policies (
    id BIGINT PRIMARY KEY,
    ticket_type TEXT NOT NULL,
    priority TEXT NOT NULL,
    response_in_hours NUMERIC NOT NULL,
    resolve_in_hours NUMERIC NOT NULL,
    escalation_level TEXT DEFAULT 'Tier 1'
);

-- 9. Enable Row Level Security (RLS) & Public Anon Access Policy
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ier_forms_a ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ier_forms_b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read/write tickets" ON public.tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write ier_forms_a" ON public.ier_forms_a FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write ier_forms_b" ON public.ier_forms_b FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write it_projects" ON public.it_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write sla_policies" ON public.sla_policies FOR ALL USING (true) WITH CHECK (true);
`;
}
