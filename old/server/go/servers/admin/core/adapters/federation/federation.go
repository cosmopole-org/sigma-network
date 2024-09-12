package federation

import (
	"sigma/admin/core/models"
)

type IFederation interface {
	SendInFederation(destOrg string, packet models.OriginPacket)
}
