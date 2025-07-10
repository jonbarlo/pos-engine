import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('businesses', 'type', {
    type: DataTypes.ENUM('generic', 'restaurant'),
    allowNull: false,
    defaultValue: 'generic',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('businesses', 'type');
  await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_businesses_type\";");
} 