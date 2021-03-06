import {
  AUTENTICAR_USUARIO,
  DESAUTENTICAR_USUARIO,
  ERRO_NA_AUTENTICACAO,
  VALIDAR_USUARIO_DEPENDENTE,
  LIMPAR_USUARIO_DEPENDENTE,
  ERRO_NA_VALIDACAO_DE_DEPENDENCIA
} from '../actions/autenticacao/tipos';

import {
  CADASTRAR_USUARIO
} from '../actions/usuario/tipos';

const ESTADO_INICIAL = {
  erro: '',
  autenticado: false
};

export default function(state = ESTADO_INICIAL, action) {
  switch (action.type) {
    case CADASTRAR_USUARIO:
    case AUTENTICAR_USUARIO:
      localStorage.setItem('piUser', JSON.stringify(action.payload));
      localStorage.setItem('piToken', action.payload.jwt);
      return {...state, erro: '', autenticado: true };
    case DESAUTENTICAR_USUARIO:
      localStorage.removeItem('piToken');
      localStorage.removeItem('piUser');
      return {...state, erro: '', temDependente: null, listaDeAlunos: null, autenticado: false };
    case ERRO_NA_AUTENTICACAO:
      return {...state, erro: action.payload, temDependente: null, listaDeAlunos: null, autenticado: false };
    case VALIDAR_USUARIO_DEPENDENTE:
      return {...state, erro: '', temDependente: action.payload.temDependente, listaDeAlunos: action.payload.listaDeAlunos };
    case LIMPAR_USUARIO_DEPENDENTE:
      return {...state, erro: '', temDependente: null, listaDeAlunos: null };
    case ERRO_NA_VALIDACAO_DE_DEPENDENCIA:
      return {...state, erro: action.payload, temDependente: null, listaDeAlunos: null };
    default:
      return state;
  }
}
