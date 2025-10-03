import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = 'http://localhost:5000';
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

  const buscarDestinatario = async (pedido) => {
    try {
      const cpfCnpj = pedido.CPF || pedido.CNPJ || '';
      const cep = pedido.CEP || '';
      const nome = pedido.Nome || '';
      
      // Busca 1: CPF/CNPJ + CEP
      if (cpfCnpj && cep) {
        const { data } = await axios.get(`${API_URL}/destinatarios`, {
          params: {
            cpfCnpj: cpfCnpj.replace(/\D/g, ''),
            cep: cep.replace(/\D/g, '')
          }
        });
        
        if (data.length > 0) return data[0];
      }
      
      // Busca 2: Nome (fallback)
      if (nome) {
        const { data } = await axios.get(`${API_URL}/destinatarios`, {
          params: { nome }
        });
        
        if (data.length > 0) return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Erro ao buscar destinatário:', err);
      return null;
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
    
    if (!edicoes[pedidoId]) {
      edicoes[pedidoId] = {};
    }
    
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

        const payload = {
          ultimaNotaNumero: ultimaNotaNumero,
          Cadastro_Cliente: pedido.Cadastro_Cliente,
          Dispositivo: edicoes.Dispositivo || pedido.Dispositivo,
          Quantidade_de_Dispositivos: edicoes.Quantidade_de_Dispositivos || pedido.Quantidade_de_Dispositivos,
          Chicote: pedido.Chicote,
          Acessorios: pedido.Acessorios,
          destinatario: {
            Nome: pedido.destinatarioCompleto.nome,
            CPF: pedido.destinatarioCompleto.cpf || '',
            CNPJ: pedido.destinatarioCompleto.cnpj || '',
            IE: pedido.destinatarioCompleto.ie || '',
            Endereco: pedido.destinatarioCompleto.endereco,
            Numero: pedido.destinatarioCompleto.numero,
            Complemento: pedido.destinatarioCompleto.complemento || '',
            Bairro: pedido.destinatarioCompleto.bairro,
            Cidade: pedido.destinatarioCompleto.cidade,
            Estado: pedido.destinatarioCompleto.estado,
            CEP: pedido.destinatarioCompleto.cep,
            Telefone: pedido.destinatarioCompleto.telefone || pedido.destinatarioCompleto.celular || ''
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