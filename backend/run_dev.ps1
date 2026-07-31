# Start the local backend with the project .env loaded (stable JWT secret).
Set-Location $PSScriptRoot
python -m uvicorn main:app --host 127.0.0.1 --port 8000
