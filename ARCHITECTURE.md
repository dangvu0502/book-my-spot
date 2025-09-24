# Book My Spot - Architecture Document

## 1. API Endpoints

### GET /api/appointments?date=YYYY-MM-DD
**Purpose**: Retrieve all appointments for a specific date

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "customerName": "string",
      "customerEmail": "string",
      "date": "YYYY-MM-DD",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "status": "active | cancelled",
      "notes": "string",
      "createdAt": "ISO 8601 timestamp"
    }
  ]
}
```

### POST /api/appointments
**Purpose**: Create a new appointment

**Request**:
```json
{
  "customerName": "string (required)",
  "customerEmail": "string (required, email format)",
  "date": "YYYY-MM-DD (required)",
  "startTime": "HH:mm (required)",
  "timezoneOffset": "number (required, minutes offset from UTC)",
  "notes": "string (optional, max 500 chars)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "customerName": "string",
    "customerEmail": "string",
    "date": "YYYY-MM-DD",
    "startTime": "HH:mm",
    "endTime": "HH:mm",
    "status": "active",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

### DELETE /api/appointments/:id
**Purpose**: Cancel an existing appointment

**Request Body**:
```json
{
  "reason": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "cancelled",
    "cancelledAt": "ISO 8601 timestamp"
  }
}
```

## 2. Data Structure

### Appointment Model
```typescript
interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'active' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}
```

### Storage Interface
```typescript
interface IStorage {
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  cancelAppointment(id: string, reason?: string): Promise<boolean>;
  isSlotAvailable(date: string, startTime: string): Promise<boolean>;
  createAppointmentIfAvailable(appointment: InsertAppointment): Promise<Appointment | null>;
}
```

## 3. System Architecture

### Storage Implementation
- **Data Structure**: `Map<string, Appointment>` for O(1) lookups
- **Concurrency Control**: Slot locking mechanism prevents double-booking
- **Business Hours**: 07:00-19:00 with 30-minute slots
- **No Persistence**: Data resets on server restart

### Architecture Flow

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Client Layer  │ ──────────────► │   API Gateway   │
│  (React SPA)    │                 │  (Express.js)   │
└─────────────────┘                 └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ Service Layer   │
                                    │ - Validation    │
                                    │ - Business Logic│
                                    │ - Slot Locking  │
                                    └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ Storage Layer   │
                                    │ Map<string,     │
                                    │ Appointment>    │
                                    └─────────────────┘
```