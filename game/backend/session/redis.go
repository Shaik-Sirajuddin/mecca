package session

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

/*
*
Session Store Format

userId -> sessionId
sessionId -> userId

dual map for one to one relation support
*/
var client *redis.Client

func generateSessionId() (string, error) {
	bytes := make([]byte, 12)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Session valid for 15 minutes
func InitializeSession(ctx context.Context, userId uint) (string, error) {
	var sessionId string
	var err error
	for {
		sessionId, err = generateSessionId()
		if err != nil {
			return "", err
		}
		if client.Get(ctx, sessionId).Err() == redis.Nil {
			//break when unique session id is generated
			break
		}
	}
	previousSessionId, err := client.Get(ctx, fmt.Sprint(userId)).Result()
	if err == nil {
		client.Del(ctx, previousSessionId)
	}
	client.Set(ctx, fmt.Sprint(userId), sessionId, time.Minute*15)
	client.Set(ctx, sessionId, fmt.Sprint(userId), time.Minute*15)

	//store last login time
	client.Set(ctx, "login-"+fmt.Sprint(userId), time.Now().Unix(), time.Hour*24)
	return sessionId, nil
}

func GetTodayLoginCount(ctx context.Context) int {
	prefix := "login-" // Match keys that start with "login-"
	cursor := uint64(0)

	userCount := 0

	for {
		keys, newCursor, err := client.Scan(ctx, cursor, prefix+"*", 100).Result()
		if err != nil {
			log.Fatalf("Error scanning keys: %v", err)
		}

		for _, key := range keys {
			// Get each key's value
			val, err := client.Get(ctx, key).Result()
			if err != nil {
				log.Printf("Error getting value for key %s: %v", key, err)
				continue
			}

			// Convert value to int64
			intVal, err := strconv.ParseInt(val, 10, 64)
			if err != nil {
				log.Printf("Error converting value to int64 for key %s: %v", key, err)
				continue
			}
			//Add condition for check
			if intVal-time.Now().Unix() < 86400 {
				userCount++
			}
		}

		cursor = newCursor
		if cursor == 0 {
			break
		}
	}

	return userCount
}
func GetSession(ctx context.Context, sessionId string) (uint, error) {
	userId, err := client.Get(ctx, sessionId).Result()
	if err != nil {
		return 0, err
	}
	parsedUserId, err := strconv.ParseUint(userId, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(parsedUserId), nil
}
func Init() {
	client = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       1,
	})
}
