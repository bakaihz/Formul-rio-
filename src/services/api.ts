import { StaffApplication, ApplicationStatus, UserSession } from '../types';

export async function requestAuthToken(discordUsername: string): Promise<UserSession> {
  try {
    const res = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordUsername }),
    });

    if (!res.ok) {
      throw new Error(`Erro de autenticação: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      discordUsername: data.discordUsername,
      isAdmin: data.isAdmin,
      token: data.token,
    };
  } catch (err) {
    console.warn('Fallback para token local se servidor não responder:', err);
    const clean = discordUsername.trim();
    const isAdmin = clean.toLowerCase() === 'bakai_shuziro978';
    return {
      discordUsername: clean,
      isAdmin,
      token: `astral_local_${Math.random().toString(36).substring(2)}_${Date.now()}`,
    };
  }
}

export async function submitFormToComplete(payload: {
  discordUsername: string;
  age: number;
  answers: Record<number, string>;
  authToken?: string;
}): Promise<{ application: StaffApplication; token: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (payload.authToken) {
      headers['Authorization'] = `Bearer ${payload.authToken}`;
    }

    const res = await fetch('/complete', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Falha no envio HTTP: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      application: data.application,
      token: data.token || payload.authToken,
    };
  } catch (err) {
    console.error('Erro ao enviar formulário para /complete:', err);
    // Fallback if offline
    const localApp: StaffApplication = {
      id: `astral-${Math.floor(1000 + Math.random() * 9000)}`,
      discordUsername: payload.discordUsername,
      age: payload.age,
      submittedAt: new Date().toISOString(),
      status: 'Pendente',
      answers: payload.answers,
      adminNotes: '',
      authToken: payload.authToken || 'local_fallback',
    };
    return { application: localApp, token: payload.authToken || 'local_fallback' };
  }
}

export async function fetchAllApplications(): Promise<StaffApplication[]> {
  try {
    const res = await fetch('/complete');
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const data = await res.json();
    return data.applications || [];
  } catch (err) {
    console.warn('Não foi possível obter dados de /complete:', err);
    return [];
  }
}

export async function updateApplicationOnServer(
  id: string,
  status: ApplicationStatus,
  adminNotes?: string,
  reviewedBy?: string
): Promise<StaffApplication | null> {
  try {
    const res = await fetch(`/complete/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes, reviewedBy }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.application;
  } catch (err) {
    console.error('Erro ao atualizar formulário no servidor:', err);
    return null;
  }
}

export async function deleteApplicationOnServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/complete/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Erro ao excluir formulário no servidor:', err);
    return false;
  }
}
