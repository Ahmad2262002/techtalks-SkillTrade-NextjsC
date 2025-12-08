@echo off
echo Stopping development server...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo Regenerating Prisma Client...
call npx prisma generate

echo Done! You can now restart your dev server with: npm run dev
pause
