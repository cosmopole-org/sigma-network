package abstract

type Block struct {
	Id        string `json:"id" gorm:"primaryKey;column:id"`
	Index     int64  `json:"index" gorm:"column:index"`
	Prevhash  string `json:"prevhash" gorm:"column:prevhash"`
	Changes   string `json:"changes" gorm:"column:changes"`
	Timestamp int64  `json:"timestamp" gorm:"column:timestamp"`
	Hash      string `json:"hash" gorm:"column:hash"`
}
