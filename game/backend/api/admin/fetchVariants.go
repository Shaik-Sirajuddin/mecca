package admin

import (
	"beluga/api/utils"
	"beluga/db"
	"beluga/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

func GetVariants(c *gin.Context) {
	var variants []struct {
		ID          uint            `json:"id"`
		Value       decimal.Decimal `json:"value"`
		Probability float32         `json:"probability"`
	}

	if err := db.DB.Model(&models.BelugaVariant{}).
		Select("id, value, probability").
		Find(&variants).Error; err != nil {
		utils.ResIntenalError(c)
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"variants": variants,
	})
}
