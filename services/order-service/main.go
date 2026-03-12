package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var db *sql.DB

// Order represents a food order
type Order struct {
	ID         int       `json:"id"`
	TableNumber int       `json:"table_number"`
	Items      []OrderItem `json:"items"`
	TotalPrice float64   `json:"total_price"`
	Status     string    `json:"status"` // pending, preparing, completed
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// OrderItem represents a single item in an order
type OrderItem struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Price    float64 `json:"price"`
	Quantity int    `json:"quantity"`
}

// ProcessOrderRequest is the request body for processing orders
type ProcessOrderRequest struct {
	TableNumber int         `json:"table_number"`
	Items       []OrderItem `json:"items"`
	TotalPrice  float64     `json:"total_price"`
	Notes       string      `json:"notes"`
}

// UpdateOrderStatusRequest is the request body for updating order status
type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

// Response is a standard API response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func init() {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("✓ Connected to PostgreSQL from Order Service")
}

// ProcessOrder handles new order creation
func ProcessOrder(c *gin.Context) {
	var req ProcessOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// Insert into database
	var orderID int
	itemsJSON, _ := json.Marshal(req.Items)

	err := db.QueryRow(
		"INSERT INTO orders (table_number, items, total_price, notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		req.TableNumber,
		string(itemsJSON),
		req.TotalPrice,
		req.Notes,
		"pending",
	).Scan(&orderID)

	if err != nil {
		c.JSON(500, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(200, Response{
		Success: true,
		Message: "Order processed successfully",
		Data: map[string]interface{}{
			"order_id":      orderID,
			"table_number":  req.TableNumber,
			"total_price":   req.TotalPrice,
			"status":        "pending",
		},
	})

	log.Printf("✓ Order #%d processed from table %d", orderID, req.TableNumber)
}

// GetOrder retrieves a specific order
func GetOrder(c *gin.Context) {
	orderID := c.Param("id")

	var order Order
	var itemsJSON string

	err := db.QueryRow(
		"SELECT id, table_number, items, total_price, status, notes, created_at, updated_at FROM orders WHERE id = $1",
		orderID,
	).Scan(&order.ID, &order.TableNumber, &itemsJSON, &order.TotalPrice, &order.Status, &order.Notes, &order.CreatedAt, &order.UpdatedAt)

	if err != nil {
		c.JSON(404, Response{
			Success: false,
			Error:   "Order not found",
		})
		return
	}

	json.Unmarshal([]byte(itemsJSON), &order.Items)

	c.JSON(200, Response{
		Success: true,
		Data:    order,
	})
}

// UpdateOrderStatus updates the status of an order
func UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")
	var req UpdateOrderStatusRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	validStatuses := map[string]bool{
		"pending":    true,
		"preparing":  true,
		"completed":  true,
	}

	if !validStatuses[req.Status] {
		c.JSON(400, Response{
			Success: false,
			Error:   "Invalid status",
		})
		return
	}

	_, err := db.Exec(
		"UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
		req.Status,
		orderID,
	)

	if err != nil {
		c.JSON(500, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(200, Response{
		Success: true,
		Message: "Order status updated",
		Data: map[string]interface{}{
			"order_id": orderID,
			"status":   req.Status,
		},
	})

	log.Printf("✓ Order #%s status updated to %s", orderID, req.Status)
}

// GetAllOrders retrieves all orders
func GetAllOrders(c *gin.Context) {
	rows, err := db.Query("SELECT id, table_number, items, total_price, status, notes, created_at, updated_at FROM orders ORDER BY created_at DESC LIMIT 100")
	if err != nil {
		c.JSON(500, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	defer rows.Close()

	orders := []Order{}
	for rows.Next() {
		var order Order
		var itemsJSON string

		if err := rows.Scan(&order.ID, &order.TableNumber, &itemsJSON, &order.TotalPrice, &order.Status, &order.Notes, &order.CreatedAt, &order.UpdatedAt); err != nil {
			log.Println("Error scanning order:", err)
			continue
		}

		json.Unmarshal([]byte(itemsJSON), &order.Items)
		orders = append(orders, order)
	}

	c.JSON(200, Response{
		Success: true,
		Data:    orders,
	})
}

// GetPendingOrders retrieves pending/preparing orders
func GetPendingOrders(c *gin.Context) {
	rows, err := db.Query(
		"SELECT id, table_number, items, total_price, status, notes, created_at, updated_at FROM orders WHERE status IN ('pending', 'preparing') ORDER BY created_at ASC",
	)
	if err != nil {
		c.JSON(500, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	defer rows.Close()

	orders := []Order{}
	for rows.Next() {
		var order Order
		var itemsJSON string

		if err := rows.Scan(&order.ID, &order.TableNumber, &itemsJSON, &order.TotalPrice, &order.Status, &order.Notes, &order.CreatedAt, &order.UpdatedAt); err != nil {
			continue
		}

		json.Unmarshal([]byte(itemsJSON), &order.Items)
		orders = append(orders, order)
	}

	c.JSON(200, Response{
		Success: true,
		Data:    orders,
	})
}

// HealthCheck returns service health status
func HealthCheck(c *gin.Context) {
	c.JSON(200, Response{
		Success: true,
		Message: "Order Service is running",
	})
}

func main() {
	router := gin.Default()

	// Health check
	router.GET("/health", HealthCheck)

	// Order endpoints
	router.POST("/api/orders/process", ProcessOrder)
	router.GET("/api/orders/:id", GetOrder)
	router.PUT("/api/orders/:id/status", UpdateOrderStatus)
	router.GET("/api/orders", GetAllOrders)
	router.GET("/api/orders/status/pending", GetPendingOrders)

	port := os.Getenv("ORDER_SERVICE_PORT")
	if port == "" {
		port = "3001"
	}

	log.Printf("✓ Order Service listening on port %s", port)
	router.Run(":" + port)
}
