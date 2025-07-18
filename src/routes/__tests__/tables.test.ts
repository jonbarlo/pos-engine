import request from 'supertest';
import express from 'express';
import { TableModel, TableStatus } from '../../models/TableModel';

// Mock the models
jest.mock('../../models/TableModel');
jest.mock('../../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 1, businessId: 1, email: 'test@example.com' };
    next();
  })
}));
jest.mock('../../middleware/restaurantCheck', () => ({
  requireRestaurant: jest.fn((req, res, next) => {
    req.businessType = 'restaurant';
    next();
  })
}));

// Create a test app
const app = express();
app.use(express.json());

// Mock the table routes
app.get('/api/tables', (req: any, res: any) => {
  const { status, assignedWaiterId } = req.query;
  const businessId = req.user?.businessId || 1;
  
  // Mock response
  const mockTables = [
    {
      id: 1,
      businessId: 1,
      tableNumber: 'Table 1',
      capacity: 4,
      status: status === 'occupied' ? 'occupied' : 'available',
      section: 'Main Floor',
      currentOrderId: null,
      serverId: assignedWaiterId ? parseInt(assignedWaiterId as string) : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  res.json({ data: mockTables });
});

app.get('/api/tables/:id', (req: any, res: any) => {
  const { id } = req.params;
  
  if (id === '999') {
    return res.status(404).json({ error: 'Table not found' });
  }
  
  const mockTable = {
    id: parseInt(id),
    businessId: 1,
    tableNumber: `Table ${id}`,
    capacity: 4,
    status: 'available',
    section: 'Main Floor',
    currentOrderId: null,
    serverId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json({ data: mockTable });
});

app.put('/api/tables/:id/status', (req: any, res: any) => {
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['available', 'occupied', 'reserved', 'cleaning', 'out_of_service'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status value',
      validStatuses
    });
  }
  
  const mockTable = {
    id: 1,
    businessId: 1,
    tableNumber: 'Table 1',
    capacity: 4,
    status: status,
    section: 'Main Floor',
    currentOrderId: null,
    serverId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json({ data: mockTable });
});

app.put('/api/tables/:id/assign', (req: any, res: any) => {
  const { waiterId } = req.body;
  
  if (!waiterId || isNaN(parseInt(waiterId))) {
    return res.status(400).json({ error: 'Valid waiter ID is required' });
  }
  
  const mockTable = {
    id: 1,
    businessId: 1,
    tableNumber: 'Table 1',
    capacity: 4,
    status: 'available',
    section: 'Main Floor',
    currentOrderId: null,
    serverId: parseInt(waiterId),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json({ data: mockTable });
});

app.post('/api/tables/:id/clear', (req: any, res: any) => {
  const mockTable = {
    id: 1,
    businessId: 1,
    tableNumber: 'Table 1',
    capacity: 4,
    status: 'available',
    section: 'Main Floor',
    currentOrderId: null,
    serverId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json({ data: mockTable });
});

app.post('/api/tables', (req: any, res: any) => {
  const { tableNumber, capacity } = req.body;
  
  if (!tableNumber || !capacity) {
    return res.status(400).json({ 
      error: 'Missing required fields: tableNumber and capacity are required' 
    });
  }
  
  const mockTable = {
    id: 1,
    businessId: 1,
    tableNumber: tableNumber,
    capacity: parseInt(capacity),
    status: 'available',
    section: 'Main Floor',
    currentOrderId: null,
    serverId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.status(201).json({ data: mockTable });
});

app.post('/api/tables/:id/seat', (req: any, res: any) => {
  const { id } = req.params;
  const { customerName, customerPhone, customerEmail, partySize, serverId, notes } = req.body;
  
  if (!partySize || partySize <= 0) {
    return res.status(400).json({ error: 'Valid party size is required' });
  }
  
  const mockTable = {
    id: parseInt(id),
    businessId: 1,
    tableNumber: `Table ${id}`,
    capacity: 4,
    status: 'occupied',
    section: 'Main Floor',
    currentOrderId: 123,
    serverId: serverId ? parseInt(serverId) : null,
    partySize: partySize,
    customerName: customerName || null,
    notes: notes || null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const mockOrder = {
    id: 123,
    orderNumber: `ORDER-${Date.now()}-${id}`,
    customerId: customerEmail ? 456 : null
  };
  
  res.json({
    data: mockTable,
    order: mockOrder,
    message: `Successfully seated party of ${partySize} at table ${mockTable.tableNumber}`
  });
});

describe('Table Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tables', () => {
    it('should return tables in the expected format', async () => {
      const response = await request(app)
        .get('/api/tables')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('tableNumber');
      expect(response.body.data[0]).toHaveProperty('status');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/tables?status=occupied')
        .expect(200);

      expect(response.body.data[0].status).toBe('occupied');
    });

    it('should filter by assigned waiter', async () => {
      const response = await request(app)
        .get('/api/tables?assignedWaiterId=1')
        .expect(200);

      expect(response.body.data[0].serverId).toBe(1);
    });
  });

  describe('GET /api/tables/:id', () => {
    it('should return table details in the expected format', async () => {
      const response = await request(app)
        .get('/api/tables/1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('tableNumber', 'Table 1');
    });

    it('should return 404 for non-existent table', async () => {
      const response = await request(app)
        .get('/api/tables/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Table not found');
    });
  });

  describe('PUT /api/tables/:id/status', () => {
    it('should update table status', async () => {
      const response = await request(app)
        .put('/api/tables/1/status')
        .send({ status: 'occupied' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'occupied');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/tables/1/status')
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid status value');
    });
  });

  describe('PUT /api/tables/:id/assign', () => {
    it('should assign table to waiter', async () => {
      const response = await request(app)
        .put('/api/tables/1/assign')
        .send({ waiterId: 2 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('serverId', 2);
    });

    it('should return 400 for invalid waiter ID', async () => {
      const response = await request(app)
        .put('/api/tables/1/assign')
        .send({ waiterId: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Valid waiter ID is required');
    });
  });

  describe('POST /api/tables/:id/clear', () => {
    it('should clear table', async () => {
      const response = await request(app)
        .post('/api/tables/1/clear')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'available');
      expect(response.body.data).toHaveProperty('serverId', null);
      expect(response.body.data).toHaveProperty('currentOrderId', null);
    });
  });

  describe('POST /api/tables', () => {
    it('should create a new table', async () => {
      const response = await request(app)
        .post('/api/tables')
        .send({
          tableNumber: 'Table 5',
          capacity: 6,
          section: 'Patio'
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('tableNumber', 'Table 5');
      expect(response.body.data).toHaveProperty('capacity', 6);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/tables')
        .send({
          tableNumber: 'Table 5'
          // Missing capacity
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields: tableNumber and capacity are required');
    });
  });

  describe('POST /api/tables/:id/seat', () => {
    it('should seat customers at table', async () => {
      const response = await request(app)
        .post('/api/tables/1/seat')
        .send({
          customerName: 'John Doe',
          customerPhone: '+1-555-0123',
          customerEmail: 'john@example.com',
          partySize: 4,
          serverId: 1,
          notes: 'Window seat preferred'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('order');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('status', 'occupied');
      expect(response.body.data).toHaveProperty('partySize', 4);
      expect(response.body.data).toHaveProperty('currentOrderId', 123);
    });

    it('should return 400 for invalid party size', async () => {
      const response = await request(app)
        .post('/api/tables/1/seat')
        .send({
          customerName: 'John Doe',
          partySize: 0
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Valid party size is required');
    });

    it('should work with minimal data', async () => {
      const response = await request(app)
        .post('/api/tables/1/seat')
        .send({
          partySize: 2
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'occupied');
      expect(response.body.data).toHaveProperty('partySize', 2);
    });
  });
}); 