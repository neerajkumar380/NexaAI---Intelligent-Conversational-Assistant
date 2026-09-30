@echo off
echo Installing AI Chatbot Dependencies...
echo.

echo Installing backend dependencies...
call npm install

echo.
echo Installing frontend dependencies...
cd client
call npm install
cd ..

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Update .env file with your MongoDB URI and Gemini API key
echo 2. Update client/.env file with your API URLs
echo 3. Start MongoDB service
echo 4. Run 'npm run dev' to start the backend
echo 5. Run 'cd client && npm start' to start the frontend
echo.
pause