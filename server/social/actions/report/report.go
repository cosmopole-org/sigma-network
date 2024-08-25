package actions_report

import (
	"sigma/sigma/abstract"
	"sigma/sigma/layer1/module/state"
	"sigma/sigma/utils/crypto"
	inputs_report "sigma/social/inputs/report"
	"sigma/social/model"
	outputs_report "sigma/social/outputs/report"
)

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	state := abstract.UseState[module_state.IStateL1](s)
	return state.Trx().AutoMigrate(&model.Report{})
}

// Report /report/report check [ true false false ] access [ true false false false PUT ]
func (a *Actions) Report(s abstract.IState, input inputs_report.ReportInput) (any, error) {
	state := abstract.UseState[module_state.IStateL1](s)
	report := model.Report{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), ReporterId: state.Info().UserId(), Data: input.Data}
	trx := state.Trx()
	trx.Use()
	err := trx.Create(&report).Error()
	if err != nil {
		return nil, err
	}
	return outputs_report.ReportOutput{Report: report}, nil
}
