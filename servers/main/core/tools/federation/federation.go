package federation

import (
	"sigma/main/core/models"
)

type IFederation interface {
	SendInFederation(destOrg string, packet models.OriginPacket)
}
