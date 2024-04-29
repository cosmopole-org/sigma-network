package outputs

import "sigma/map/core/models"

type Servers struct {
	Map map[string]models.Server `json:"map"`
}
