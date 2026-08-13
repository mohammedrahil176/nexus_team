import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getTeamMembers, getTeamMember, upsertTeamMember, deleteTeamMember } from './src/db/teamMembers.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/team', async (req, res) => {
    try {
      const members = await getTeamMembers();
      res.json(members);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to fetch team' });
    }
  });

  app.get('/api/team/:id', async (req, res) => {
    try {
      const member = await getTeamMember(req.params.id);
      if (!member) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json(member);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to fetch team member' });
    }
  });

  // Protected routes for admin panel
  app.post('/api/team', requireAuth, async (req: AuthRequest, res) => {
    try {
      const member = await upsertTeamMember(req.body);
      res.json(member);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to save team member' });
    }
  });

  app.delete('/api/team/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteTeamMember(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to delete team member' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
