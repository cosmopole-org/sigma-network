package federation

import (
	"sigma/storage/core/models"
)

type IFederation interface {
	SendInFederation(destOrg string, packet models.OriginPacket)
}
