package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAddDataToRedis(t *testing.T) {
	defer rdb.FlushAll(ctx)
	user := User{"RandomName", "RandomName", 32}

	key := addDataToRedis(user)
	value := rdb.Get(ctx, key)

	if value == nil {
		t.Errorf("Expected: Get value from key")
	}
	log.Printf(value.String())
}

func TestNotifyNodeService(t *testing.T) {
	defer rdb.FlushAll(ctx)
	pubsub := rdb.Subscribe(ctx, "newUserCreated")
	ch := pubsub.Channel()

	notifyNodeService("user:RandomUniqueId")

	<-ch
	log.Printf("Received Message")
}

func TestIndexHandler(t *testing.T) {
	defer rdb.FlushAll(ctx)
	// Create User and JSON stringify it.
	user := User{"RandomName", "RandomName", 33}

	userString, errJSON := json.Marshal(user)

	if errJSON != nil {
		t.Fatal(errJSON)
	}

	// Create new request and http test recorder.
	req, errHTTP := http.NewRequest("POST", "/", bytes.NewReader(userString))

	if errHTTP != nil {
		t.Fatal(errHTTP)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(indexHandler)

	// Create a subscriber to newUserCreated and get a channel to receive data from it.
	pubsub := rdb.Subscribe(ctx, "newUserCreated")
	ch := pubsub.Channel()

	// Serve the request.
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected: Status Code to be 200")
	}

	// Wait until the message is received.
	message := <-ch
	value := rdb.Get(ctx, message.Payload)

	if value == nil {
		t.Errorf("Expected: Get value from key")
	}

	log.Printf(value.String())
}
