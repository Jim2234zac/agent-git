package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var db *sql.DB

// DailyStats represents daily statistics
type DailyStats struct {
	Date              string  `json:"date"`
	TotalOrders       int     `json:"total_orders"`
	CompletedOrders   int     `json:"completed_orders"`
	TotalRevenue      float64 `json:"total_revenue"`
	AverageOrderValue float64 `json:"average_order_value"`
	TopItem           string  `json:"top_item"`
}

// CategoryStats represents statistics by category
type CategoryStats struct {
	Category  string  `json:"category"`
	Orders    int     `json:"orders"`
	Revenue   float64 `json:"revenue"`
	Percentage float64 `json:"percentage"`
}

// HourlyStats represents statistics by hour
type HourlyStats struct {
	Hour  int     `json:"hour"`
	Count int     `json:"count"`
	Total float64 `json:"total"`
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

	log.Println("✓ Connected to PostgreSQL from Analytics Service")
}

// GetDailyStats returns statistics for today
func GetDailyStats(c *gin.Context) {
	today := time.Now().Format("2006-01-02")

	var stats DailyStats
	stats.Date = today

	// Total orders today
	err := db.QueryRow(
		"SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1",
		today,
	).Scan(&stats.TotalOrders)
	if err == sql.ErrNoRows {
		stats.TotalOrders = 0
	}

	// Completed orders today
	db.QueryRow(
		"SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1 AND status = 'completed'",
		today,
	).Scan(&stats.CompletedOrders)

	// Total revenue today
	db.QueryRow(
		"SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE DATE(created_at) = $1",
		today,
	).Scan(&stats.TotalRevenue)

	// Average order value
	if stats.TotalOrders > 0 {
		stats.AverageOrderValue = stats.TotalRevenue / float64(stats.TotalOrders)
	}

	// Top item today
	db.QueryRow(
		`SELECT COALESCE((items->0->>'name'), 'N/A') FROM orders 
		 WHERE DATE(created_at) = $1 
		 ORDER BY created_at DESC LIMIT 1`,
		today,
	).Scan(&stats.TopItem)

	c.JSON(200, Response{
		Success: true,
		Data:    stats,
	})

	log.Printf("✓ Daily stats retrieved for %s", today)
}

// GetWeeklyStats returns statistics for the past 7 days
func GetWeeklyStats(c *gin.Context) {
	rows, err := db.Query(
		`SELECT 
			DATE(created_at) as date,
			COUNT(*) as count,
			SUM(total_price) as total
		 FROM orders 
		 WHERE created_at >= NOW() - INTERVAL '7 days'
		 GROUP BY DATE(created_at)
		 ORDER BY DATE(created_at) DESC`,
	)
	if err != nil {
		c.JSON(500, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	defer rows.Close()

	var stats []map[string]interface{}
	for rows.Next() {
		var date string
		var count int
		var total float64

		if err := rows.Scan(&date, &count, &total); err != nil {
			continue
		}

		stats = append(stats, map[string]interface{}{
			"date":   date,
			"orders": count,
			"total":  total,
		})
	}

	c.JSON(200, Response{
		Success: true,
		Data:    stats,
	})
}

// GetMonthlyStats returns statistics for the current month
func GetMonthlyStats(c *gin.Context) {
	var totalOrders int
	var completedOrders int
	var totalRevenue float64

	db.QueryRow(
		"SELECT COUNT(*) FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())",
	).Scan(&totalOrders)

	db.QueryRow(
		"SELECT COUNT(*) FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) AND status = 'completed'",
	).Scan(&completedOrders)

	db.QueryRow(
		"SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())",
	).Scan(&totalRevenue)

	c.JSON(200, Response{
		Success: true,
		Data: map[string]interface{}{
			"period":           "month",
			"total_orders":     totalOrders,
			"completed_orders": completedOrders,
			"total_revenue":    totalRevenue,
			"completion_rate":  float64(completedOrders) / float64(totalOrders) * 100,
		},
	})
}

// GetCategoryStats returns statistics by menu category
func GetCategoryStats(c *gin.Context) {
	rows, err := db.Query(
		`SELECT category, COUNT(*) as count, SUM(price * quantity)::float as total
		 FROM (
			SELECT menu_items.category, menu_items.price, 
			   CAST(items->i->>'quantity' AS INTEGER) as quantity
			FROM orders,
			   jsonb_array_elements(orders.items) WITH ORDINALITY as items(item, i)
			JOIN menu_items ON menu_items.id = CAST(items->>'id' AS INTEGER)
		 ) t
		 GROUP BY category
		 ORDER BY total DESC`,
	)

	if err != nil {
		c.JSON(500, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	defer rows.Close()

	var stats []CategoryStats
	var totalRevenue float64

	for rows.Next() {
		var category string
		var orders int
		var revenue float64

		if err := rows.Scan(&category, &orders, &revenue); err != nil {
			continue
		}

		totalRevenue += revenue
		stats = append(stats, CategoryStats{
			Category: category,
			Orders:   orders,
			Revenue:  revenue,
		})
	}

	// Calculate percentages
	for i := range stats {
		if totalRevenue > 0 {
			stats[i].Percentage = (stats[i].Revenue / totalRevenue) * 100
		}
	}

	c.JSON(200, Response{
		Success: true,
		Data:    stats,
	})
}

// GetHourlyStats returns statistics by hour of day
func GetHourlyStats(c *gin.Context) {
	rows, err := db.Query(
		`SELECT 
			EXTRACT(HOUR FROM created_at)::int as hour,
			COUNT(*) as count,
			SUM(total_price) as total
		 FROM orders
		 WHERE created_at >= NOW() - INTERVAL '24 hours'
		 GROUP BY EXTRACT(HOUR FROM created_at)
		 ORDER BY hour`,
	)

	if err != nil {
		c.JSON(500, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	defer rows.Close()

	stats := []HourlyStats{}
	for rows.Next() {
		var hour int
		var count int
		var total float64

		if err := rows.Scan(&hour, &count, &total); err != nil {
			continue
		}

		stats = append(stats, HourlyStats{
			Hour:  hour,
			Count: count,
			Total: total,
		})
	}

	c.JSON(200, Response{
		Success: true,
		Data:    stats,
	})
}

// GetTopItems returns the most ordered items
func GetTopItems(c *gin.Context) {
	limit := c.DefaultQuery("limit", "10")

	rows, err := db.Query(
		`SELECT items->>'name' as name, 
			COUNT(*) as count,
			CAST(items->>'price' AS FLOAT) * COUNT(*) as total
		 FROM orders,
		 jsonb_array_elements(orders.items) as items
		 GROUP BY items->>'name', items->>'price'
		 ORDER BY count DESC
		 LIMIT $1`,
		limit,
	)

	if err != nil {
		c.JSON(500, Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	defer rows.Close()

	var topItems []map[string]interface{}
	for rows.Next() {
		var name string
		var count int
		var total float64

		if err := rows.Scan(&name, &count, &total); err != nil {
			continue
		}

		topItems = append(topItems, map[string]interface{}{
			"name":   name,
			"orders": count,
			"total":  total,
		})
	}

	c.JSON(200, Response{
		Success: true,
		Data:    topItems,
	})
}

// GetPaymentStats returns payment statistics
func GetPaymentStats(c *gin.Context) {
	var avgOrderValue float64
	var maxOrderValue float64
	var minOrderValue float64

	db.QueryRow("SELECT AVG(total_price) FROM orders").Scan(&avgOrderValue)
	db.QueryRow("SELECT MAX(total_price) FROM orders").Scan(&maxOrderValue)
	db.QueryRow("SELECT MIN(total_price) FROM orders WHERE total_price > 0").Scan(&minOrderValue)

	c.JSON(200, Response{
		Success: true,
		Data: map[string]interface{}{
			"average_order_value": avgOrderValue,
			"max_order_value":     maxOrderValue,
			"min_order_value":     minOrderValue,
		},
	})
}

// HealthCheck returns service health status
func HealthCheck(c *gin.Context) {
	c.JSON(200, Response{
		Success: true,
		Message: "Analytics Service is running",
	})
}

func main() {
	router := gin.Default()

	// Health check
	router.GET("/health", HealthCheck)

	// Analytics endpoints
	router.GET("/api/analytics/daily", GetDailyStats)
	router.GET("/api/analytics/weekly", GetWeeklyStats)
	router.GET("/api/analytics/monthly", GetMonthlyStats)
	router.GET("/api/analytics/category", GetCategoryStats)
	router.GET("/api/analytics/hourly", GetHourlyStats)
	router.GET("/api/analytics/top-items", GetTopItems)
	router.GET("/api/analytics/payment", GetPaymentStats)

	port := os.Getenv("ANALYTICS_SERVICE_PORT")
	if port == "" {
		port = "3002"
	}

	log.Printf("✓ Analytics Service listening on port %s", port)
	router.Run(":" + port)
}
