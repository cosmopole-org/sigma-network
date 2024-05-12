package modules

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sigma/admin/core/utils"
	"sigma/admin/shell/models"
)

type Security struct {
	gods []models.Admin
}

func (a *Security) SetGodEmails(gods []models.Admin) {
	a.gods = gods
	Instance().Database.ExecuteSqlFile("shell/database/functions/admins/gods.sql")
	var auth = map[string]string{}
	for _, g := range gods {
		var query = `select * from humans_create_gods($1, $2, $3, $4, $5)`
		var t string
		var humanId int64
		token, err := utils.SecureUniqueString(32)
		if err != nil {
			log.Println(err)
			continue
		}
		if err2 := Instance().Database.GetDb().QueryRow(
			context.Background(), query, g.Email, g.FirstName, g.LastName, token, app.AppId,
		).Scan(
			&humanId, &t,
		); err2 != nil {
			log.Println(err2)
			continue
		}
		Instance().Memory.Put("auth::"+t, fmt.Sprintf("human/%d", humanId))
		auth[g.Email] = t
	}
	str, err := json.Marshal(auth)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println(string(str))
	os.MkdirAll(Instance().StorageRoot, os.ModePerm)
	var filePath = fmt.Sprintf("%s/gods.txt", Instance().StorageRoot)
	err2 := os.WriteFile(filePath, str, 0644)
	if err2 != nil {
		log.Println(err2)
	}
}
func (a *Security) IsGodEmail(email string) bool {
	for _, a := range a.gods {
		if a.Email == email {
			return true
		}
	}
	return false
}
func (a *Security) GetGodByEmail(email string) *models.Admin {
	for _, a := range a.gods {
		if a.Email == email {
			return &a
		}
	}
	return nil
}

func CreateSecurity(gods []models.Admin) *Security {
	s := &Security{}
	log.Println("creating security...")
	s.SetGodEmails(gods)
	return s
}
