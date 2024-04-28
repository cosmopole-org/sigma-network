package security

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sigma/admin/core/core/holder"
	"sigma/admin/core/models"
	"sigma/admin/core/utils"
)

type Security struct {
	gods []models.Admin
}

func (a *Security) SetGodEmails(gods []models.Admin) {
	a.gods = gods
	utils.ExecuteSqlFile("core/database/functions/admins/gods.sql")
	var auth = map[string]string{}
	for _, g := range gods {
		var query = `select * from humans_create_gods($1, $2, $3, $4)`
		var t string
		var humanId int64
		token, err := utils.SecureUniqueString(32)
		if err != nil {
			fmt.Println(err)
			continue
		}
		if err2 := holder.Instance().GetDatabase().GetDb().QueryRow(
			context.Background(), query, g.Email, g.FirstName, g.LastName, token,
		).Scan(
			&humanId, &t,
		); err2 != nil {
			fmt.Println(err2)
			continue
		}
		holder.Instance().GetMemory().Put("auth::"+t, fmt.Sprintf("human/%d", humanId))
		auth[g.Email] = t
	}
	str, err := json.Marshal(auth)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(str))
	os.MkdirAll(holder.Instance().GetStorageRoot(), os.ModePerm)
	var filePath = fmt.Sprintf("%s/gods.txt", holder.Instance().GetStorageRoot())
	err2 := os.WriteFile(filePath, str, 0644)
	if err2 != nil {
		fmt.Println(err2)
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
	fmt.Println("creating security...")
	s.SetGodEmails(gods)
	return s
}
