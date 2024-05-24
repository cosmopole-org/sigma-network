package ipmap

import (
	"log"
	"net"
)

var wellKnownServers = []string{
	"cosmopole.liara.run",
	"monopole.liara.run",
}

func PutWellKnownServers(val []string) {
	wellKnownServers = val
}

func WellKnownServers() []string {
	return wellKnownServers
}

func LoadWellknownServers() {
	IpToHostMap := map[string]string{}
	HostToIpMap := map[string]string{}
	for _, doadmin := range wellKnownServers {
		ipAddr := ""
		ips, _ := net.LookupIP(doadmin)
		for _, ip := range ips {
			if ipv4 := ip.To4(); ipv4 != nil {
				ipAddr = ipv4.String()
				break
			}
		}
		IpToHostMap[ipAddr] = doadmin
		HostToIpMap[doadmin] = ipAddr
	}
	log.Println()
	log.Println(HostToIpMap)
	log.Println()
}

var ipToHostMap = map[string]string{}
var hostToIpMap = map[string]string{}

func PutIpToHostMap(val map[string]string) {
	ipToHostMap = val
}

func IpToHostMap() map[string]string {
	return ipToHostMap
}

func PutHostToIpMap(val map[string]string) {
	hostToIpMap = val
}

func HostToIpMap() map[string]string {
	return hostToIpMap
}
