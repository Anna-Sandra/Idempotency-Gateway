# Idempotency-Gateway

This is a lightweight RESTful API that implements an idempotency layer for payment processing. It ensures that identical requests are processed exactly once, preventing double-charging even when network retries occur.

## 1. Architecture Diagram

```mermaid
flowchart TD
    A[Client sends POST /process-payment<br>with Idempotency-Key & Body] --> B{Key exists in store?}
    B -->|No| C[Check if in-flight?]
    C -->|No| D[Start processing:<br>Simulate 2s delay, generate response]
    D --> E[Store key, body hash, response]
    E --> F[Return 201 with response]
    C -->|Yes| G[Wait for original to finish, return its response]
    B -->|Yes| H{Body hash matches?}
    H -->|Yes| I[Return stored response with X-Cache-Hit: true]
    H -->|No| J[Return 409 Conflict Error]



2. Setup Instructions

# Clone your forked repository
git clone https://github.com/YOUR-USERNAME/Idempotency-Gateway.git
cd Idempotency-Gateway

# Install dependencies
npm install

# Start the server (development mode with auto-reload)
npm run dev

# The server will run on http://localhost:3000



3.API Documentation

# Endpoint
POST /process-payment

# Required Headers
Key               Value
Idempotency-Key   unique string
Content-Tpye      applicaton/json

# Request Body
{
  "amount": 100,
  "currency": "GHS"
}

# Responses
Status,Description,Body Example / Header
201,First successful processing,{"message": "Charged 100 GHS"}
201,Duplicate request (Same Key + Body),{"message": "Charged 100 GHS"}
400,Missing key or invalid body,{"error": "Missing Idempotency-Key"} 
400,Invalid Body,{ "error": "Invalid body" }
409,Same key but different request body,{"error": "Idempotency key already used for a different request body."}




4 Design Decisions
# Map store
Fast lookup for requests and responses.

# SHA-256 hash
Detects duplicate or altered requests.

# 2-second delay
Simulates real payment processing for the first request.

# Duplicate handling
Returns cached response instantly for repeated requests with the same key.

# Error handling
Returns 409 if the same key is used with a different request.



5.Developer's Choice Feature

# In-Flight Request Lock (Race Condition Handling)
The first request enters a processing state.
The second request waits until the first finishes, then returns the same response.
This ensures no double processing occurs while still allowing retries, simulating real-world concurrent-safe payment processing. 