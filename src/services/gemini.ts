import { GoogleGenAI } from '@google/genai';

export interface TicketDiagnosisResult {
  suggestedPriority: 'Low' | 'Medium' | 'High' | 'Urgent';
  suggestedCategory: 'Incident' | 'Request' | 'Inquiry' | 'Change' | 'Problem';
  rootCauseAnalysis: string;
  recommendedSteps: string[];
  suggestedReply: string;
}

// Lazy safe instance of GoogleGenAI
let aiInstance: GoogleGenAI | null = null;
let aiInitializationAttempted = false;

function getAIClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  if (aiInitializationAttempted) return null;

  aiInitializationAttempted = true;
  try {
    const env = (typeof import.meta !== 'undefined' ? (import.meta as any).env : {}) || {};
    const apiKey =
      env.VITE_GEMINI_API_KEY ||
      (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') ||
      '';

    if (apiKey) {
      aiInstance = new GoogleGenAI({ apiKey });
    } else {
      // Try empty constructor if allowed by environment proxy
      try {
        aiInstance = new GoogleGenAI({});
      } catch {
        aiInstance = null;
      }
    }
  } catch (err) {
    console.warn('Gemini client lazy initialization note:', err);
    aiInstance = null;
  }

  return aiInstance;
}

/**
 * Automatically analyzes ticket description and recommends priority, classification, and troubleshooting steps.
 */
export async function analyzeAndDiagnoseTicket(
  subject: string,
  description: string
): Promise<TicketDiagnosisResult> {
  const client = getAIClient();

  if (client) {
    try {
      const prompt = `You are the Lead IT Systems Architect and Automated Triage Agent for Coolaire Consolidated Inc. (CCI).
Analyze this IT HelpDesk ticket:
Subject: "${subject}"
Description: "${description}"

Respond strictly with a JSON object in this exact schema:
{
  "suggestedPriority": "Low" | "Medium" | "High" | "Urgent",
  "suggestedCategory": "Incident" | "Request" | "Inquiry" | "Change" | "Problem",
  "rootCauseAnalysis": "1-2 concise sentences analyzing the likely root cause",
  "recommendedSteps": ["Step 1", "Step 2", "Step 3"],
  "suggestedReply": "A courteous initial response to the employee acknowledging the ticket and providing immediate workarounds."
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          suggestedPriority: parsed.suggestedPriority || 'Medium',
          suggestedCategory: parsed.suggestedCategory || 'Incident',
          rootCauseAnalysis: parsed.rootCauseAnalysis || 'Technical investigation required.',
          recommendedSteps: parsed.recommendedSteps || ['Check physical connections', 'Restart client service'],
          suggestedReply: parsed.suggestedReply || 'Your ticket has been queued with Coolaire IT Support.'
        };
      }
    } catch (err) {
      console.warn('Gemini AI diagnosis error, using local fallback:', err);
    }
  }

  // Fallback heuristic if offline or API key missing
  const lower = (subject + ' ' + description).toLowerCase();
  const isUrgent =
    lower.includes('down') ||
    lower.includes('server') ||
    lower.includes('critical') ||
    lower.includes('urgent') ||
    lower.includes('outage');
  const isHigh =
    lower.includes('cannot connect') ||
    lower.includes('error') ||
    lower.includes('fail') ||
    lower.includes('jam') ||
    lower.includes('broken');

  return {
    suggestedPriority: isUrgent ? 'Urgent' : isHigh ? 'High' : 'Medium',
    suggestedCategory: lower.includes('request') || lower.includes('need') || lower.includes('access')
      ? 'Request'
      : lower.includes('inquiry') || lower.includes('question')
      ? 'Inquiry'
      : 'Incident',
    rootCauseAnalysis:
      'Network routing latency, workstation authentication credential desync, or local peripheral driver fault.',
    recommendedSteps: [
      'Verify physical cable link or Wi-Fi status and VPN tunnel.',
      'Check local firewall / antivirus rules on employee workstation.',
      'Inspect Windows Event Viewer application logs for fault exception codes.'
    ],
    suggestedReply:
      'Thank you for reaching out to Coolaire IT HelpDesk. Our team has received your ticket and is reviewing system telemetry.'
  };
}

/**
 * Conversational IT Companion answering employee queries.
 */
export async function chatWithItCompanion(
  message: string,
  history: any[] = []
): Promise<string> {
  const client = getAIClient();

  if (client) {
    try {
      const systemInstruction = `You are "Cooly", the AI IT Support Companion for Coolaire Consolidated Inc. (CCI).
You assist employees with IT HelpDesk issues, VPN setup, SAP ERP login failures, printer jams, Outlook configuration, and filing IER (Inspection & Evaluation Report) Form A and Form B.
Be courteous, professional, concise, and structured with step-by-step bullet points.
Coolaire internal facts:
- Gateway Portal PIN is 7799.
- FortiClient VPN gateway: vpn.coolaireconsolidated.com:10443.
- IT Department is headed by Jarick Montojo and Juan Dela Cruz.
- IER Form A is for damaged/malfunctioning equipment requiring inspection.
- IER Form B is for technical maintenance and parts replacement.`;

      const chat = client.chats.create({
        model: 'gemini-3.8-flash',
        config: {
          systemInstruction
        },
        history
      });

      const response = await chat.sendMessage({
        message
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn('Gemini chat error, fallback to expert knowledge rules:', err);
    }
  }

  // Heuristic IT expert fallback responder
  const query = message.toLowerCase();

  if (query.includes('vpn') || query.includes('forticlient') || query.includes('remote')) {
    return `### Coolaire Corporate VPN (FortiClient) Setup:
1. Open **FortiClient VPN** from your Windows Start Menu.
2. Select connection profile: **Coolaire-SSLVPN**.
3. Gateway address: \`vpn.coolaireconsolidated.com:10443\`.
4. Enter your corporate domain username and password.
5. Provide the 6-digit MFA OTP code when prompted.
6. Once connected, mapped company drives (\`Z:\\Shared\` and \`Y:\\Departments\`) will automatically reconnect.`;
  }

  if (query.includes('ier') || query.includes('form') || query.includes('damage') || query.includes('inspection')) {
    return `### Coolaire IER Form Workflows:
- **IER Form A (Inspection & Evaluation Report)**: Submit this when company hardware (laptop, monitor, mobile barcode scanner) suffers physical damage, component failure, or defect. Requires Department Head endorsement followed by IT technical verification.
- **IER Form B (Equipment Repair & Service)**: Filed for internal repairs, vendor quotations, parts replacement, and technician service completions. Requires Manager and Management approvals.
You can submit both from the left navigation bar under HelpDesk Forms.`;
  }

  if (query.includes('sap') || query.includes('erp') || query.includes('10061')) {
    return `### SAP ERP Connection Troubleshooting:
1. Error \`WSAECONNREFUSED 10061\` indicates the workstation cannot reach the SAP Application Server port 3200/3300.
2. Verify you are connected to the corporate LAN or active **Coolaire FortiClient VPN**.
3. Open CMD and run: \`ping 192.168.10.15\` to verify host reachability.
4. Restart the **SAP GUI Logon** client. If the issue persists, contact IT extension 104.`;
  }

  if (query.includes('outlook') || query.includes('email') || query.includes('mail') || query.includes('mobile')) {
    return `### Microsoft 365 Outlook Mobile Configuration:
1. Download Microsoft Outlook from the App Store / Google Play.
2. Enter your work address: \`username@coolaireconsolidated.com\`.
3. Complete the Microsoft Entra ID authentication prompt.
4. Authenticate via Microsoft Authenticator or SMS verification.
5. In compliance with CCI Mobile Device Policy, set a device screen lock PIN or biometric face/fingerprint.`;
  }

  if (query.includes('pin') || query.includes('gateway')) {
    return `The default company security gateway PIN for Coolaire Consolidated Inc. is **7799**. Administrators can adjust this under Admin Tools > System Settings.`;
  }

  return `Hello! I am your Coolaire IT Companion. I can assist you with FortiClient VPN setups, IER Form A/B submissions, printer and network diagnostics, and ticketing assistance. What specific IT topic or workstation issue can I help troubleshoot?`;
}

/**
 * Drafts resolution notes for closing tickets.
 */
export async function draftResolutionNotes(
  subject: string,
  description: string,
  actionsTaken: string
): Promise<string> {
  const client = getAIClient();

  if (client) {
    try {
      const prompt = `As a senior IT Desktop Support Engineer for Coolaire Consolidated Inc., write a concise, professional 2-3 sentence ITIL Ticket Resolution Summary.
Ticket Subject: "${subject}"
Issue: "${description}"
Actions Taken by Tech: "${actionsTaken}"

Return only the resolution text suitable for the permanent audit trail.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini draft resolution note fallback:', err);
    }
  }

  return `Resolved issue with ${subject}. ${actionsTaken ? actionsTaken + '.' : 'Completed diagnostics.'} Verified operational restoration and normal system functionality with the user.`;
}
