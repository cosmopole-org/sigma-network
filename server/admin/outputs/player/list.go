package admin_outputs_player

import admin_model "sigma/admin/model"

type ListOutput struct {
	Players    []admin_model.PlayerMini `json:"players"`
	TotalCount int64                    `json:"totalCount"`
}
