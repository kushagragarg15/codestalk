@echo off
echo ========================================
echo   Push CodeStalk to GitHub
echo ========================================
echo.
echo Step 1: Create repository on GitHub
echo   Go to: https://github.com/new
echo   Name: codestalk
echo   Description: Track and compete with friends on LeetCode
echo   DO NOT initialize with README
echo.
echo Step 2: Copy your repository URL
echo   Example: https://github.com/YOUR_USERNAME/codestalk.git
echo.
set /p REPO_URL="Paste your GitHub repository URL: "
echo.
echo Adding remote origin...
git remote add origin %REPO_URL%
echo.
echo Pushing to GitHub...
git push -u origin master
echo.
echo ========================================
echo   Done! Check your repository:
echo   %REPO_URL%
echo ========================================
pause
