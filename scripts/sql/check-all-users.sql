-- Check all users and their authentication methods
SELECT User, Host, plugin 
FROM mysql.user 
ORDER BY User, Host; 