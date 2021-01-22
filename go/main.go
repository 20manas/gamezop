package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type User struct {
	FirstName string
	LastName  string
	Age       int
}

func addDataToRedis(user User) {

}

func notifyNodeService() {

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

		addDataToRedis(data)
		log.Println(data.FirstName)
	}
}

func main() {
	http.HandleFunc("/", indexHandler)
	log.Println("Started Server")
	http.ListenAndServe(":8000", nil)
}
