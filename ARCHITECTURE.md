# Book My Spot - Architecture

## Project Structure

```
book-my-spot/
├── client/src/             # React frontend
├── server/                 # Express.js backend
├── shared/                 # Shared validation & types
```

## Data Models

```typescript
interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;           // YYYY-MM-DD (stored in UTC)
  startTime: string;      // HH:mm (stored in UTC)
  endTime: string;        // HH:mm (stored in UTC, calculated from startTime)
  status: 'active' | 'cancelled';
  notes: string | null;
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
  cancelledAt: string | null;
  cancellationReason: string | null;
}
```

## API Endpoints

### GET /api/appointments?date=YYYY-MM-DD
**Response:**
```json
{
  "appointments": [Appointment],
  "businessHours": {
    "start": 7,
    "end": 19,
    "defaultDuration": 30
  }
}
```

### POST /api/appointments
**Request:**
```json
{
  "customerName": "string",
  "customerEmail": "string",
  "date": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "timezone": "Asia/Bangkok",
  "notes": "string (optional)"
}
```
**Response:**
```json
{
  "success": true,
  "appointment": Appointment
}
```

### DELETE /api/appointments/:id
**Request:**
```json
{
  "reason": "string (optional)"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

## Booking Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           👤 User Journey                           │
└─────────────────────────────────────────────────────────────────────┘

                     📅 User selects date & time
                               │
                               ▼
            ┌─────────────────────────────────┐
            │        🕐 TimeSelector          │ ← Real-time availability check
            │                                 │
            └─────────────────────────────────┘
                               │
                               ▼
            ┌─────────────────────────────────┐
            │       📝 BookingModal           │ ← Enter name, email, notes
            │                                 │
            └─────────────────────────────────┘
                               │
                               ▼
            ┌─────────────────────────────────┐
            │       🚀 Submit Request         │ ← POST /api/appointments
            │                                 │
            └─────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        🛡️ Server Processing                         │
├─────────────────────────────────────────────────────────────────────┤
│     ✓ Format validation        ✓ Past time check                    │
│     ✓ Business hours check     ✓ Overlap detection                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
            ┌─────────────────────────────────┐
            │         ✅ Success!             │ ← Date & time confirmation
            │                                 │
            └─────────────────────────────────┘
```