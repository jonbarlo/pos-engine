-- Add type column to businesses table if it doesn't exist
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'businesses' AND COLUMN_NAME = 'type'
)
BEGIN
    ALTER TABLE businesses ADD type VARCHAR(255) DEFAULT 'generic';
    UPDATE businesses SET type = 'restaurant' WHERE slug = 'demo-restaurant';
    PRINT 'Type column added successfully!';
END
ELSE
BEGIN
    PRINT 'Type column already exists!';
END 