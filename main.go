package main

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type VerifyWordRequest struct {
	WorldeID int    `json:"wordle_id"`
	Word     string `json:"word"`
}

type VerifyWordResponse struct {
	Status    int   `json:"status"`
	Positions []int `json:"positions,omitempty"`
}

const nWordles int = 1

var filenames [nWordles]string = [nWordles]string{"words.txt"}
var wordles [nWordles]Wordle = [nWordles]Wordle{}

func main() {
	for i := 0; i < nWordles; i++ {
		wordles[i], _ = CreateWordle(filenames[i])
	}
	//gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.Use(cors.Default())

	r.Routes()

	r.POST("/", func(c *gin.Context) {
		fmt.Println(wordles[0].wordOfTheDay)
		var body VerifyWordRequest
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, wordles[body.WorldeID].CheckWord(body.Word))
	})

	r.Run()
}
