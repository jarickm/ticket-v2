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
  const env = (import.meta as any).env || {};
  const url = localStorage.getItem(STORAGE_KEY_URL) || env.VITE_SUPABASE_URL || '';
  const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || env.VITE_SUPABASE_ANON_KEY || '';
  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
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

export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  const targetUrl = url || getSavedSupabaseConfig().url;
  const targetKey = anonKey || getSavedSupabaseConfig().anonKey;

  if (!targetUrl || !targetKey) {
    return { success: false, message: 'Please provide both Supabase Project URL and Anon API Key.' };
  }

  try {
    const client = createClient(targetUrl, targetKey, { auth: { persistSession: false } });
    // Attempt a light ping by querying any table or system info
    const { error } = await client.from('tickets').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // Table might not exist or auth failed
      if (error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
        return { success: false, message: 'Cannot reach Supabase host. Check URL validity.' };
      }
      return { success: true, message: `Connected to Supabase! Note: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected and verified Supabase database connection.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection test failed.' };
  }
}

export async function fetchRemoteTickets(): Promise<Ticket[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('tickets').select('*').order('created_at', { ascending: false });
    if (error || !data) {
      console.warn('Supabase tickets query warning:', error);
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
      target_department: ticket.target_department,
      assigned_it: ticket.assigned_it,
      anydesk_id: ticket.anydesk_id,
      email: ticket.email,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      ticket_type: ticket.ticket_type,
      priority: ticket.priority,
      approver_id: ticket.approver_id,
      approver_name: ticket.approver_name,
      approver_status: ticket.approver_status,
      created_at: ticket.created_at,
      due_date: ticket.due_date,
      resolution_notes: ticket.resolution_notes,
      reference_form_name: ticket.reference_form_name,
      screenshot_photo_name: ticket.screenshot_photo_name,
      comments: ticket.comments,
      is_archived: ticket.is_archived
    });
    return !error;
  } catch (err) {
    console.error('Error syncing ticket to Supabase:', err);
    return false;
  }
}
