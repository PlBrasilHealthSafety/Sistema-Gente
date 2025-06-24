// Exemplo de teste das validações - Execute no console do navegador
// Para testar as validações implementadas nos pontos focais

console.log('=== TESTE DAS VALIDAÇÕES DE TELEFONE E EMAIL ===');

// Função de validação de telefone (copiada do componente)
function validarTelefone(telefone) {
  if (!telefone.trim()) return null; // Campo opcional
  
  const numeroLimpo = telefone.replace(/\D/g, '');
  
  if (numeroLimpo.length < 10) {
    return 'Telefone deve ter pelo menos 10 dígitos';
  }
  
  if (numeroLimpo.length > 11) {
    return 'Telefone deve ter no máximo 11 dígitos';
  }
  
  if (numeroLimpo.length === 11) {
    const codigoArea = numeroLimpo.substring(0, 2);
    const primeiroDigitoCelular = numeroLimpo.substring(2, 3);
    
    const codigosAreaValidos = [
      '11', '12', '13', '14', '15', '16', '17', '18', '19',
      '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38',
      '41', '42', '43', '44', '45', '46', '47', '48', '49',
      '51', '53', '54', '55', '61', '62', '64', '63', '65', '66', '67', '68', '69',
      '71', '73', '74', '75', '77', '79', '81', '87', '82', '83', '84', '85', '88',
      '86', '89', '91', '93', '94', '92', '97', '95', '96', '98', '99'
    ];
    
    if (!codigosAreaValidos.includes(codigoArea)) {
      return 'Código de área inválido';
    }
    
    if (primeiroDigitoCelular !== '9') {
      return 'Celular deve começar com 9 após o código de área';
    }
  }
  
  return null;
}

// Função de validação de email (copiada do componente)
function validarEmail(email) {
  if (!email.trim()) return null; // Campo opcional
  
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!regexEmail.test(email)) {
    return 'Email deve ter um formato válido (exemplo@dominio.com)';
  }
  
  if (email.length > 254) {
    return 'Email muito longo (máximo 254 caracteres)';
  }
  
  const partes = email.split('@');
  if (partes[0].length > 64) {
    return 'Parte local do email muito longa (máximo 64 caracteres)';
  }
  
  return null;
}

// Casos de teste para telefone
console.log('\n📞 TESTES DE TELEFONE:');
const telefonesTeste = [
  '11999999999',      // ✅ Celular válido
  '1199999999',       // ✅ Telefone fixo válido
  '(11) 99999-9999',  // ✅ Com formatação
  '11899999999',      // ❌ Celular sem 9
  '99999999999',      // ❌ Código de área inválido
  '119999999',        // ❌ Muito curto
  '119999999999',     // ❌ Muito longo
  '',                 // ✅ Vazio (opcional)
];

telefonesTeste.forEach(tel => {
  const erro = validarTelefone(tel);
  console.log(`${tel || '(vazio)'}: ${erro ? `❌ ${erro}` : '✅ Válido'}`);
});

// Casos de teste para email
console.log('\n📧 TESTES DE EMAIL:');
const emailsTeste = [
  'usuario@empresa.com.br',          // ✅ Válido
  'nome.sobrenome@dominio.com',      // ✅ Válido
  'teste@sub.dominio.org',           // ✅ Válido
  'usuarioempresa.com',              // ❌ Sem @
  '@empresa.com',                    // ❌ Sem usuário
  'usuario@',                        // ❌ Sem domínio
  'usuario@empresa',                 // ❌ Sem .extensão
  'usuario com espaço@empresa.com',  // ❌ Com espaço
  '',                                // ✅ Vazio (opcional)
];

emailsTeste.forEach(email => {
  const erro = validarEmail(email);
  console.log(`${email || '(vazio)'}: ${erro ? `❌ ${erro}` : '✅ Válido'}`);
});

console.log('\n🎉 Teste das validações concluído!');
console.log('💡 Para usar no sistema:');
console.log('1. Acesse a página de Grupos');
console.log('2. Crie ou edite um grupo');
console.log('3. Adicione pontos focais com telefone/email inválidos');
console.log('4. Veja as mensagens de erro em tempo real'); 