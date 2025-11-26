@echo off
echo ========================================
echo Migration Script for lichlamviec table
echo ========================================
echo.

echo Step 1: Creating backup...
docker exec -it my-app-db-1 pg_dump -U postgres webdacsn > backup_lichlamviec_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create backup!
    pause
    exit /b 1
)
echo Backup created successfully!
echo.

echo Step 2: Applying migration...
docker exec -i my-app-db-1 psql -U postgres -d webdacsn < Backend\demo\migration_lichlamviec.sql
if %errorlevel% neq 0 (
    echo ERROR: Migration failed!
    echo You can restore from backup if needed.
    pause
    exit /b 1
)
echo Migration applied successfully!
echo.

echo Step 3: Restarting backend...
docker-compose restart backend
if %errorlevel% neq 0 (
    echo ERROR: Failed to restart backend!
    pause
    exit /b 1
)
echo Backend restarted successfully!
echo.

echo ========================================
echo Migration completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Check backend logs: docker-compose logs -f backend
echo 2. Test the Calendar page with employee account
echo 3. Try creating a new shift with full information
echo.
pause
