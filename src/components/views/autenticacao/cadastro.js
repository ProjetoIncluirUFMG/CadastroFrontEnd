import React, { Component } from 'react';
const  { DOM: { input, select, textarea } } = React
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import PropTypes from 'prop-types';
import moment from 'moment';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

import * as acoesAutenticacao from '../../../actions/autenticacao';
import * as acoesUsuario from '../../../actions/usuario';

import * as validacoes from '../../genericos/formulario/utils/validacoesDeFormulario';
import * as normalizacoes from '../../genericos/formulario/utils/normalizacaoDeFormulario';

import Input from '../../genericos/formulario/Input';
import DropDown from '../../genericos/formulario/DropDown';
import RadioGroup from '../../genericos/formulario/RadioGroup';
import Checkbox from '../../genericos/formulario/Checkbox';
import { default as DatePicker } from '../../genericos/formulario/DatePicker';
import PlaceField from '../../genericos/formulario/PlaceField';
import Captcha from '../../genericos/formulario/Captcha/index';

const selector = formValueSelector('cadastro');

const UFs = [
  "AC","AL","AM","AP","BA","CE","DF",
  "ES","GO","MA","MG","MS","MT","PA",
  "PB","PE","PI","PR","RJ","RN","RO",
  "RR","RS","SC","SE","SP","TO"
];

const Escolaridades = [
  "Fundamental Completo",
	"Fundamental Incompleto",
	"Médio Completo",
	"Médio Incompleto",
	"Superior Completo",
	"Superior Incompleto"
];

class Cadastro extends Component {

	static propTypes = {
		mensagemDeErro: PropTypes.string,
		usuario: PropTypes.object,

		is_cpf_responsavel: PropTypes.bool,
		email: PropTypes.string,

		cadastrarUsuario: PropTypes.func.isRequired,
		buscarUsuario: PropTypes.func.isRequired,

		valid: PropTypes.bool.isRequired,
		handleSubmit: PropTypes.func.isRequired,
		pristine: PropTypes.bool.isRequired,
		submitting: PropTypes.bool.isRequired,
		change: PropTypes.func.isRequired,

		match: PropTypes.object.isRequired,
		location: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired
	}

	constructor() {
		super();
		this.state = {
			mensagemDeErro: null
		};
	}

	prePreencherFormulario(usuario) {
    console.log("usuario: ", usuario);

		if (usuario.email !== null) this.props.change('email', usuario.email);
		if (usuario.nome_aluno !== null) this.props.change('nome_aluno', usuario.nome_aluno);
		// Remover caracteres do RG
		if (usuario.rg !== null) this.props.change('numero_rg', usuario.rg.replace(/\D/g,''));
    // Remover numeros do RG
    if (usuario.rg !== null) this.props.change('uf_rg', usuario.rg.replace(/[^a-zA-Z]+/,''));
		if (usuario.cpf !== null) this.props.change('cpf', normalizacoes.cpf(usuario.cpf));
		if (usuario.is_cpf_responsavel !== null) this.props.change('is_cpf_responsavel', usuario.is_cpf_responsavel === 1 ? true : false);
		if (usuario.is_cpf_responsavel === 1) this.props.change('nome_responsavel', usuario.nome_responsavel);
		if (usuario.telefone !== null) this.props.change('telefone', normalizacoes.telefoneFixo(usuario.telefone));
		if (usuario.celular !== null) this.props.change('celular', normalizacoes.telefoneCelular(usuario.celular));
		if (usuario.sexo !== null) this.props.change('sexo', String(usuario.sexo));
		if (usuario.data_nascimento !== null) this.props.change('data_nascimento', moment(usuario.data_nascimento).format('DD-MM-YYYY'));
		if (usuario.endereco !== null && usuario.numero !== null && usuario.bairro !== null && usuario.cidade !== null && usuario.estado !== null) {
			this.props.change('endereco_google', `${usuario.endereco}, ${usuario.numero} - ${usuario.bairro}, ${usuario.cidade} - ${usuario.estado}`);
		}
		if (usuario.complemento !== null) this.props.change('complemento', usuario.complemento);
		if (usuario.escolaridade !== null) this.props.change('escolaridade', usuario.escolaridade);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.mensagemDeErro !== nextProps.mensagemDeErro) {
			this.setState({
				mensagemDeErro: nextProps.mensagemDeErro
			});
		}

		if (this.props.usuario !== nextProps.usuario &&
			  nextProps.usuario !== null) {
			this.prePreencherFormulario(nextProps.usuario);
		}

		if (this.props.email !== nextProps.email &&
			  validacoes.email(nextProps.email) === undefined) {
			this.props.buscarUsuario(nextProps.email);
		}
	}

  submeterFormulario(formProps) {
		console.log("formProps: ", formProps);

		let googleLocation = null;

		geocodeByAddress(formProps.endereco_google)
      .then(results => {
				googleLocation = results[0];

				if (googleLocation) {
					return getLatLng(googleLocation);
				} else {
					throw new Error();
				}

			})
			.then(location => {
				googleLocation.lat = location.lat;
				googleLocation.lng = location.lng;
        formProps.google_places_json = JSON.stringify(googleLocation);
				this.props.cadastrarUsuario(formProps);

			}).catch(error => {
				this.setState({
					mensagemDeErro: 'Endereço inválido, limpe o campo e preencha novamente!'
				});
			});
  }

	buscarUsuario(email) {
		this.props.buscarUsuario(email);
	}

  mostrarAlertas() {
    if (this.state.mensagemDeErro) {
      return (
				<div>
					<br />
	        <div className="erro pull-left alert alert-danger">
	          <strong>Oops!</strong> {this.state.mensagemDeErro}
	        </div>
				</div>
      );
    }
  }

  render() {

    const { valid, handleSubmit, pristine, submitting } = this.props

    const emProgresso = !valid || pristine || submitting;

    return (
      <div className="cadastro">
        <form onSubmit={handleSubmit(this.submeterFormulario.bind(this))}>
          <Field
						label="Email"
						name="email"
						type="text"
						component={Input}
            validate={[
              validacoes.obrigatorio,
              validacoes.email
            ]}
            style={{width: "100%"}}
					/>

          <Field
						label="Senha"
						name="senha"
						type="password"
						component={Input}
            validate={[
              validacoes.obrigatorio,
              validacoes.valorMinimoDeCaracteres(8),
              validacoes.valorMaximoDeCaracteres(12)
            ]}
            style={{width: "100%"}}
          />

          <Field
						label="Confirmar Senha"
						name="confirmarSenha"
						type="password"
						component={Input}
            validate={[
              validacoes.obrigatorio,
              validacoes.confirmacaoDeSenha.bind(this)
            ]}
            style={{width: "100%"}}
					/>

          <hr className="linha" />

          <Field
						label="Nome"
						name="nome_aluno"
						type="text"
						component={Input}
            validate={[
              validacoes.obrigatorio,
              validacoes.valorMinimoDeCaracteres(4),
              validacoes.valorMaximoDeCaracteres(100)
            ]}
            style={{width: "100%"}}
          />

          <Field
						label="UF"
						name="uf_rg"
						component={DropDown}
            opcoes={UFs}
            validate={validacoes.obrigatorio}
            style={{width: "30%", marginRight: "2%"}}
					/>

          <Field
						label="RG"
						name="numero_rg"
						type="text"
						component={Input}
            validate={validacoes.obrigatorio}
            style={{width: "68%"}}
          />

          <Field
						label="CPF"
						name="cpf"
						type="text"
						component={Input}
            validate={[
              validacoes.obrigatorio,
              validacoes.cpf
            ]}
            style={{width: "100%"}}
            normalize={normalizacoes.cpf}
					/>

          <Field
						label="CPF do Responsável"
            name="is_cpf_responsavel"
            component={Checkbox}
            style={{width: "20%"}}
          />

          {this.props.is_cpf_responsavel ?
          <Field
						label="Nome do Responsável"
            name="nome_responsavel"
						type="text"
            component={Input}
            validate={[
              validacoes.obrigatorio,
              validacoes.valorMinimoDeCaracteres(4),
              validacoes.valorMaximoDeCaracteres(100)
              ]}
            style={{width: "80%"}}
          	/> : <div className="clearfix breakline"/>}

          <Field
						label="Telefone Fixo"
						name="telefone"
						type="text"
						component={Input}
            validate={[
              validacoes.obrigatorio,
              validacoes.telefoneFixo
            ]}
            style={{width: "49%", marginRight: "2%"}}
            normalize={normalizacoes.telefoneFixo}
          />

          <Field
						label="Telefone Celular"
						name="celular"
						type="text"
						component={Input}
            validate={[
              validacoes.obrigatorio,
              validacoes.telefoneCelular
            ]}
            style={{width: "49%"}}
            normalize={normalizacoes.telefoneCelular}
          />

          <Field
						label="Sexo"
						name="sexo"
            component={RadioGroup}
            validate={validacoes.obrigatorio}
						options={[
          		{ title: 'Masculino', value: '0' },
              { title: 'Feminino', value: '1' }
            ]}
            style={{width: "100%"}}
          />

					<Field
						label="Data de Nascimento"
						name="data_nascimento"
            component={DatePicker}
            validate={validacoes.obrigatorio}
						maxDate={moment()}
            style={{width: "100%"}}
          />

					<Field
						label="Endereço"
						name="endereco_google"
						placeholder="Entre seu endereço"
						component={PlaceField}
						validate={validacoes.obrigatorio}
						style={{width: "60%", marginRight: "2%"}}
					/>

					<Field
						label="Complemento"
						name="complemento"
						type="text"
						placeholder="Complemento"
						component={Input}
						validate={validacoes.obrigatorio}
						style={{width: "38%"}}
					/>

					<Field
						label="Escolaridade"
						name="escolaridade"
						component={DropDown}
            opcoes={Escolaridades}
            validate={validacoes.obrigatorio}
            style={{width: "40%"}}
					/>

					<Field
					 	name='captcha'
						component={Captcha}
						apiKey={process.env.GOOGLE_RECAPTCHA_V2_KEY}
						validate={validacoes.obrigatorio}
						style={{width: "100%"}}
					/>

          {this.mostrarAlertas()}

          <div className="clearfix top_space">
            <button type="submit" className={'btn btn-primary ' + (emProgresso ? 'disabled' : '')} disabled={emProgresso}>Cadastrar</button>
          </div>
        </form>
      </div>
    );
  }
}

const CadastroForm = reduxForm({
  form: 'cadastro'  // identificador unico para esse formulario
})(Cadastro)

function mapStateToProps(state) {
  return {
    is_cpf_responsavel: selector(state, 'is_cpf_responsavel'),
		email: selector(state, 'email'),
    mensagemDeErro: state.autenticacao.erro,
		usuario: state.usuario.encontrado
  };
}

const actions = Object.assign({}, acoesUsuario, acoesAutenticacao);

export default connect(mapStateToProps, actions)(CadastroForm);