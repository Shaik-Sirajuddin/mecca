package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func ResIntenalError(c *gin.Context) {
	c.IndentedJSON(http.StatusInternalServerError, gin.H{
		"error": "Interval Server Error",
	})
	c.Abort()
}
