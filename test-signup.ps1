$testUser = @{
    firstName = "Test"
    lastName = "User"
    email = "test@example.com"
    password = "TestPassword123"
    phone = "1234567890"
} | ConvertTo-Json

Write-Host "Testing signup with data: $testUser"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/signup" -Method Post -Body $testUser -ContentType "application/json"
    Write-Host "Signup successful!"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "Signup failed!"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $errorBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorBody)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent"
    }
}