package types

type Service struct {
	App     *App
	Key     string
	Methods map[string]*Method
}

func (s *Service) AddGrpcLoader(fn func()) {
	fn()
}

func (s *Service) AddMethod(method *Method) {
	s.Methods[method.Key] = method
}

func (s *Service) GetMethod(key string) *Method {
	return s.Methods[key]
}

func (s *Service) CallMethod(key string, dto interface{}, meta *Meta) (any, error) {
	var method = s.GetMethod(key)
	return method.Callback(s.App, dto, CreateAssistant(meta.UserId, "human", meta.TowerId, meta.RoomId, 0, nil))
}

type Method struct {
	Key           string
	Callback      func(app *App, dto interface{}, assistant Assistant) (any, error)
	Check         *Check
	InTemplate    any
	MethodOptions *MethodOptions
}

type MethodOptions struct {
	AsEndpoint bool
	AsGrpc     bool
}

type Check struct {
	User  bool
	Tower bool
	Room  bool
}

func CreateService(app *App, key string) *Service {
	return &Service{App: app, Key: key, Methods: map[string]*Method{}}
}

func CreateMethod(key string, callback func(app *App, dto interface{}, assistant Assistant) (any, error), check *Check, dto any, mOptions *MethodOptions) *Method {
	return &Method{Key: key, Callback: callback, Check: check, InTemplate: dto, MethodOptions: mOptions}
}

func CreateCheck(user bool, tower bool, room bool) *Check {
	return &Check{User: user, Tower: tower, Room: room}
}

func CreateMethodOptions(asEndpoint bool, asGrpc bool) *MethodOptions {
	return &MethodOptions{AsEndpoint: asEndpoint, AsGrpc: asGrpc}
}
