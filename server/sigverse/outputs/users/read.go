package outputs_users

import (
	models "sigma/sigverse/model"
)

type ReadOutput struct {
	Users []models.PublicUser `json:"users"`
}
