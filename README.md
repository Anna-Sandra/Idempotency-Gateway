# Idempotency-Gateway

This is a RESTful API that implements an idempotency layer for payment processing, ensuring requests are processed exactly once.

## Architecture Diagram

```mermaid
flowchart TD
    A[Client sends POST /process-payment with Idempotency-Key & Body] --> B{Key exists in store?}
    B -->|No| C[Check if in-flight?]
    C -->|No| D[Start processing: Simulate 2s delay, generate response]
    D --> E[Store key, body hash, response]
    E --> F[Return 201 with response]
    C -->|Yes| G[Wait for original to finish, return its response]
    B -->|Yes| H{Body hash matches?}
    H -->|Yes| I[Return stored response with X-Cache-Hit: true]
    H -->|No| J[Return 409 Conflict Error]