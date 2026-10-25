export interface TicketDiagnosisResult {
  suggestedPriority: 'Low' | 'Medium' | 'High' | 'Urgent';
  suggestedCategory: 'Incident' | 'Request' | 'Inquiry' | 'Change' | 'Problem';
  rootCauseAnalysis: string;
  recommendedSteps: string[];
  suggestedReply: string;
}

/**
 * Automatically analyzes ticket description and recommends priority, classification, and troubleshooting steps
 * via full-stack server-side Gemini API.
 */
export async function analyzeAndDiagnoseTicket(
  subject: string,
  description: string
): Promise<TicketDiagnosisResult> {
  try {
    const res = await fetch('/api/gemini/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        suggestedPriority: data.suggestedPriority || 'Medium',
        suggestedCategory: data.suggestedCategory || 'Incident',
        rootCauseAnalysis: data.rootCauseAnalysis || 'Technical investigation required.',
        recommendedSteps: data.recommendedSteps || ['Check physical connection', 'Restart service'],
        suggestedReply: data.suggestedReply || 'Your ticket has been queued with Coolaire IT Support.'
      };
    }
  } catch (err) {
    console.warn('Network call to /api/gemini/diagnose failed, using client fallback:', err);
  }

  // Fallback heuristic if server is unavailable
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
    suggestedCategory:
      lower.includes('request') || lower.includes('need') || lower.includes('access')
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
 * Conversational IT Companion answering employee queries via server-side Gemini API (gemini-3.8-flash).
 */
export async function chatWithItCompanion(
  message: string,
  history: any[] = []
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    console.warn('Network call to /api/gemini/chat failed, using client fallback:', err);
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
    return `The default company security gateway PIN for Coolaire Consolidated Inc. is **7799**. You can also enable "Remember PIN on this workstation" to stay logged in across browser sessions.`;
  }

  return `Hello! I am your Coolaire IT Companion. I can assist you with FortiClient VPN setups, IER Form A/B submissions, printer and network diagnostics, and ticketing assistance. What specific IT topic or workstation issue can I help troubleshoot?`;
}

/**
 * Drafts resolution notes for closing tickets via server-side Gemini API.
 */
export async function draftResolutionNotes(
  subject: string,
  description: string,
  actionsTaken: string
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description, actionsTaken })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.resolutionNotes) {
        return data.resolutionNotes;
      }
    }
  } catch (err) {
    console.warn('Network call to /api/gemini/resolve failed:', err);
  }

  return `Resolved issue with ${subject}. ${actionsTaken ? actionsTaken + '.' : 'Completed diagnostics.'} Verified operational restoration and normal system functionality with the user.`;
}
