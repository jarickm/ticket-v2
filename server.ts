import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Live Supabase PostgreSQL Connection Pool
const LIVE_DB_URI =
  process.env.LIVE_DB_URI ||
  'postgresql://postgres.tqjvwfikswvppeyopvdg:3srdUc8IFDiUkbJu@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pgPool: pg.Pool | null = null;

function getPgPool(): pg.Pool {
  if (pgPool) return pgPool;
  pgPool = new Pool({
    connectionString: LIVE_DB_URI,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
  pgPool.on('error', (err) => {
    console.warn('[Postgres Pool] Unexpected idle client error:', err.message);
  });
  return pgPool;
}

// Lazy initialize Gemini client using official recommended guidelines
let aiInstance: GoogleGenAI | null = null;

function isValidGeminiKey(key: string | undefined): boolean {
  if (!key) return false;
  // Standard Gemini API keys start with AIzaSy...
  return key.startsWith('AIza') && key.length >= 30;
}

function getAI(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!isValidGeminiKey(apiKey)) {
    return null;
  }
  try {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    return aiInstance;
  } catch (err) {
    console.warn('[Gemini Server] AI client initialization note:', err);
    return null;
  }
}

// Multi-model resilience fallback chain
async function generateWithFallback(ai: GoogleGenAI, params: any) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;
  for (const model of models) {
    try {
      return await ai.models.generateContent({
        ...params,
        model
      });
    } catch (err: any) {
      lastError = err;
      if (err?.message?.includes('API key not valid') || err?.status === 400) {
        // Invalid key, immediately break to fallback
        aiInstance = null;
        return null;
      }
      console.warn(`[Gemini Server] Model ${model} retry note (${err?.status || err?.message})`);
    }
  }
  return null;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// ============================================================================
// LIVE SUPABASE POSTGRESQL DATABASE API
// ============================================================================

// Database connection status & count check
app.get('/api/db/status', async (_req: Request, res: Response) => {
  try {
    const pool = getPgPool();
    const [tRes, uRes, dRes, pRes, faRes, fbRes, logRes] = await Promise.all([
      pool.query('SELECT count(*) FROM tickets'),
      pool.query('SELECT count(*) FROM users'),
      pool.query('SELECT count(*) FROM departments'),
      pool.query('SELECT count(*) FROM it_projects'),
      pool.query('SELECT count(*) FROM ier_forms_a'),
      pool.query('SELECT count(*) FROM ier_forms_b'),
      pool.query('SELECT count(*) FROM audit_log')
    ]);

    res.json({
      success: true,
      connected: true,
      database: 'Supabase PostgreSQL Cloud (aws-1-ap-northeast-1.pooler.supabase.com)',
      counts: {
        tickets: Number(tRes.rows[0]?.count || 0),
        users: Number(uRes.rows[0]?.count || 0),
        departments: Number(dRes.rows[0]?.count || 0),
        projects: Number(pRes.rows[0]?.count || 0),
        ierFormsA: Number(faRes.rows[0]?.count || 0),
        ierFormsB: Number(fbRes.rows[0]?.count || 0),
        auditLogs: Number(logRes.rows[0]?.count || 0)
      }
    });
  } catch (err: any) {
    console.error('[DB API Status Error]:', err.message);
    res.status(500).json({
      success: false,
      connected: false,
      error: err.message
    });
  }
});

// Comprehensive Pull: Returns all records from live PostgreSQL database
app.get('/api/db/pull-all', async (_req: Request, res: Response) => {
  try {
    const pool = getPgPool();

    const [
      ticketsRes,
      commentsRes,
      usersRes,
      deptsRes,
      projectsRes,
      projUpdatesRes,
      ierARes,
      ierBRes,
      kbRes,
      settingsRes,
      auditRes
    ] = await Promise.all([
      pool.query(`
        SELECT 
          ticket_id, created_at, employee_name, department, location, anydesk_id, email, 
          subject, category, other_specify, description, status, assigned_it, it_resolution, 
          resolved_at, resolution_text, priority, resolution_due, preferred_it, ticket_type, 
          approval_status, approver_id, resolution_notes, asset_tag, target_department, 
          assigned_user, reference_form_name, screenshot_photo_name 
        FROM tickets 
        ORDER BY ticket_id DESC
      `),
      pool.query(`
        SELECT id, ticket_id, sender, message, created_at 
        FROM ticket_comments 
        ORDER BY id ASC
      `),
      pool.query(`
        SELECT user_id, username, full_name, email, role, department 
        FROM users 
        ORDER BY user_id ASC
      `),
      pool.query(`
        SELECT id, name, dept_head 
        FROM departments 
        ORDER BY id ASC
      `),
      pool.query(`
        SELECT id, title, description, status, priority, start_date, end_date, lead_it, co_head_it, budget_estimate, department, created_at 
        FROM it_projects 
        ORDER BY id DESC
      `),
      pool.query(`
        SELECT id, project_id, update_text, author, created_at 
        FROM it_project_updates 
        ORDER BY id ASC
      `),
      pool.query(`
        SELECT id, ier_no, employee_name, date_reported, item_description, issue_details, created_by, asset_code, position_title, department, created_at, file_name, dept_head_id, it_personnel_id, dept_head_status, it_status, workflow_status 
        FROM ier_forms_a 
        ORDER BY id DESC
      `),
      pool.query(`
        SELECT id, ier_no, ref_ier_a_no, employee_name, position_title, department, item_description, asset_code, endorsee, cause_issue, recommendations, actions_taken, materials, results, it_staff, created_at, date_reported, workflow_status 
        FROM ier_forms_b 
        ORDER BY id DESC
      `),
      pool.query(`
        SELECT article_id, title, content, category, created_at, last_updated_by 
        FROM knowledge_base 
        ORDER BY article_id ASC
      `),
      pool.query(`
        SELECT setting_key, setting_value 
        FROM system_settings
      `),
      pool.query(`
        SELECT log_id, user_id, username, action, target_type, target_id, details, timestamp 
        FROM audit_log 
        ORDER BY log_id DESC 
        LIMIT 500
      `)
    ]);

    // Group comments by ticket_id
    const commentsByTicket: Record<number, any[]> = {};
    for (const c of commentsRes.rows) {
      if (!commentsByTicket[c.ticket_id]) {
        commentsByTicket[c.ticket_id] = [];
      }
      commentsByTicket[c.ticket_id].push({
        id: c.id,
        ticket_id: c.ticket_id,
        sender: c.sender || 'Staff',
        message: c.message || '',
        timestamp: c.created_at ? new Date(c.created_at).toISOString().replace('T', ' ').substring(0, 19) : ''
      });
    }

    // Map tickets
    const tickets = ticketsRes.rows.map((r) => ({
      id: r.ticket_id,
      ticket_number: `TICK-${r.ticket_id}`,
      employee_name: r.employee_name || 'Anonymous',
      department: r.department || 'General',
      target_department: r.target_department || 'Information Technology',
      assigned_it: r.assigned_it || '',
      anydesk_id: r.anydesk_id || '',
      email: r.email || '',
      subject: r.subject || 'No Subject',
      description: r.description || '',
      status: r.status || 'New',
      ticket_type: r.ticket_type || r.category || 'Incident',
      priority: r.priority || 'Medium',
      approver_id: r.approver_id || null,
      approver_name: '',
      approver_status: r.approval_status || 'Approved',
      created_at: r.created_at ? new Date(r.created_at).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString(),
      due_date: r.resolution_due ? new Date(r.resolution_due).toISOString().replace('T', ' ').substring(0, 19) : '',
      resolved_at: r.resolved_at ? new Date(r.resolved_at).toISOString().replace('T', ' ').substring(0, 19) : null,
      resolution_notes: r.resolution_notes || r.it_resolution || r.resolution_text || '',
      reference_form_name: r.reference_form_name || '',
      screenshot_photo_name: r.screenshot_photo_name || '',
      comments: commentsByTicket[r.ticket_id] || [],
      is_archived: false
    }));

    // Map users
    const users = usersRes.rows.map((u) => {
      let role = (u.role || 'employee').toLowerCase();
      if (role === 'user') role = 'employee';
      if (role === 'it support' || role === 'it staff' || role === 'it') role = 'it support';
      if (role === 'super admin' || role === 'superadmin') role = 'super admin';

      return {
        user_id: u.user_id,
        username: u.username || `user_${u.user_id}`,
        full_name: u.full_name || u.username || 'CCI Employee',
        email: u.email || `${(u.username || 'user').replace(/\s+/g, '.')}@coolaireconsolidated.com`,
        role,
        department: u.department || 'General',
        phone: u.phone || '',
        status: 'active'
      };
    });

    // Map departments
    const departments = deptsRes.rows.map((d) => ({
      id: d.id,
      name: d.name,
      code: (d.name || '').substring(0, 4).toUpperCase(),
      manager_name: d.dept_head || '',
      head_count: 1
    }));

    // Map it_projects
    const projects = projectsRes.rows.map((p) => ({
      id: p.id,
      title: p.title || 'Untitled Project',
      description: p.description || '',
      status: p.status || 'Planning',
      priority: p.priority || 'Medium',
      start_date: p.start_date ? new Date(p.start_date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
      end_date: p.end_date ? new Date(p.end_date).toISOString().substring(0, 10) : '',
      lead_it: p.lead_it || 'Jarick Montojo',
      co_head_it: p.co_head_it || '',
      department: p.department || 'Information Technology',
      progress_percent: p.status === 'Completed' ? 100 : p.status === 'In Progress' ? 50 : 15,
      created_at: p.created_at ? new Date(p.created_at).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)
    }));

    // Map project updates
    const projectUpdates = projUpdatesRes.rows.map((pu) => ({
      id: pu.id,
      project_id: pu.project_id,
      update_text: pu.update_text || '',
      author: pu.author || 'IT Team',
      created_at: pu.created_at ? new Date(pu.created_at).toISOString().replace('T', ' ').substring(0, 19) : ''
    }));

    // Map ier_forms_a
    const ierFormsA = ierARes.rows.map((fa) => ({
      id: fa.id,
      ier_no: fa.ier_no || `IER-A-${fa.id}`,
      employee_name: fa.employee_name || '',
      position_title: fa.position_title || '',
      department: fa.department || 'Operations',
      asset_code: fa.asset_code || 'CCI-ASSET',
      item_description: fa.item_description || '',
      issue_details: fa.issue_details || '',
      dept_head_id: fa.dept_head_id || 0,
      dept_head_name: '',
      dept_head_status: fa.dept_head_status || 'Pending',
      it_personnel_id: fa.it_personnel_id || 0,
      it_staff_name: '',
      it_status: fa.it_status || 'Pending',
      workflow_status: fa.workflow_status || 'Draft',
      created_by: fa.created_by || fa.employee_name || 'Staff',
      date_reported: fa.date_reported ? new Date(fa.date_reported).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
      created_at: fa.created_at ? new Date(fa.created_at).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString()
    }));

    // Map ier_forms_b
    const ierFormsB = ierBRes.rows.map((fb) => ({
      id: fb.id,
      ier_no: fb.ier_no || `IER-B-${fb.id}`,
      requestor_name: fb.employee_name || '',
      department: fb.department || 'Operations',
      equipment_type: fb.item_description || 'Hardware Equipment',
      serial_number: fb.asset_code || '',
      service_description: `${fb.cause_issue || ''}\n${fb.actions_taken || ''}`.trim(),
      parts_needed: fb.materials || '',
      cost_estimate: 0,
      technician_name: fb.it_staff || 'Jarick Montojo',
      status: fb.workflow_status || 'Draft',
      manager_approval: 'Approved',
      management_approval: 'Approved',
      created_at: fb.created_at ? new Date(fb.created_at).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString()
    }));

    // Map knowledge base
    const knowledgeArticles = kbRes.rows.map((k) => ({
      id: k.article_id,
      title: k.title,
      category: k.category || 'General',
      content: k.content || '',
      author: k.last_updated_by || 'IT Staff',
      views: 120,
      updated_at: k.created_at ? new Date(k.created_at).toISOString().substring(0, 10) : '2026-10-01'
    }));

    // Map settings
    const systemSettingsMap: Record<string, string> = {};
    for (const s of settingsRes.rows) {
      if (s.setting_key) {
        systemSettingsMap[s.setting_key] = s.setting_value || '';
      }
    }

    // Map audit logs
    const auditLogs = auditRes.rows.map((a) => ({
      id: a.log_id,
      username: a.username || 'system',
      action: a.action || 'ACTION',
      target_type: a.target_type || '',
      target_id: a.target_id || undefined,
      details: a.details || '',
      timestamp: a.timestamp ? new Date(a.timestamp).toISOString().replace('T', ' ').substring(0, 19) : ''
    }));

    res.json({
      success: true,
      data: {
        tickets,
        users,
        departments,
        projects,
        projectUpdates,
        ierFormsA,
        ierFormsB,
        knowledgeArticles,
        systemSettings: systemSettingsMap,
        auditLogs
      },
      counts: {
        tickets: tickets.length,
        users: users.length,
        departments: departments.length,
        projects: projects.length,
        ierFormsA: ierFormsA.length,
        ierFormsB: ierFormsB.length,
        auditLogs: auditLogs.length
      }
    });
  } catch (err: any) {
    console.error('[DB API Pull-All Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Create/Update Ticket in Live PostgreSQL
app.post('/api/db/ticket', async (req: Request, res: Response) => {
  try {
    const pool = getPgPool();
    const t = req.body;

    const query = `
      INSERT INTO tickets (
        ticket_id, employee_name, department, email, subject, description, 
        status, priority, ticket_type, target_department, assigned_it, anydesk_id, 
        created_at, resolution_due, approval_status, approver_id, resolution_notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), 
        NOW() + INTERVAL '48 hours', $13, $14, $15
      )
      ON CONFLICT (ticket_id) DO UPDATE SET
        employee_name = EXCLUDED.employee_name,
        department = EXCLUDED.department,
        email = EXCLUDED.email,
        subject = EXCLUDED.subject,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        priority = EXCLUDED.priority,
        ticket_type = EXCLUDED.ticket_type,
        target_department = EXCLUDED.target_department,
        assigned_it = EXCLUDED.assigned_it,
        anydesk_id = EXCLUDED.anydesk_id,
        approval_status = EXCLUDED.approval_status,
        resolution_notes = EXCLUDED.resolution_notes
      RETURNING ticket_id;
    `;

    // Extract numerical ID or generate timestamp-based ID
    const ticketId = typeof t.id === 'number' && t.id < 2000000000 ? t.id : Math.floor(Date.now() / 1000);

    await pool.query(query, [
      ticketId,
      t.employee_name || 'Anonymous',
      t.department || 'General',
      t.email || '',
      t.subject || 'Ticket',
      t.description || '',
      t.status || 'New',
      t.priority || 'Medium',
      t.ticket_type || 'Incident',
      t.target_department || 'Information Technology',
      t.assigned_it || '',
      t.anydesk_id || '',
      t.approver_status || 'Approved',
      t.approver_id || null,
      t.resolution_notes || ''
    ]);

    res.json({ success: true, ticket_id: ticketId });
  } catch (err: any) {
    console.error('[DB API Save Ticket Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Post comment to ticket_comments
app.post('/api/db/ticket/comment', async (req: Request, res: Response) => {
  try {
    const pool = getPgPool();
    const { ticketId, sender, message } = req.body;
    await pool.query(
      `INSERT INTO ticket_comments (ticket_id, sender, message, created_at) VALUES ($1, $2, $3, NOW())`,
      [Number(ticketId), sender || 'IT Staff', message || '']
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update ticket status & resolution
app.post('/api/db/ticket/status', async (req: Request, res: Response) => {
  try {
    const pool = getPgPool();
    const { ticketId, status, resolutionNotes } = req.body;
    const isResolved = status === 'Resolved' || status === 'Closed';
    await pool.query(
      `UPDATE tickets SET status = $1, resolution_notes = $2, resolved_at = ${isResolved ? 'NOW()' : 'resolved_at'} WHERE ticket_id = $3`,
      [status, resolutionNotes || '', Number(ticketId)]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Assign ticket to IT
app.post('/api/db/ticket/assign', async (req: Request, res: Response) => {
  try {
    const pool = getPgPool();
    const { ticketId, assignedIt } = req.body;
    await pool.query(
      `UPDATE tickets SET assigned_it = $1, status = CASE WHEN status = 'New' THEN 'Assigned' ELSE status END WHERE ticket_id = $2`,
      [assignedIt || '', Number(ticketId)]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save IER Form A
app.post('/api/db/ier-a', async (req: Request, res: Response) => {
  try {
    const pool = getPgPool();
    const fa = req.body;
    const formId = typeof fa.id === 'number' && fa.id < 2000000000 ? fa.id : Math.floor(Date.now() / 1000);

    await pool.query(
      `INSERT INTO ier_forms_a (
        id, ier_no, employee_name, position_title, department, asset_code, item_description, 
        issue_details, created_by, dept_head_status, it_status, workflow_status, date_reported, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        dept_head_status = EXCLUDED.dept_head_status,
        it_status = EXCLUDED.it_status,
        workflow_status = EXCLUDED.workflow_status;`,
      [
        formId,
        fa.ier_no || `IER-A-${formId}`,
        fa.employee_name || '',
        fa.position_title || '',
        fa.department || '',
        fa.asset_code || '',
        fa.item_description || '',
        fa.issue_details || '',
        fa.created_by || '',
        fa.dept_head_status || 'Pending',
        fa.it_status || 'Pending',
        fa.workflow_status || 'Draft'
      ]
    );
    res.json({ success: true, id: formId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save Project
app.post('/api/db/project', async (req: Request, res: Response) => {
  try {
    const pool = getPgPool();
    const p = req.body;
    const projId = typeof p.id === 'number' && p.id < 2000000000 ? p.id : Math.floor(Date.now() / 1000);

    await pool.query(
      `INSERT INTO it_projects (
        id, title, description, status, priority, start_date, end_date, lead_it, co_head_it, department, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        priority = EXCLUDED.priority,
        lead_it = EXCLUDED.lead_it,
        department = EXCLUDED.department;`,
      [
        projId,
        p.title || 'Project',
        p.description || '',
        p.status || 'Planning',
        p.priority || 'Medium',
        p.start_date || new Date().toISOString().substring(0, 10),
        p.end_date || null,
        p.lead_it || '',
        p.co_head_it || '',
        p.department || 'Information Technology'
      ]
    );
    res.json({ success: true, id: projId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save User
app.post('/api/db/user', async (req: Request, res: Response) => {
  try {
    const pool = getPgPool();
    const u = req.body;
    const userId = typeof u.user_id === 'number' && u.user_id < 2000000000 ? u.user_id : Math.floor(Date.now() / 1000);

    await pool.query(
      `INSERT INTO users (user_id, username, full_name, email, role, department)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         email = EXCLUDED.email,
         role = EXCLUDED.role,
         department = EXCLUDED.department;`,
      [
        userId,
        u.username,
        u.full_name || u.username,
        u.email || '',
        u.role || 'User',
        u.department || 'General'
      ]
    );
    res.json({ success: true, user_id: userId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Conversational AI IT Companion
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const ai = getAI();
    if (!ai) {
      // Intelligent fallback when API key is not yet set
      res.json({
        reply: generateLocalFallbackResponse(message)
      });
      return;
    }

    const systemInstruction = `You are "Cooly", the Senior AI IT Systems Architect & HelpDesk Copilot for Coolaire Consolidated Inc. (CCI).
You assist employees, IT personnel, and managers with technical IT issues, hardware diagnostics, and company workflows.

CCI Enterprise Context:
- Security Gateway PIN: 7799 (required for portal access).
- FortiClient VPN Gateway: vpn.coolaireconsolidated.com:10443. Connecting requires domain credentials + FortiToken MFA. Mapped drives: Z:\\Shared and Y:\\Departments.
- SAP ERP Connection: Host 192.168.10.15, Ports 3200/3300. Error 10061 (WSAECONNREFUSED) means workstation cannot reach SAP server; verify LAN or active FortiClient VPN.
- IER Form A (Inspection & Evaluation Report): For damaged, defective, or failing hardware (laptops, barcode scanners, monitors). Flow: Employee submits -> Department Head endorses -> IT Support inspects & records fault diagnosis.
- IER Form B (Service, Repair & Maintenance): For equipment repair quotations, replacement parts, vendor servicing, and unit release. Flow: IT files -> Manager approves -> Executive management signs.
- IT Department Leads: Jarick Montojo and Juan Dela Cruz.
- Network Printers: Ricoh Aficio multi-function on 192.168.10.220 (Accounting) and HP LaserJet on 192.168.10.222 (Warehouse).
- Primary Database: Supabase PostgreSQL (with automatic backup/mirroring to Firebase Firestore).

Guidelines for your answers:
- Provide clear, direct, structured step-by-step guidance.
- Tailor your response dynamically to the user's specific problem. Avoid repetitive boilerplates.
- If relevant, mention exact troubleshooting commands (e.g., ping, ipconfig /flushdns, gpupdate /force).
- Maintain a courteous, professional, and knowledgeable tone.`;

    // Map incoming history to format accepted by Gemini SDK
    const formattedContents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (item.text || (item.parts && item.parts[0]?.text)) {
          const role = item.sender === 'user' || item.role === 'user' ? 'user' : 'model';
          const text = item.text || item.parts?.[0]?.text;
          formattedContents.push({
            role,
            parts: [{ text }]
          });
        }
      }
    }
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await generateWithFallback(ai, {
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95
      }
    });

    const reply = response?.text || generateLocalFallbackResponse(message);
    res.json({ reply });
  } catch (error: any) {
    const fallback = generateLocalFallbackResponse(req.body?.message || '');
    res.json({ reply: fallback });
  }
});

// Automatic Ticket Triage and Diagnosis
app.post('/api/gemini/diagnose', async (req: Request, res: Response) => {
  try {
    const { subject = '', description = '' } = req.body;
    const ai = getAI();

    if (!ai) {
      res.json(getLocalDiagnosisFallback(subject, description));
      return;
    }

    const prompt = `You are the Lead IT Triage Architect for Coolaire Consolidated Inc. (CCI).
Analyze this IT HelpDesk ticket:
Subject: "${subject}"
Description: "${description}"

Respond strictly with a JSON object in this exact schema:
{
  "suggestedPriority": "Low" | "Medium" | "High" | "Urgent",
  "suggestedCategory": "Incident" | "Request" | "Inquiry" | "Change" | "Problem",
  "rootCauseAnalysis": "1-2 concise sentences analyzing the likely root cause",
  "recommendedSteps": ["Step 1", "Step 2", "Step 3"],
  "suggestedReply": "A courteous initial response to the employee acknowledging the ticket and providing immediate steps."
}`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response?.text;
    if (text) {
      const parsed = JSON.parse(text);
      res.json({
        suggestedPriority: parsed.suggestedPriority || 'Medium',
        suggestedCategory: parsed.suggestedCategory || 'Incident',
        rootCauseAnalysis: parsed.rootCauseAnalysis || 'Technical investigation required.',
        recommendedSteps: parsed.recommendedSteps || ['Verify network connection', 'Restart service'],
        suggestedReply: parsed.suggestedReply || 'Your ticket has been queued with Coolaire IT Support.'
      });
      return;
    }

    res.json(getLocalDiagnosisFallback(subject, description));
  } catch (error) {
    res.json(getLocalDiagnosisFallback(req.body?.subject, req.body?.description));
  }
});

// Draft Ticket Resolution Note
app.post('/api/gemini/resolve', async (req: Request, res: Response) => {
  try {
    const { subject = '', description = '', actionsTaken = '' } = req.body;
    const ai = getAI();

    if (!ai) {
      res.json({
        resolutionNotes: `Resolved ticket "${subject}". ${actionsTaken ? actionsTaken + '.' : 'Completed diagnostics and maintenance.'} Verified restoration of normal functionality with user.`
      });
      return;
    }

    const prompt = `As a Senior IT Desktop Support Engineer for Coolaire Consolidated Inc., write a concise 2-3 sentence ITIL Ticket Resolution Summary for closing this ticket:
Ticket Subject: "${subject}"
Issue Description: "${description}"
Actions Taken by Technician: "${actionsTaken}"

Return only the resolution text suitable for the permanent audit trail.`;

    const response = await generateWithFallback(ai, {
      contents: prompt
    });

    res.json({
      resolutionNotes: (response?.text || '').trim() || `Resolved issue with ${subject}. ${actionsTaken}`
    });
  } catch (error) {
    res.json({
      resolutionNotes: `Resolved ticket "${req.body?.subject || ''}". ${req.body?.actionsTaken || 'Completed troubleshooting and verified operational status.'}`
    });
  }
});

// Intelligent contextual fallback generator
function generateLocalFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('screen') || q.includes('flicker') || q.includes('display') || q.includes('monitor') || q.includes('hinge') || q.includes('line') || q.includes('lcd')) {
    return `### Hardware Display Fault & IER Form A Submission:
1. **Diagnosis**: Screen flickering when adjusting the display hinge and horizontal/vertical artifact lines typically indicate an internal LVDS/eDP display flex cable pinch or panel fault.
2. **Immediate Action**:
   - Immediately back up any unsaved working files to corporate cloud storage (\`OneDrive\` or \`Z:\\Shared\`).
   - Avoid forcefully tilting or pressing against the hinge assembly to prevent further trace fracture.
3. **Formal Procedure**:
   - Navigate to **HelpDesk Forms > IER Hub** in the left menu.
   - Click **Submit Form A (Inspection & Evaluation Report)**.
   - Specify your Property/Asset Tag and describe the physical symptoms (flicker on angle change, horizontal lines).
   - Once submitted, it routes to your Department Head for endorsement, followed by IT physical inspection (Jarick Montojo / Juan Dela Cruz) to evaluate for replacement or vendor repair under Form B.`;
  }

  if (q.includes('printer') || q.includes('print') || q.includes('paper') || q.includes('jam') || q.includes('ricoh') || q.includes('laserjet')) {
    return `### Coolaire Corporate Printer Troubleshooting:
1. **Accounting / Admin Ricoh Aficio (192.168.10.220)**:
   - Check if the tray indicator shows paper empty or size mismatch (ensure A4/Letter aligns with print dialog).
   - Open Side Cover A to inspect for any trapped sheets along the feed rollers.
2. **Warehouse HP LaserJet (192.168.10.222)**:
   - Verify network connectivity: \`ping 192.168.10.222\`.
   - Clear stalled print queues: Open Windows Services (\`services.msc\`) -> Restart **Print Spooler**.
3. If the printer status shows "Offline", delete and re-add the printer via \`\\\\192.168.10.20\\Printers\`.`;
  }

  if (q.includes('password') || q.includes('reset') || q.includes('locked') || q.includes('login fail')) {
    return `### Account Unlock & Domain Password Reset:
1. Employee accounts automatically lock for 15 minutes after 5 consecutive failed attempts.
2. If urgent, contact IT HelpDesk via AnyDesk or telephone extension 104.
3. Once unlocked, your temporary password must be changed at next logon:
   - Must contain at least 8 characters.
   - Must include an uppercase letter, lowercase letter, number, and special symbol.
   - Must not contain your username or first name.`;
  }

  if (q.includes('vpn') || q.includes('forticlient') || q.includes('tunnel') || q.includes('remote')) {
    return `### Coolaire FortiClient VPN Connectivity Guide:
1. Open **FortiClient VPN** from your Windows taskbar or Start menu.
2. Select connection profile: **Coolaire-SSLVPN**.
3. Gateway address: \`vpn.coolaireconsolidated.com:10443\`.
4. Enter your corporate domain username and password.
5. Provide your 6-digit FortiToken MFA code when prompted.
6. Once connected, company file shares (\`Z:\\Shared\` and \`Y:\\Departments\`) and SAP ERP access will immediately activate.`;
  }

  if (q.includes('sap') || q.includes('erp') || q.includes('10061')) {
    return `### SAP ERP Connection (Error 10061) Resolution:
1. Error \`WSAECONNREFUSED 10061\` means the workstation cannot establish TCP handshake with SAP Application Server on ports 3200/3300.
2. If working remotely, verify **FortiClient VPN** is connected and showing green status.
3. Test network reachability by opening PowerShell / CMD and running:
   \`ping 192.168.10.15\`
4. If ping responds but SAP still fails, restart **SAP Logon Pad** to clear cached socket locks.
5. If issue persists, contact IT extension 104 to verify SAP background dispatcher status.`;
  }

  if (q.includes('ier') || q.includes('form a') || q.includes('form b') || q.includes('inspection')) {
    return `### Coolaire Inspection & Evaluation Report (IER) Guide:
- **IER Form A (Inspection Report)**: Submit when equipment suffers physical damage, display defects, water damage, or hardware failure. Requires Department Head endorsement, followed by IT hardware inspection and technical diagnosis.
- **IER Form B (Service & Repair)**: Submitted by IT for parts procurement, outside vendor quotes, authorized repair work, and warranty claims. Requires Manager and Management executive approvals.
- **Access**: You can file or track both forms via the left navigation under **HelpDesk Forms > IER Hub**.`;
  }

  if (q.includes('outlook') || q.includes('email') || q.includes('mail') || q.includes('mobile')) {
    return `### Microsoft 365 Outlook Mobile Configuration:
1. Download Microsoft Outlook from App Store or Google Play.
2. Enter your work address: \`username@coolaireconsolidated.com\`.
3. Complete Entra ID authentication with your domain credentials.
4. Verify via Microsoft Authenticator or SMS OTP.
5. In compliance with CCI Mobile Security Policy, enable biometric lock or screen PIN on your mobile device.`;
  }

  if (q.includes('pin') || q.includes('gateway')) {
    return `The corporate Security Gateway PIN for Coolaire Consolidated Inc. is **7799**. You can also check "Remember this workstation PIN" on the gateway screen to stay authenticated across sessions.`;
  }

  if (q.includes('database') || q.includes('supabase')) {
    return `### Coolaire Database Architecture:
- **Sole Cloud Database**: Supabase PostgreSQL is the primary and only cloud database for tickets, users, assets, IER reports, and IT projects.
- **Data Persistence**: All records sync in real-time with your connected Supabase PostgreSQL instance, and you can pull or push records from **Admin Tools > System Settings**.`;
  }

  return `Hello! I am your Coolaire IT Companion. I can assist you with:
- **Hardware & Workstation Diagnostics**: Screen flickering, blue lines, battery issues, laptop repairs.
- **Connectivity**: FortiClient VPN, mapped drives (\`Z:\\Shared\`), and Wi-Fi configurations.
- **Enterprise ERP**: SAP Error 10061 resolution and connection profiles.
- **HelpDesk Forms**: Submitting and tracking IER Form A (Inspection) and Form B (Service/Repair).
- **Printers & Peripherals**: Ricoh Aficio and HP LaserJet queues.
What specific issue or equipment can I help you resolve?`;
}

function getLocalDiagnosisFallback(subject: string, description: string) {
  const lower = (subject + ' ' + description).toLowerCase();
  const isUrgent = lower.includes('down') || lower.includes('server') || lower.includes('critical') || lower.includes('outage');
  const isHigh = lower.includes('cannot connect') || lower.includes('error') || lower.includes('fail') || lower.includes('broken');

  return {
    suggestedPriority: isUrgent ? 'Urgent' : isHigh ? 'High' : 'Medium',
    suggestedCategory: lower.includes('request') || lower.includes('need') || lower.includes('access') ? 'Request' : 'Incident',
    rootCauseAnalysis: 'Network latency, credentials synchronization, or local peripheral driver fault.',
    recommendedSteps: [
      'Verify physical network cable link or Wi-Fi status and VPN tunnel.',
      'Check local firewall and endpoint security status.',
      'Inspect application event logs for specific exception codes.'
    ],
    suggestedReply: 'Thank you for contacting Coolaire IT HelpDesk. Our team has received your ticket and is reviewing system telemetry.'
  };
}

// Start full-stack server with Vite middleware in development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CCI Workspace Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CCI Workspace Server] Fatal startup error:', err);
});
