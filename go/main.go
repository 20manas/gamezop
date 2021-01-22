package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-redis/redis/v8"
	"github.com/rs/xid"
)

// User describes the payload.
type User struct {
	FirstName string
	LastName  string
	Age       int
}

var ctx = context.Background()

var rdb = redis.NewClient(&redis.Options{
	Addr:     "localhost:6379",
	Password: "",
	DB:       0,
})

func addDataToRedis(user User) string {
	userKey := "user:" + xid.New().String()
	userString, err := json.Marshal(user)
	if err != nil {
		panic(err)
	}

	errSet := rdb.Set(ctx, userKey, userString, 0).Err()
	if errSet != nil {
		panic(err)
	}

	return userKey
}

func notifyNodeService(userKey string) {
	err := rdb.Publish(ctx, "newUserCreated", userKey).Err()
	if err != nil {
		panic(err)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var data User
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			http.Error(w, "The JSON format is incorrect", http.StatusBadRequest)
			return
		}

		if len(data.FirstName) == 0 || len(data.LastName) == 0 || data.Age == 0 {
			http.Error(w, "The JSON data is incorrect or incomplete", http.StatusBadRequest)
			return
		}

		notifyNodeService(addDataToRedis(data))
	}
}

func main() {
	http.HandleFunc("/", indexHandler)
	log.Println("Started Server at port 8000")
	http.ListenAndServe(":8000", nil)
}
