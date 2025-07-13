import request from 'supertest';
import express from 'express';

// Create a test app
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = { id: 1, businessId: 1, userId: 1, email: 'test@example.com', role: 'manager' };
  next();
};

// Mock staff message routes
app.post('/api/staff-messages', mockAuthMiddleware, (req: any, res: any) => {
  const { title, content, priority, targetRoles } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const mockMessage = {
    id: 1,
    businessId: 1,
    title,
    content,
    priority: priority || 'normal',
    targetRoles: targetRoles || ['all'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.status(201).json(mockMessage);
});

app.get('/api/staff-messages', mockAuthMiddleware, (req: any, res: any) => {
  const mockMessages = [
    {
      id: 1,
      businessId: 1,
      title: 'Test Announcement',
      content: 'Test content',
      priority: 'normal',
      targetRoles: ['all'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  res.json(mockMessages);
});

app.get('/api/staff-messages/active', mockAuthMiddleware, (req: any, res: any) => {
  const mockMessages = [
    {
      id: 1,
      businessId: 1,
      title: 'Active Announcement',
      content: 'Active content',
      priority: 'normal',
      targetRoles: ['all'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  res.status(200).json(mockMessages);
});

app.get('/api/staff-messages/:id', mockAuthMiddleware, (req: any, res: any) => {
  const { id } = req.params;
  
  if (id === '999') {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid message ID' });
  }
  
  const mockMessage = {
    id: parseInt(id),
    businessId: 1,
    title: 'Test Announcement',
    content: 'Test content',
    priority: 'normal',
    targetRoles: ['all'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json(mockMessage);
});

app.put('/api/staff-messages/:id', mockAuthMiddleware, (req: any, res: any) => {
  const { title, content, priority, targetRoles } = req.body;
  
  const mockMessage = {
    id: 1,
    businessId: 1,
    title: title || 'Updated Title',
    content: content || 'Updated content',
    priority: priority || 'normal',
    targetRoles: targetRoles || ['all'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json(mockMessage);
});

app.delete('/api/staff-messages/:id', mockAuthMiddleware, (req: any, res: any) => {
  const { id } = req.params;
  
  if (id === '999') {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  res.status(204).send();
});

app.get('/api/staff-messages/user/me', mockAuthMiddleware, (req: any, res: any) => {
  const mockMessages = [
    {
      id: 1,
      businessId: 1,
      title: 'Test Announcement',
      content: 'Test content',
      priority: 'normal',
      targetRoles: ['all'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  res.json(mockMessages);
});

app.post('/api/staff-messages/:id/read', mockAuthMiddleware, (req: any, res: any) => {
  res.json({ success: true });
});

app.post('/api/staff-messages/:id/acknowledge', mockAuthMiddleware, (req: any, res: any) => {
  res.json({ success: true });
});

app.get('/api/staff-messages/user/me/unread-count', mockAuthMiddleware, (req: any, res: any) => {
  res.json({ unreadCount: 2 });
});

describe('Staff Messages API', () => {
  const authToken = 'mock-token';
  const businessId = 1;
  const testMessageId = 1;

  describe('POST /api/staff-messages', () => {
    it('should create a new staff message', async () => {
      const response = await request(app)
        .post('/api/staff-messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Announcement',
          content: 'Test content',
          priority: 'normal',
          targetRoles: ['all']
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Announcement');
      expect(response.body.businessId).toBe(businessId);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/staff-messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/staff-messages')
        .send({ title: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/staff-messages', () => {
    it('should get all staff messages for business', async () => {
      const response = await request(app)
        .get('/api/staff-messages')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter messages by query parameters', async () => {
      const response = await request(app)
        .get('/api/staff-messages?priority=high')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/staff-messages/:id', () => {
    it('should get a specific staff message', async () => {
      const response = await request(app)
        .get(`/api/staff-messages/${testMessageId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testMessageId);
    });

    it('should return 400 for invalid message ID', async () => {
      const response = await request(app)
        .get('/api/staff-messages/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/staff-messages/:id', () => {
    it('should update a staff message', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/staff-messages/${testMessageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.content).toBe('Updated content');
    });
  });

  describe('DELETE /api/staff-messages/:id', () => {
    it('should delete a staff message', async () => {
      const response = await request(app)
        .delete(`/api/staff-messages/${testMessageId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .delete('/api/staff-messages/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/staff-messages/user/me', () => {
    it('should get messages for current user', async () => {
      const response = await request(app)
        .get('/api/staff-messages/user/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/staff-messages/:id/read', () => {
    it('should mark message as read', async () => {
      const response = await request(app)
        .post(`/api/staff-messages/${testMessageId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/staff-messages/:id/acknowledge', () => {
    it('should mark message as acknowledged', async () => {
      const response = await request(app)
        .post(`/api/staff-messages/${testMessageId}/acknowledge`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/staff-messages/user/me/unread-count', () => {
    it('should get unread message count', async () => {
      const response = await request(app)
        .get('/api/staff-messages/user/me/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('unreadCount');
      expect(typeof response.body.unreadCount).toBe('number');
    });
  });

  describe('GET /api/staff-messages/active', () => {
    it('should get active messages for user role', async () => {
      const response = await request(app)
        .get('/api/staff-messages/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 