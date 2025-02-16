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
		Probability float32 `json:"prob"`
	}

	if err := db.DB.Model(&models.BelugaVariant{}).
		Select("id, value, prob as probability").
		Find(&variants).Error; err != nil {
		println(err.Error())
		utils.ResIntenalError(c)
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"variants": variants,
	})
}
