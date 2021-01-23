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
	Addr:     "redis:6379",
	Password: "",
	DB:       0,
})

// Adds a string to redis with key as "user:<unique_id>" (where <unique_id> is a unique id generated
// using xid) and value as the JSON stringified version of `user`.
// Returns the key.
func addDataToRedis(user User) string {
	userKey := "user:" + xid.New().String()
	userString, err := json.Marshal(user)
	if err != nil {
		panic(err)
	}

	errSet := rdb.Set(ctx, userKey, userString, 0).Err()
	if errSet != nil {
		panic(errSet)
	}

	return userKey
}

// Publish `userKey` as a message on the "newUserCreated" channel on Redis.
func notifyNodeService(userKey string) {
	err := rdb.Publish(ctx, "newUserCreated", userKey).Err()
	if err != nil {
		panic(err)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var data User

		// Try to convert POST body to JSON.
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			http.Error(w, "The JSON format is incorrect", http.StatusBadRequest)
			return
		}

		// Check if all fields required by User are present.
		if len(data.FirstName) == 0 || len(data.LastName) == 0 || data.Age == 0 {
			http.Error(w, "The JSON data is incorrect or incomplete", http.StatusBadRequest)
			return
		}

		notifyNodeService(addDataToRedis(data))
	}
}

func main() {
	http.HandleFunc("/", indexHandler)
	log.Println("Started Server at port 80")
	http.ListenAndServe(":80", nil)
}
