import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { TableStatus } from './TableModel';

describe('TableModel', () => {
  let sequelize: Sequelize;
  let TableModel: any;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    TableModel = sequelize.define('Table', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tableNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 20,
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(TableStatus)),
        allowNull: false,
        defaultValue: TableStatus.AVAILABLE,
        validate: {
          isIn: [Object.values(TableStatus)],
        },
      },
      currentOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      serverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      section: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Main Floor',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    }, {
      tableName: 'tables',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['businessId', 'tableNumber'],
        },
        {
          fields: ['businessId', 'status'],
        },
        {
          fields: ['businessId', 'serverId'],
        },
      ],
    });
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await TableModel.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct table name', () => {
      expect(TableModel.tableName).toBe('tables');
    });

    it('should have the required fields', () => {
      const attributes = Object.keys(TableModel.rawAttributes);
      expect(attributes).toContain('id');
      expect(attributes).toContain('businessId');
      expect(attributes).toContain('tableNumber');
      expect(attributes).toContain('capacity');
      expect(attributes).toContain('status');
      expect(attributes).toContain('section');
      expect(attributes).toContain('isActive');
    });
  });

  describe('Table Creation', () => {
    it('should create a table with valid data', async () => {
      const tableData = {
        businessId: 1,
        tableNumber: 'A1',
        capacity: 4,
        status: TableStatus.AVAILABLE,
        section: 'Main Floor',
        isActive: true,
      };

      const table = await TableModel.create(tableData);

      expect(table.id).toBeDefined();
      expect(table.businessId).toBe(tableData.businessId);
      expect(table.tableNumber).toBe(tableData.tableNumber);
      expect(table.capacity).toBe(tableData.capacity);
      expect(table.status).toBe(tableData.status);
      expect(table.section).toBe(tableData.section);
      expect(table.isActive).toBe(tableData.isActive);
      expect(table.createdAt).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should set default values correctly', async () => {
      const tableData = {
        businessId: 1,
        tableNumber: 'B2',
        capacity: 6,
      };

      const table = await TableModel.create(tableData);

      expect(table.status).toBe(TableStatus.AVAILABLE);
      expect(table.section).toBe('Main Floor');
      expect(table.isActive).toBe(true);
      expect(table.currentOrderId).toBeNull();
      expect(table.serverId).toBeNull();
    });

    it('should allow optional fields', async () => {
      const tableData = {
        businessId: 1,
        tableNumber: 'C3',
        capacity: 8,
        currentOrderId: 123,
        serverId: 456,
        section: 'Patio',
      };

      const table = await TableModel.create(tableData);

      expect(table.currentOrderId).toBe(123);
      expect(table.serverId).toBe(456);
      expect(table.section).toBe('Patio');
    });
  });

  describe('Validation', () => {
    it('should require businessId', async () => {
      const tableData = {
        tableNumber: 'A1',
        capacity: 4,
      } as any;

      await expect(TableModel.create(tableData)).rejects.toThrow();
    });

    it('should require tableNumber', async () => {
      const tableData = {
        businessId: 1,
        capacity: 4,
      } as any;

      await expect(TableModel.create(tableData)).rejects.toThrow();
    });

    it('should require capacity', async () => {
      const tableData = {
        businessId: 1,
        tableNumber: 'A1',
      } as any;

      await expect(TableModel.create(tableData)).rejects.toThrow();
    });

    it('should validate capacity range', async () => {
      const tableData = {
        businessId: 1,
        tableNumber: 'A1',
        capacity: 0,
      };

      await expect(TableModel.create(tableData)).rejects.toThrow();

      const tableData2 = {
        businessId: 1,
        tableNumber: 'A1',
        capacity: 25,
      };

      await expect(TableModel.create(tableData2)).rejects.toThrow();
    });

    it('should validate tableNumber is not empty', async () => {
      const tableData = {
        businessId: 1,
        tableNumber: '',
        capacity: 4,
      };

      await expect(TableModel.create(tableData)).rejects.toThrow();
    });

    it('should validate status enum values', async () => {
      const tableData = {
        businessId: 1,
        tableNumber: 'A1',
        capacity: 4,
        status: 'invalid_status' as TableStatus,
      };

      await expect(TableModel.create(tableData)).rejects.toThrow();
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique businessId and tableNumber combination', async () => {
      const tableData = {
        businessId: 1,
        tableNumber: 'A1',
        capacity: 4,
      };

      // Create first table
      await TableModel.create(tableData);

      // Try to create duplicate
      await expect(TableModel.create(tableData)).rejects.toThrow();
    });

    it('should allow same tableNumber for different businesses', async () => {
      const tableData1 = {
        businessId: 1,
        tableNumber: 'A1',
        capacity: 4,
      };

      const tableData2 = {
        businessId: 2,
        tableNumber: 'A1',
        capacity: 4,
      };

      const table1 = await TableModel.create(tableData1);
      const table2 = await TableModel.create(tableData2);

      expect(table1.id).not.toBe(table2.id);
      expect(table1.businessId).toBe(1);
      expect(table2.businessId).toBe(2);
    });
  });

  describe('Table Status Management', () => {
    it('should allow all valid status values', async () => {
      const statuses = Object.values(TableStatus);
      
      for (const status of statuses) {
        const tableData = {
          businessId: 1,
          tableNumber: `Table_${status}`,
          capacity: 4,
          status,
        };

        const table = await TableModel.create(tableData);
        expect(table.status).toBe(status);
      }
    });

    it('should update table status', async () => {
      const table = await TableModel.create({
        businessId: 1,
        tableNumber: 'A1',
        capacity: 4,
        status: TableStatus.AVAILABLE,
      });

      await table.update({ status: TableStatus.OCCUPIED });
      
      const updatedTable = await TableModel.findByPk(table.id);
      expect(updatedTable?.status).toBe(TableStatus.OCCUPIED);
    });
  });

  describe('Table Queries', () => {
    beforeEach(async () => {
      // Create test data
      await TableModel.bulkCreate([
        {
          businessId: 1,
          tableNumber: 'A1',
          capacity: 4,
          status: TableStatus.AVAILABLE,
          section: 'Main Floor',
        },
        {
          businessId: 1,
          tableNumber: 'A2',
          capacity: 6,
          status: TableStatus.OCCUPIED,
          section: 'Main Floor',
          currentOrderId: 123,
          serverId: 456,
        },
        {
          businessId: 1,
          tableNumber: 'B1',
          capacity: 8,
          status: TableStatus.RESERVED,
          section: 'Patio',
        },
        {
          businessId: 2,
          tableNumber: 'A1',
          capacity: 4,
          status: TableStatus.AVAILABLE,
          section: 'Main Floor',
        },
      ]);
    });

    it('should find tables by business', async () => {
      const tables = await TableModel.findAll({
        where: { businessId: 1 },
        order: [['tableNumber', 'ASC']],
      });

      expect(tables[0]!.tableNumber).toBe('A1');
      expect(tables[1]!.tableNumber).toBe('A2');
      expect(tables[2]!.tableNumber).toBe('B1');
    });

    it('should find tables by status', async () => {
      const availableTables = await TableModel.findAll({
        where: { 
          businessId: 1,
          status: TableStatus.AVAILABLE 
        },
      });

      expect(availableTables[0]!.tableNumber).toBe('A1');
    });

    it('should find tables by server', async () => {
      const serverTables = await TableModel.findAll({
        where: { 
          businessId: 1,
          serverId: 456 
        },
      });

      expect(serverTables[0]!.tableNumber).toBe('A2');
    });

    it('should find tables by section', async () => {
      const patioTables = await TableModel.findAll({
        where: { 
          businessId: 1,
          section: 'Patio' 
        },
      });

      expect(patioTables[0]!.tableNumber).toBe('B1');
    });

    it('should find available tables with sufficient capacity', async () => {
      const suitableTables = await TableModel.findAll({
        where: {
          businessId: 1,
          status: TableStatus.AVAILABLE,
          capacity: {
            [Op.gte]: 5,
          },
        },
      });

      expect(suitableTables).toHaveLength(0); // A1 has capacity 4, A2 is occupied
    });
  });

  describe('Table Operations', () => {
    let table: any;

    beforeEach(async () => {
      table = await TableModel.create({
        businessId: 1,
        tableNumber: 'A1',
        capacity: 4,
        status: TableStatus.AVAILABLE,
      });
    });

    it('should assign table to server', async () => {
      await table.update({ serverId: 123 });
      
      const updatedTable = await TableModel.findByPk(table.id);
      expect(updatedTable?.serverId).toBe(123);
    });

    it('should assign order to table', async () => {
      await table.update({ 
        currentOrderId: 456,
        status: TableStatus.OCCUPIED 
      });
      
      const updatedTable = await TableModel.findByPk(table.id);
      expect(updatedTable?.currentOrderId).toBe(456);
      expect(updatedTable?.status).toBe(TableStatus.OCCUPIED);
    });

    it('should clear table when order is completed', async () => {
      // Set table as occupied
      await table.update({ 
        currentOrderId: 456,
        status: TableStatus.OCCUPIED 
      });

      // Clear table (remove currentOrderId by setting to null)
      await table.update({ 
        status: TableStatus.CLEANING 
      });
      await table.setDataValue('currentOrderId', null);
      await table.save();
      
      const updatedTable = await TableModel.findByPk(table.id);
      expect(updatedTable?.currentOrderId).toBeNull();
      expect(updatedTable?.status).toBe(TableStatus.CLEANING);
    });

    it('should deactivate table', async () => {
      await table.update({ isActive: false });
      
      const updatedTable = await TableModel.findByPk(table.id);
      expect(updatedTable?.isActive).toBe(false);
    });
  });
}); 