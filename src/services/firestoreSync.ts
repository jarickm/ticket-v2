import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Ticket, User, Asset, IerFormA, IerFormB, ITProject } from '../types';

let db: Firestore | null = null;

export function getFirestoreDb(): Firestore | null {
  if (db) return db;
  try {
    if (firebaseConfig && (firebaseConfig as any).apiKey) {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      db = getFirestore(app);
      return db;
    }
  } catch (err) {
    console.error('Failed to initialize Firestore instance:', err);
  }
  return null;
}

export interface FirestoreTransferResult {
  success: boolean;
  message: string;
  counts: {
    tickets: number;
    users: number;
    assets: number;
    ierFormsA: number;
    ierFormsB: number;
    projects: number;
  };
}

/**
 * Transfers all current workspace / Supabase records directly into Firebase Firestore.
 */
export async function transferAllDataToFirestore(data: {
  tickets: Ticket[];
  users: User[];
  assets: Asset[];
  ierFormsA: IerFormA[];
  ierFormsB: IerFormB[];
  projects: ITProject[];
}): Promise<FirestoreTransferResult> {
  const firestore = getFirestoreDb();
  if (!firestore) {
    return {
      success: false,
      message: 'Firebase Firestore is not initialized. Check firebase-applet-config.json.',
      counts: { tickets: 0, users: 0, assets: 0, ierFormsA: 0, ierFormsB: 0, projects: 0 }
    };
  }

  const counts = {
    tickets: 0,
    users: 0,
    assets: 0,
    ierFormsA: 0,
    ierFormsB: 0,
    projects: 0
  };

  try {
    // 1. Transfer tickets
    for (const t of data.tickets) {
      const ticketRef = doc(firestore, 'tickets', String(t.id));
      await setDoc(ticketRef, {
        id: t.id,
        ticket_number: t.ticket_number,
        employee_name: t.employee_name,
        department: t.department,
        target_department: t.target_department || 'Information Technology',
        assigned_it: t.assigned_it || '',
        anydesk_id: t.anydesk_id || '',
        email: t.email,
        subject: t.subject,
        description: t.description,
        status: t.status,
        ticket_type: t.ticket_type,
        priority: t.priority,
        approver_name: t.approver_name || '',
        approver_status: t.approver_status || 'Approved',
        created_at: t.created_at,
        due_date: t.due_date || '',
        resolution_notes: t.resolution_notes || '',
        comments: t.comments || [],
        is_archived: Boolean(t.is_archived),
        synced_at: new Date().toISOString()
      }, { merge: true });
      counts.tickets++;
    }

    // 2. Transfer users
    for (const u of data.users) {
      const userRef = doc(firestore, 'users', String(u.user_id));
      await setDoc(userRef, {
        user_id: u.user_id,
        username: u.username,
        full_name: u.full_name,
        email: u.email,
        role: u.role,
        department: u.department,
        position: u.position || '',
        status: u.status,
        phone: u.phone || '',
        synced_at: new Date().toISOString()
      }, { merge: true });
      counts.users++;
    }

    // 3. Transfer assets
    for (const a of data.assets) {
      const assetRef = doc(firestore, 'assets', String(a.id));
      await setDoc(assetRef, {
        ...a,
        synced_at: new Date().toISOString()
      }, { merge: true });
      counts.assets++;
    }

    // 4. Transfer IER Forms A
    for (const fa of data.ierFormsA) {
      const faRef = doc(firestore, 'ier_forms_a', String(fa.id));
      await setDoc(faRef, {
        ...fa,
        synced_at: new Date().toISOString()
      }, { merge: true });
      counts.ierFormsA++;
    }

    // 5. Transfer IER Forms B
    for (const fb of data.ierFormsB) {
      const fbRef = doc(firestore, 'ier_forms_b', String(fb.id));
      await setDoc(fbRef, {
        ...fb,
        synced_at: new Date().toISOString()
      }, { merge: true });
      counts.ierFormsB++;
    }

    // 6. Transfer projects
    for (const p of data.projects) {
      const pRef = doc(firestore, 'it_projects', String(p.id));
      await setDoc(pRef, {
        ...p,
        synced_at: new Date().toISOString()
      }, { merge: true });
      counts.projects++;
    }

    return {
      success: true,
      message: `Successfully transferred ${counts.tickets} tickets, ${counts.users} users, ${counts.assets} assets, ${counts.ierFormsA + counts.ierFormsB} IER reports, and ${counts.projects} IT projects to Firebase Firestore!`,
      counts
    };
  } catch (err: any) {
    console.error('Error transferring data to Firestore:', err);
    return {
      success: false,
      message: `Firestore sync failed: ${err.message || 'Unknown error'}`,
      counts
    };
  }
}

/**
 * Pulls tickets from Firebase Firestore if available.
 */
export async function pullTicketsFromFirestore(): Promise<Ticket[] | null> {
  const firestore = getFirestoreDb();
  if (!firestore) return null;

  try {
    const colRef = collection(firestore, 'tickets');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;

    const tickets: Ticket[] = [];
    snapshot.forEach((docSnap) => {
      tickets.push(docSnap.data() as Ticket);
    });
    return tickets;
  } catch (err) {
    console.warn('Error pulling tickets from Firestore:', err);
    return null;
  }
}
