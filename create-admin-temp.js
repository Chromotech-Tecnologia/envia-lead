// Script temporário para criar usuário admin
fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/create-admin-user', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('Admin user creation result:', data))
.catch(error => console.error('Error:', error));