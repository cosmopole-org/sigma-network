package adapters

import models "sigma/sigma/layer1/model"

type IFederation interface {
	SendInFederation(destOrg string, packet models.OriginPacket)
}
