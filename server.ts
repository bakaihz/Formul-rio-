import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Applications Store with Seed Data
let applications: any[] = [
  {
    id: 'astral-8921',
    discordUsername: 'kaito_astral#1029',
    age: 18,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'Pendente',
    answers: {
      1: '18',
      2: '5 a 8 horas por dia',
      3: 'Fui Administrador durante 1 ano no servidor "Astral Community" (22k membros). Tinha foco em gerenciar a equipe de moderação e suporte a tickets.',
      4: 'Domínio total de Carl-bot, Dyno, MEE6 e Ticket Tool. Conhecimento avançado em permissões de cargos e hierarquia.',
      5: 'Acompanho o Formulário Astral há meses e vejo grande potencial. Quero colaborar trazendo mais organização e suporte rápido.',
      6: 'Apagaria mensagens ofensivas, aplicaria aviso verbal imediato no canal e, se persistessem, aplicaria mute temporário registrando a punição.',
      7: 'A amizade não anula as diretrizes. Aplicaria a sanção prevista nas regras imparcialmente e avisaria a supervisão superior.',
      8: 'Abuso de poder é punir sem motivo ou usar cargos para ter privilégios sobre os membros. Evito sempre mantendo a ética e imparcialidade.',
      9: 'Pediria gravações ou registros no chat log, verificaria as logs do servidor e orientaria o membro a trazer provas antes de uma sanção direct.',
      10: 'Criar noites de minigames no Discord e um canal semanal de feedback dos membros.',
    },
    adminNotes: '',
    authToken: 'astral_tok_seed_kaito',
  },
  {
    id: 'astral-4012',
    discordUsername: 'starlight_luna',
    age: 16,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    status: 'Em Análise',
    answers: {
      1: '16',
      2: '3 a 5 horas por dia',
      3: 'Fui Helper no servidor "CyberSpace" (8k membros), ajudando membros novos e tirando dúvidas de comandos.',
      4: 'Conheço comandos básicos de moderação do Dyno e sei criar tickets com Ticket Tool.',
      5: 'Gosto muito da vibe do servidor e estou sempre ativo nas chamadas de voz e bate-papo.',
      6: 'Pediria para mudarem de assunto e chamaria um Moderador sênior se as brigas continuassem.',
      7: 'Conversaria com ele no privado para que ele mesmo assumisse o erro e aplicaria o mute necessário.',
      8: 'Achar que é superior aos outros só por ter cargo alto. Evito agindo com humildade.',
      9: 'Explicaria educadamente que precisamos de prints ou vídeos para punir um membro com justiça.',
      10: 'Organizar um torneio de Lofi & Chat nos finais de semana com cargos de destaque.',
    },
    adminNotes: 'Candidata com boa comunicação no chat geral. Agendar conversa no canal de voz.',
    authToken: 'astral_tok_seed_luna',
  },
  {
    id: 'astral-1102',
    discordUsername: 'vortex_mod#4401',
    age: 20,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'Aprovado',
    answers: {
      1: '20',
      2: 'Mais de 8 horas por dia (Período integral)',
      3: 'Mais de 3 anos de experiência em Staffs de servidores de RP e Gaming (servidores com mais de 45 mil membros).',
      4: 'Desenvolvo bots próprios em JavaScript (Discord.js), conheço todas as ferramentas tradicionais de moderação e automação.',
      5: 'Admiro o trabalho da equipe de moderação e quero somar com minha experiência em moderação noturna.',
      6: 'Atuação rápida: mutar infratores por 30 minutos, mover a discussão para canal privado de atendimento se necessário.',
      7: 'Tratamento 100% igualitário. A ética profissional na staff vem acima de vínculos pessoais.',
      8: 'Usar comandos de moderação por motivos fúteis ou vingança pessoal. Evito seguindo estritamente a tabela de punições.',
      9: 'Investigaria o histórico de msgs via audit log do Discord e acompanharia o membro denunciado discretamente.',
      10: 'Sistema de pontuação de atividade para recompensar os moderadores mais ativos da semana.',
    },
    adminNotes: 'Aprovado pela administração! Experiência sólida e disponibilidade excelente.',
    reviewedBy: 'Administração Staff',
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    authToken: 'astral_tok_seed_vortex',
  },
];

// Active Auth Tokens Map
const activeTokens = new Map<string, { discordUsername: string; isAdmin: boolean; createdAt: string }>();

// Seed default admin token
activeTokens.set('astral_tok_admin_bakai', {
  discordUsername: 'bakai_shuziro978',
  isAdmin: true,
  createdAt: new Date().toISOString(),
});

// Helper to generate auth token
function generateAuthToken(discordUsername: string, isAdmin: boolean = false): string {
  const random = crypto.randomBytes(16).toString('hex');
  const token = `astral_tok_${random}`;
  activeTokens.set(token, {
    discordUsername,
    isAdmin,
    createdAt: new Date().toISOString(),
  });
  return token;
}

// AUTH API: Generate User Auth Token
app.post('/api/auth/token', (req, res) => {
  const { discordUsername } = req.body;
  if (!discordUsername || typeof discordUsername !== 'string' || !discordUsername.trim()) {
    return res.status(400).json({ error: 'Nick do Discord é obrigatório.' });
  }

  const cleanNick = discordUsername.trim();
  const isAdmin = cleanNick.toLowerCase() === 'bakai_shuziro978';
  const token = generateAuthToken(cleanNick, isAdmin);

  return res.json({
    success: true,
    token,
    discordUsername: cleanNick,
    isAdmin,
  });
});

// SUBMIT FORM API ROUTE: /complete and /api/complete
const handleCompleteSubmit = (req: express.Request, res: express.Response) => {
  const authHeader = req.headers.authorization;
  let token = req.body.authToken || req.body.token;

  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  const { discordUsername, age, answers } = req.body;

  if (!discordUsername || typeof discordUsername !== 'string' || !discordUsername.trim()) {
    return res.status(400).json({ error: 'Campo discordUsername é obrigatório.' });
  }

  // If token wasn't provided or tracked, generate a new auth token for this user
  let activeSession = token ? activeTokens.get(token) : null;
  if (!activeSession) {
    const isUserAdmin = discordUsername.trim().toLowerCase() === 'bakai_shuziro978';
    token = generateAuthToken(discordUsername.trim(), isUserAdmin);
    activeSession = activeTokens.get(token);
  }

  const newApp = {
    id: `astral-${Math.floor(1000 + Math.random() * 9000)}`,
    discordUsername: discordUsername.trim(),
    age: Number(age) || 16,
    submittedAt: new Date().toISOString(),
    status: 'Pendente',
    answers: answers || {},
    adminNotes: '',
    authToken: token,
  };

  // Unshift so new applications appear at top of Dashboard
  applications.unshift(newApp);

  console.log(`[Formulário Astral] Novo formulário recebido de @${newApp.discordUsername} (ID: ${newApp.id})!`);

  return res.status(201).json({
    success: true,
    message: 'Formulário enviado com sucesso e encaminhado diretamente para o Dashboard!',
    token,
    application: newApp,
    totalApplications: applications.length,
  });
};

app.post('/complete', handleCompleteSubmit);
app.post('/api/complete', handleCompleteSubmit);

// FETCH APPLICATIONS API ROUTE: GET /complete & GET /api/complete
const handleGetApplications = (_req: express.Request, res: express.Response) => {
  return res.json({
    success: true,
    count: applications.length,
    applications,
  });
};

app.get('/complete', handleGetApplications);
app.get('/api/complete', handleGetApplications);

// UPDATE APPLICATION STATUS/NOTES ROUTE
const handleUpdateApplication = (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { status, adminNotes, reviewedBy } = req.body;

  const appIndex = applications.findIndex((a) => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Formulário não encontrado.' });
  }

  applications[appIndex] = {
    ...applications[appIndex],
    status: status || applications[appIndex].status,
    adminNotes: adminNotes !== undefined ? adminNotes : applications[appIndex].adminNotes,
    reviewedBy: reviewedBy || 'Administração Staff',
    reviewedAt: new Date().toISOString(),
  };

  return res.json({
    success: true,
    message: 'Status do formulário atualizado!',
    application: applications[appIndex],
  });
};

app.patch('/complete/:id', handleUpdateApplication);
app.patch('/api/complete/:id', handleUpdateApplication);
app.post('/complete/update', (req, res) => {
  req.params = { id: req.body.id };
  return handleUpdateApplication(req, res);
});

// DELETE APPLICATION ROUTE
const handleDeleteApplication = (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const initialLength = applications.length;
  applications = applications.filter((a) => a.id !== id);

  if (applications.length === initialLength) {
    return res.status(404).json({ error: 'Formulário não encontrado.' });
  }

  return res.json({
    success: true,
    message: 'Formulário excluído do servidor.',
  });
};

app.delete('/complete/:id', handleDeleteApplication);
app.delete('/api/complete/:id', handleDeleteApplication);

// Start Vite middleware or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Formulário Astral rodando na porta ${PORT}`);
  });
}

startServer();
