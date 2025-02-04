package admin

import (
	"beluga/api/utils"
	"beluga/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type UpdateBody struct {
	Probability [10]float32 `json:"probability" binding:"required"`
	Value       [10]float32 `json:"value" binding:"required"`
}

func UpdateVariants(c *gin.Context) {

	var tx *gorm.DB

	defer func() {
		if r := recover(); r != nil && tx != nil {
			tx.Rollback()
		}
	}()

	var body UpdateBody

	err := c.ShouldBindJSON(&body)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Missing or invalid parametes in body",
		})
		return
	}

	var accumlatedProb float32 = 0

	for i := 1; i < len(body.Probability); i++ {
		accumlatedProb += (body.Probability[i])
	}

	if accumlatedProb != 1 {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": "Total Probability must be equal to 1",
		})
		return
	}

	//todo : check if length not equal to 10 is accepted

	for i := range 10 {
		if result := tx.Model(&models.BelugaVariant{}).
			Where("id = ?", i+1).
			UpdateColumns(map[string]interface{}{
				"value":       decimal.NewFromFloat(float64(body.Value[i])),
				"probability": body.Probability[i],
			}).Error; result != nil {
			tx.Rollback()
			utils.ResIntenalError(c)
			return
		}
	}
	tx.Commit()

	c.IndentedJSON(http.StatusOK, gin.H{
		"message": "Variants Updated",
	})
}
