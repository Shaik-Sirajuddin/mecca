package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"math/rand/v2"
	"net/url"
	"os"
	"sort"
	"strings"
	"time"
)

const SecurityCode = "joasdf8921kljds"
const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// selectRandomNumber picks a random number between 1 and 10
// based on the provided float probabilities.
func SelectRandomNumber(probabilities []float64) uint {
	if len(probabilities) != 10 {
		panic("The probabilities slice must contain exactly 10 elements")
	}

	// Verify that total probabilities sum to 100.0
	total := 0.0
	for _, p := range probabilities {
		total += p
	}
	if total != 100.0 {
		panic("The sum of all probabilities must be 100.0")
	}

	// Create cumulative distribution
	cumulative := make([]float64, len(probabilities))
	cumulative[0] = probabilities[0]
	for i := 1; i < len(probabilities); i++ {
		cumulative[i] = cumulative[i-1] + probabilities[i]
	}

	// Generate a random float between 0 and 100
	r := rand.Float64() * 100.0

	// Select a number based on the random float and cumulative distribution
	selectedNumber := 1
	for i, cumProb := range cumulative {
		if r <= cumProb {
			selectedNumber = i + 1
			break
		}
	}

	return uint(selectedNumber)
}

func GetRandomBinary() bool {
	// Generate a random number, either 0 or 1
	return rand.IntN(2) == 0
}

// ParseInitData parses the initData query string and returns the hash and data_check_string.
func ParseInitData(initData string) (string, string, error) {
	values, err := url.ParseQuery(initData)
	if err != nil {
		return "", "", err
	}

	hash := values.Get("hash")
	values.Del("hash")

	var kvPairs []string
	for k, v := range values {
		kvPairs = append(kvPairs, k+"="+v[0])
	}

	sort.Strings(kvPairs)
	dataCheckString := strings.Join(kvPairs, "\n")

	return hash, dataCheckString, nil
}

// CheckSignature verifies the initData signature.
func CheckSignature(initData string) (bool, error) {
	token := os.Getenv("BOT_TOKEN")
	hash, dataCheckString, err := ParseInitData(initData)
	if err != nil {
		return false, err
	}

	// Create the secret key using HMAC with SHA-256
	secretKey := "WebAppData" // Secret key used for HMAC
	hmacKey := hmac.New(sha256.New, []byte(secretKey))
	hmacKey.Write([]byte(token))
	secretKeyDigest := hmacKey.Sum(nil)

	// Create HMAC key for data_check_string
	hmacKey = hmac.New(sha256.New, secretKeyDigest)
	hmacKey.Write([]byte(dataCheckString))
	expectedKey := hex.EncodeToString(hmacKey.Sum(nil))

	// Compare the calculated HMAC key with the provided hash
	return hmac.Equal([]byte(expectedKey), []byte(hash)), nil
}

func StartOfDay() time.Time {
	t := time.Now()
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
}

func GenerateReferralCode() string {
	result := make([]byte, 6)
	for i := range result {
		result[i] = charset[rand.IntN(len(charset))]
	}
	return string(result)
}
