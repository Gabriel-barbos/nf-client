import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = 'https://nf-software.onrender.com';
const STORAGE_KEY = 'pedidos_edicoes';
const CACHE_KEY = 'pedidos_cache';

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = () => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      setPedidos(JSON.parse(cached));
      setLoading(false);
    } else {
      fetchPedidos();
    }
  };

  const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto
      .toString()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // MELHORADA: Normalização mais robusta
  const normalizarNumero = (valor) => {
    if (!valor && valor !== 0) return '';
    
    // Converte para string e remove TODOS os caracteres não numéricos
    let numero = valor.toString()
      .replace(/\D/g, '')  // Remove tudo que não é dígito
      .trim();
    
    // Remove zeros à esquerda, mas mantém se for só zero
    numero = numero.replace(/^0+/, '') || '0';
    
    // Garante que retorna string vazia se não houver dígitos
    return numero === '0' && valor.toString().replace(/\D/g, '').length === 0 ? '' : numero;
  };

  const verificarNomeSimilar = (nomeA, nomeB) => {
    const a = normalizarTexto(nomeA);
    const b = normalizarTexto(nomeB);
    
    if (!a || !b) return false;
    
    // Verifica se todos os termos de A estão em B
    const termosA = a.split(' ').filter(t => t.length > 2);
    const termosB = b.split(' ').filter(t => t.length > 2);
    
    return termosA.every(termo => 
      termosB.some(termoB => termoB.includes(termo) || termo.includes(termoB))
    );
  };

  const buscarDestinatario = async (pedido) => {
    try {
      // MELHORADO: Normalização mais robusta e logs para debug
      const cpfCnpjPedido = normalizarNumero(pedido.CPF || pedido.CNPJ);
      const cepPedido = normalizarNumero(pedido.CEP);
      
      console.log('🔍 Buscando destinatário:', {
        pedidoId: pedido.ID,
        cpfCnpjOriginal: pedido.CPF || pedido.CNPJ,
        cpfCnpjNormalizado: cpfCnpjPedido,
        cepOriginal: pedido.CEP,
        cepNormalizado: cepPedido,
        nome: pedido.Nome
      });
      
      if (!cpfCnpjPedido || !cepPedido) {
        console.warn('⚠️ CPF/CNPJ ou CEP ausente no pedido');
        return null;
      }

      // Busca todos os destinatários
      const { data: todosDestinatarios } = await axios.get(`${API_URL}/destinatarios`);
      
      // 1ª Validação: CPF/CNPJ + CEP (PRIORIDADE)
      const destinatarioCpfCep = todosDestinatarios.find(dest => {
        const destCpfCnpj = normalizarNumero(dest.cpf || dest.cnpj);
        const destCep = normalizarNumero(dest.cep);
        
        const matchCpf = destCpfCnpj === cpfCnpjPedido;
        const matchCep = destCep === cepPedido;
        
        if (matchCpf && matchCep) {
          console.log('✅ Destinatário encontrado (CPF/CNPJ + CEP):', dest.nome);
        }
        
        return matchCpf && matchCep;
      });
      
      if (destinatarioCpfCep) return destinatarioCpfCep;

      console.log('⚠️ Não encontrado por CPF/CNPJ + CEP, tentando Nome + CEP...');

      // 2ª Validação: Nome + CEP (FALLBACK)
      if (pedido.Nome) {
        const destinatarioNomeCep = todosDestinatarios.find(dest => {
          const destCep = normalizarNumero(dest.cep);
          const matchNome = verificarNomeSimilar(pedido.Nome, dest.nome);
          const matchCep = destCep === cepPedido;
          
          if (matchNome && matchCep) {
            console.log('✅ Destinatário encontrado (Nome + CEP):', dest.nome);
          }
          
          return matchNome && matchCep;
        });
        
        if (destinatarioNomeCep) return destinatarioNomeCep;
      }
      
      console.error('❌ Destinatário não encontrado para o pedido:', pedido.ID);
      
      // Log adicional para debug: mostra alguns destinatários do BD
      console.log('📋 Amostra de destinatários no BD (primeiros 3):');
      todosDestinatarios.slice(0, 3).forEach(dest => {
        console.log({
          nome: dest.nome,
          cpfOriginal: dest.cpf || dest.cnpj,
          cpfNormalizado: normalizarNumero(dest.cpf || dest.cnpj),
          cepOriginal: dest.cep,
          cepNormalizado: normalizarNumero(dest.cep)
        });
      });
      
      return null;
    } catch (err) {
      console.error('❌ Erro ao buscar destinatário:', err);
      return null;
    }
  };

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/zoho/pedidos`);
      
      const pedidosComVerificacao = await Promise.all(
        data.map(async (pedido) => {
          const destinatarioData = await buscarDestinatario(pedido);
          return { 
            ...pedido, 
            temDestinatario: !!destinatarioData,
            destinatarioCompleto: destinatarioData
          };
        })
      );
      
      setPedidos(pedidosComVerificacao);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(pedidosComVerificacao));
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError(err.response?.data?.message || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const atualizarPedidos = () => {
    sessionStorage.removeItem(CACHE_KEY);
    fetchPedidos();
  };

  const buscarUltimaNota = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/nota/historico`);
      if (data.sucesso && data.dados.length > 0) {
        return data.dados[0].numero;
      }
      return 0;
    } catch (err) {
      console.error('Erro ao buscar última nota:', err);
      return 0;
    }
  };

  const salvarEdicao = (pedidoId, campo, valor) => {
    const edicoes = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    if (!edicoes[pedidoId]) edicoes[pedidoId] = {};
    edicoes[pedidoId][campo] = valor;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(edicoes));
  };

  const obterEdicao = (pedidoId) => {
    const edicoes = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    return edicoes[pedidoId] || {};
  };

  const limparEdicoes = (pedidoIds) => {
    const edicoes = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    pedidoIds.forEach(id => delete edicoes[id]);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(edicoes));
  };

  const emitirNotas = async (pedidosIds) => {
    try {
      let ultimaNotaNumero = await buscarUltimaNota();
      const resultados = [];

      for (const pedidoId of pedidosIds) {
        const pedido = pedidos.find(p => p.ID === pedidoId);
        if (!pedido || !pedido.destinatarioCompleto) {
          resultados.push({
            pedidoId,
            sucesso: false,
            erro: 'Destinatário não cadastrado'
          });
          continue;
        }

        const edicoes = obterEdicao(pedidoId);
        const dest = pedido.destinatarioCompleto;
        
        const payload = {
          ultimaNotaNumero: ultimaNotaNumero,
          Cadastro_Cliente: pedido.Cadastro_Cliente,
          Dispositivo: edicoes.Dispositivo || pedido.Dispositivo,
          Quantidade_de_Dispositivos: edicoes.Quantidade_de_Dispositivos || pedido.Quantidade_de_Dispositivos,
          Chicote: pedido.Chicote,
          Acessorios: pedido.Acessorios,
          destinatario: {
            Nome: (dest.nome || '').toUpperCase(),
            CPF: normalizarNumero(dest.cpf),
            CNPJ: normalizarNumero(dest.cnpj),
            IE: (dest.ie || '').toUpperCase(),
            Endereco: (dest.endereco || '').toUpperCase(),
            Numero: dest.numero || '',
            Complemento: (dest.complemento || '').toUpperCase(),
            Bairro: (dest.bairro || '').toUpperCase(),
            Cidade: (dest.cidade || '').toUpperCase(),
            Estado: (dest.estado || '').toUpperCase(),
            CEP: normalizarNumero(dest.cep),
            Telefone: normalizarNumero(dest.telefone || dest.celular)
          }
        };

        try {
          const { data } = await axios.post(`${API_URL}/nota/emitir`, payload);

          if (data.sucesso) {
            resultados.push({
              pedidoId,
              sucesso: true,
              numero: data.dados.numero,
              chave: data.dados.chave,
              protocolo: data.dados.protocolo,
              eventoId: data.dados.eventoId,
              pdf: data.dados.pdf,
              destinatario: data.dados.destinatario
            });
            
            ultimaNotaNumero = data.dados.numero;
          } else {
            resultados.push({
              pedidoId,
              sucesso: false,
              erro: data.mensagem || 'Erro desconhecido'
            });
          }
        } catch (err) {
          resultados.push({
            pedidoId,
            sucesso: false,
            erro: err.response?.data?.erro || err.message || 'Erro ao emitir nota'
          });
        }
      }

      limparEdicoes(pedidosIds);
      return { success: true, resultados };

    } catch (err) {
      console.error('Erro ao emitir notas:', err);
      return {
        success: false,
        error: err.message || 'Erro ao processar emissão'
      };
    }
  };

  return { 
    pedidos, 
    loading, 
    error, 
    emitirNotas,
    atualizarPedidos,
    salvarEdicao,
    obterEdicao
  };
};