import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client using official recommended guidelines
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('[Gemini Server] Warning: process.env.GEMINI_API_KEY is not set');
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
    console.error('[Gemini Server] Error initializing GoogleGenAI:', err);
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
      console.warn(`[Gemini Server] Model ${model} retry note (${err?.status || err?.message})`);
    }
  }
  throw lastError;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
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

    const reply = response.text || generateLocalFallbackResponse(message);
    res.json({ reply });
  } catch (error: any) {
    console.error('[Gemini Server] Chat error:', error);
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

    const text = response.text;
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
    console.error('[Gemini Server] Diagnose error:', error);
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
      resolutionNotes: (response.text || '').trim() || `Resolved issue with ${subject}. ${actionsTaken}`
    });
  } catch (error) {
    console.error('[Gemini Server] Resolve error:', error);
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

  if (q.includes('database') || q.includes('supabase') || q.includes('firebase')) {
    return `### Coolaire Database Architecture:
- **Primary Database**: Supabase PostgreSQL is the main database for tickets, users, assets, and IER records.
- **Firebase Firestore Replication**: You can mirror or copy all data to Firebase Firestore anytime from **Admin Tools > System Settings** using the 1-click transfer button.`;
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
