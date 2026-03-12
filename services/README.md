# Go Microservices

This folder contains Go microservices that extend the Node.js food ordering system.

## Services

### 1. Order Service (Port 3001)
Handles order processing and management.

**Features:**
- Process new orders from customers
- Update order status (pending → preparing → completed)
- Retrieve order details
- Get all pending/preparing orders (for kitchen display)
- Real-time order tracking

**Endpoints:**
- `POST /api/orders/process` - Create new order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - Get all orders
- `GET /api/orders/status/pending` - Get pending orders
- `PUT /api/orders/:id/status` - Update order status
- `GET /health` - Health check

### 2. Analytics Service (Port 3002)
Provides comprehensive analytics and reporting.

**Features:**
- Daily statistics (revenue, order count, completion rate)
- Weekly trends
- Monthly performance
- Category-wise breakdown
- Hourly distribution
- Top items analysis
- Payment statistics

**Endpoints:**
- `GET /api/analytics/daily` - Today's statistics
- `GET /api/analytics/weekly` - Past 7 days
- `GET /api/analytics/monthly` - Current month
- `GET /api/analytics/category` - By category
- `GET /api/analytics/hourly` - By hour
- `GET /api/analytics/top-items` - Top 10 items (customizable)
- `GET /api/analytics/payment` - Payment stats
- `GET /health` - Health check

## Installation

### Prerequisites
- Go 1.21 or higher
- PostgreSQL running on localhost:5432
- Node.js server running on localhost:3000

### Setup

1. **Install Go** (if not installed)
   - Download from https://golang.org/dl/

2. **Order Service Setup**
```bash
cd services/order-service
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=food_ordering_db
set DB_USER=postgres
set DB_PASSWORD=2234
set ORDER_SERVICE_PORT=3001
go get
go run main.go
```

3. **Analytics Service Setup** (in another terminal)
```bash
cd services/analytics-service
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=food_ordering_db
set DB_USER=postgres
set DB_PASSWORD=2234
set ANALYTICS_SERVICE_PORT=3002
go get
go run main.go
```

## Integration with Node.js Server

The Node.js server can call these microservices:

```javascript
// From Node.js
const orderResponse = await fetch('http://localhost:3001/api/orders/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});

const analytics = await fetch('http://localhost:3002/api/analytics/daily', {
  headers: { 'Content-Type': 'application/json' }
});
```

## Architecture

```
┌──────────────────────────────────┐
│    Frontend (React/HTML/JS)      │
│   Menu, Cart, Admin Dashboard    │
└────────────┬─────────────────────┘
             │ HTTP/REST
             ▼
┌──────────────────────────────────┐
│  Node.js/Express (Port 3000)     │
│  API Gateway, Menu, Auth         │
└───┬──────────┬──────────┬────────┘
    │          │          │
    │      HTTP│          │HTTP
    │          ▼          ▼
PostgreSQL   Order    Analytics
Database    Service   Service
(Port 5432) (Port 3001)(Port 3002)
```

## Running All Services

### Option 1: Manual (3 terminals)

Terminal 1 - Node.js:
```bash
npm start
```

Terminal 2 - Order Service:
```bash
cd services/order-service
set DB_HOST=localhost && set DB_PORT=5432 && set DB_NAME=food_ordering_db && set DB_USER=postgres && set DB_PASSWORD=2234
go run main.go
```

Terminal 3 - Analytics Service:
```bash
cd services/analytics-service
set DB_HOST=localhost && set DB_PORT=5432 && set DB_NAME=food_ordering_db && set DB_USER=postgres && set DB_PASSWORD=2234
go run main.go
```

### Build for Production

```bash
# Build Order Service
cd services/order-service
go build -o order-service.exe main.go

# Build Analytics Service
cd services/analytics-service
go build -o analytics-service.exe main.go
```

Then run the compiled binaries with environment variables set.

## Database Schema

Both services use the existing PostgreSQL tables:
- `menu_items` - Menu items
- `orders` - Order records with JSON items array

## Monitoring

Health check endpoints:
- Order Service: `http://localhost:3001/health`
- Analytics Service: `http://localhost:3002/health`

## Future Enhancements

1. **Real-time WebSocket Updates** - Live order status updates
2. **Kitchen Display System** - Dedicated interface for kitchen staff
3. **Customer Notifications** - SMS/Email order status updates
4. **Advanced Analytics** - ML-based forecasting
5. **Payment Integration** - Multiple payment gateway support
6. **Inventory Management** - Track ingredient usage
7. **Staff Management** - User roles and permissions

## Troubleshooting

**Connection refused error:**
```
Make sure PostgreSQL is running and credentials in .env are correct
Port 3001/3002 are available
Node.js server is running
```

**Table not found:**
```
Run database initialization via Node.js server first
Tables will be created automatically
```

**No data in analytics:**
```
Analytics queries the orders table
Make sure orders have been created
Wait for orders to have created_at from today
```

## Contributing

To add new endpoints:
1. Add handler function in main.go
2. Register route in main()
3. Test with curl or Postman
4. Document in this README

## License

MIT
