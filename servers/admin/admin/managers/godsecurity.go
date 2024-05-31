package godsecurity

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	adminModels "sigma/admin/admin/models"
	coreModels "sigma/admin/core/models"
	"sigma/admin/core/runtime"
	"sigma/admin/core/utils"
)

type Security struct {
	app  *runtime.App
	gods []*adminModels.God
}

func (a *Security) SetGodEmails(gods []*adminModels.God) {
	a.gods = gods
	a.app.Managers.DatabaseManager().Db.AutoMigrate(&adminModels.God{})
	var auth = map[string]string{}
	for _, g := range gods {
		god := adminModels.God{}
		err := a.app.Managers.DatabaseManager().Db.Where("username = ?", g.Username).First(&god).Error
		token := ""
		userId := ""
		password := ""
		username := ""
		if err != nil {
			tx := a.app.Managers.DatabaseManager().Db.Begin()
			g.Username += ("@" + a.app.AppId)
			user := coreModels.User{Id: utils.SecureUniqueId(a.app.AppId), Type: "human", Username: g.Username, Name: g.Name, Avatar: "empty", Secret: utils.SecureUniqueString()}
			tx.Create(&user)
			g.Id = utils.SecureUniqueId(a.app.AppId)
			g.UserId = user.Id
			g.Password = user.Secret
			tx.Create(&g)
			session := coreModels.Session{Id: utils.SecureUniqueId(a.app.AppId), UserId: user.Id, Token: utils.SecureUniqueString()}
			tx.Create(&session)
			tx.Commit()
			userId = user.Id
			username = user.Username
			password = user.Secret
			token = session.Token
		} else {
			user := coreModels.User{}
			a.app.Managers.DatabaseManager().Db.Where("username = ?", god.Username).First(&user)
			session := coreModels.Session{}
			a.app.Managers.DatabaseManager().Db.Where("user_id = ?", user.Id).First(&session)
			userId = user.Id
			username = user.Username
			password = god.Password
			token = session.Token
		}
		a.app.Managers.MemoryManager().Put("auth::"+token, fmt.Sprintf("human/%s", userId))
		auth[username] = password
	}
	str, err := json.Marshal(auth)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println(string(str))
	os.MkdirAll(a.app.StorageRoot, os.ModePerm)
	var filePath = fmt.Sprintf("%s/gods.txt", a.app.StorageRoot)
	err2 := os.WriteFile(filePath, str, 0644)
	if err2 != nil {
		log.Println(err2)
	}
}
func (a *Security) IsGodUsername(userId string) bool {
	for _, a := range a.gods {
		if a.UserId == userId {
			return true
		}
	}
	return false
}
func (a *Security) GetGodByUsername(username string) *adminModels.God {
	for _, a := range a.gods {
		if a.Username == username {
			return a
		}
	}
	return nil
}

func CreateSecurity(sc *runtime.App, gods []*adminModels.God) *Security {
	s := &Security{app: sc}
	log.Println("creating security...")
	s.SetGodEmails(gods)
	return s
}
