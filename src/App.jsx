import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'

import moment from 'moment'
import 'moment/locale/pt-br'

import './App.css'

export default function App() {
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [erro, setErro] = useState(null)
  const [dadosAgrupados, setDadosAgrupados] = useState([])
  const [tipoGrafico, setTipoGrafico] = useState('linha')


  //Tanques
  const [data, setData] = useState("")
  const [totalQtd, setTotalQtd] = useState(null);
  const [erroQtd, setErroQtd] = useState(null);

  //Contas
  const [dataConta, setDataConta] = useState("")
  const [contas, setContas] = useState([])
  const [totalContas, setTotalContas] = useState(0)
  const [erroContas, setErroContas] = useState(null);





  const formatarData = (dataString) => {
    return moment(dataString).format('DD/MM')
  }


  const formatarValor = (valor) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor || 0)
    } catch (e) {
      return `R$ ${valor || 0}`
    }
  }

  // Função para gerar todas as datas no período
  const gerarTodasAsDatas = (inicio, fim) => {
    const datas = []
    const dataAtual = new Date(inicio)
    const dataFinal = new Date(fim)

    while (dataAtual <= dataFinal) {
      datas.push(dataAtual.toISOString().slice(0, 10))
      dataAtual.setDate(dataAtual.getDate() + 1)
    }

    return datas
  }

  // Estatísticas calculadas automaticamente com base nos dados
  const totalDespesas = dadosAgrupados.reduce((acc, curr) => acc + (curr.valor || 0), 0)
  const mediaDespesas = dadosAgrupados.length > 0 ? totalDespesas / dadosAgrupados.length : 0
  const maiorDespesa = dadosAgrupados.length > 0 ? Math.max(...dadosAgrupados.map(item => item.valor || 0)) : 0

  const valoresValidos = dadosAgrupados
    .map(item => item.valor)
    .filter(valor => typeof valor === 'number' && valor > 0);

  const menorDespesa = valoresValidos.length > 0 ? Math.min(...valoresValidos) : 0;


  // Dados formatados para o gráfico
  const dadosGrafico = dadosAgrupados.map(item => ({
    dataFormatada: formatarData(item.data),
    valor: item.valor || 0
  }))





  async function buscarTotal() {
    if (!dataInicio || !dataFim) {
      setErro("Por favor, informe as duas datas")
      return
    }

    setErro(null)
    setDadosAgrupados([])

    try {
      const params = new URLSearchParams({ dataInicio, dataFim })
      const res = await fetch(`http://localhost:3001/despesas/total?${params.toString()}`)
      if (!res.ok) throw new Error("Erro ao buscar dados")

      const json = await res.json()


      // Gerar todas as datas do período
      const todasAsDatas = gerarTodasAsDatas(dataInicio, dataFim)

      // Agrupar dados por data
      const agrupado = {}

      // Inicializar todas as datas com valor 0
      todasAsDatas.forEach(data => {
        agrupado[data] = 0
      })

      // Somar valores das despesas por data
      json.forEach(item => {
        const dataFormatada = item.DATA.slice(0, 10)
        if (agrupado.hasOwnProperty(dataFormatada)) {
          agrupado[dataFormatada] += Number(item.VALOR || 0)
        }
      })

      // Converter para array e ordenar por data
      const dados = Object.entries(agrupado)
        .map(([data, valor]) => ({ data, valor }))
        .sort((a, b) => new Date(a.data) - new Date(b.data))

      setDadosAgrupados(dados)
    } catch (e) {
      setErro(e.message)
      // Em caso de erro, usar dados de exemplo
      setDadosAgrupados(dadosExemplo)
    }
  }

  async function buscarTanques() {
    if (!data) {
      setErroQtd("Por favor, informe a data");
      return;
    }

    setErroQtd(null);
    setTotalQtd(null);

    try {
      const params = new URLSearchParams({ data });
      const res = await fetch(`http://localhost:3001/tanques/dia?${params.toString()}`);

      if (!res.ok) {
        const erroApi = await res.json();
        throw new Error(erroApi.mensagem || erroApi.erro || "Erro ao buscar dados");
      }

      const json = await res.json();


      setTotalQtd(json);
    } catch (e) {
      setErroQtd(e.message);
    }
  }

  async function buscarContas() {
    if (!dataConta) {
      setErroContas("Por favor, informe a data");
      return;
    }

    setErroContas(null);
    setTotalContas(null);

    try {
      const params = new URLSearchParams({ dataConta });
      const res = await fetch(`http://localhost:3001/contas/dia?${params.toString()}`);

      if (!res.ok) {
        const erroApi = await res.json();
        throw new Error(erroApi.mensagem || erroApi.erro || "Erro ao buscar dados");
      }

      const json = await res.json();

      console.log(json);

      setContas(json);
    } catch (e) {
      setErroContas(e.message);
    }
  }



  useEffect(() => {
    if (dataInicio && dataFim) {
      buscarTotal()
    }
  }, [dataInicio, dataFim])

  useEffect(() => {
    if (data) {
      buscarTanques()
    }
  }, [data])

  useEffect(() => {
    if (dataConta) {
      buscarContas()
    }
  }, [dataConta])

  return (
    <div className='container-principal'>
      {/* Dados Dashboard*/}


      <div className='container-despesas'>

        {/* Estatísticas despesas */}
        <div className="container-estatisticas">
          <div className="card-header">
            <h3 className="card-title">Estatísticas</h3>
            <p className="card-description">Informe a data para visualizar as despesas</p>
          </div>
          <div className="input-section">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="date-input"
            />
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="date-input"
            />

          </div>
          {erro && <p className="error-message">{erro}</p>}
          <div className="card">
            <div className="card-estatisticas">
              <h3 className="card-title">Total de Despesas</h3>
            </div>
            <div className="card-content">
              <div className="stat-value total-expense">{formatarValor(totalDespesas)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-estatisticas">
              <h3 className="card-title">Média por Dia</h3>
            </div>
            <div className="card-content">
              <div className="stat-value average-expense">{formatarValor(mediaDespesas)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-estatisticas">
              <h3 className="card-title">Maior Despesa</h3>
            </div>
            <div className="card-content">
              <div className="stat-value max-expense">{formatarValor(maiorDespesa)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-estatisticas">
              <h3 className="card-title">Menor Despesa</h3>
            </div>
            <div className="card-content">
              <div className="stat-value min-expense">{formatarValor(menorDespesa)}</div>
            </div>
          </div>
        </div>

        {/* Gráfico despesas */}
        <div className='container-grafico'>

          {/* Gráfico */}
          <div className="tipo-grafico-layout">
            <div className="header-card">
              <div className="card-header">
                <h3>Tipo de Gráfico</h3>
                <p className="card-description">Escolha como visualizar os dados</p>
              </div>
              <div className="card-content">
                <div className="button-group">
                  <button
                    className={`button ${tipoGrafico === 'linha' ? 'active' : ''}`}
                    onClick={() => setTipoGrafico('linha')}
                  >
                    Gráfico de Linha
                  </button>
                  <button
                    className={`button ${tipoGrafico === 'barra' ? 'active' : ''}`}
                    onClick={() => setTipoGrafico('barra')}
                  >
                    Gráfico de Barras
                  </button>
                </div>
              </div>
            </div>
            <h3>Gráfico de Despesas</h3>
            <h4 className="card-title">Despesas por Data ({dadosGrafico.length} dias)</h4>
            <p className="card-description">
              {tipoGrafico === 'linha' ? 'Evolução das despesas ao longo do tempo' : 'Comparação das despesas por dia'}
            </p>
          </div>
          <div className='grafico-layout'>
            <div className='grafico-layout' style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {tipoGrafico === 'linha' ? (
                  <LineChart data={dadosGrafico} margin={{ top: 5, right: 30, left: 20, }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis
                      dataKey="dataFormatada"
                      tick={{ fontSize: 10, fill: '#555', angle: -45, textAnchor: 'end' }}
                      interval={0}
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#555' }}
                      tickFormatter={(v) => `R$ ${v}`}
                    />
                    <Tooltip
                      formatter={(v) => [formatarValor(v), 'Valor']}
                      labelFormatter={(l) => `Data: ${l}`}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: '#8884d8', strokeWidth: 1, r: 2 }}
                      activeDot={{ r: 4, stroke: '#8884d8', strokeWidth: 2 }}
                      name="Valor da Despesa"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={dadosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis
                      dataKey="dataFormatada"
                      tick={{ fontSize: 10, fill: '#555', angle: -45, textAnchor: 'end' }}
                      interval={0}
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#555' }}
                      tickFormatter={(v) => `R$ ${v}`}
                    />
                    <Tooltip
                      formatter={(v) => [formatarValor(v), 'Valor']}
                      labelFormatter={(l) => `Data: ${l}`}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="valor"
                      fill="#82ca9d"
                      name="Valor da Despesa"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      <div className="container-tanques">
        <div className="header">
          <h1>Dados Tanques</h1>
          <p>Visualização dos tanques por dia</p>
        </div>

        <div className="input-section">
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="date-input-tanques"
          />
        </div>

        {erroQtd && <p className="error-message">{erroQtd}</p>}

        <div className="input-section tanques-grid">
          {totalQtd?.length > 0 ? (
            totalQtd.map((item, index) => (
              <div key={index} className="card-tanques">
                <div className="card-header">
                  <h3 className="card-title">Tanque {item.tanque ?? item.TANQUE}</h3>
                </div>
                <div className="card-content">
                  <div className="stat-value">{(item.quantidade ?? item.QUANTIDADE)} L</div>
                </div>
              </div>
            ))
          ) : (
            <p className="info-message">Nenhum dado carregado</p>
          )}
        </div>
      </div>

      {/* Contas a pagar */}
      <div className="container-contas-a-pagar">
        <div className="header">
          <h1>Contas a pagar por vencimento</h1>
          <p>Visualização por data de vencimento</p>
        </div>

        <div className="input-section">
          <input
            type="date"
            value={dataConta}
            onChange={(e) => setDataConta(e.target.value)}
            className="date-input-contas"
          />
        </div>

        {erroContas && <p className="error-message">{erroContas}</p>}

        <div className="lista-contas-grid">
          {contas?.length > 0 ? (
            contas.map((conta, index) => (
              <div className="card-conta">
                <ul className="item-lista">
                  <li>
                    <span className="card-title">📅 Título:</span>
                    <span className="card-description">{conta.COD_TITULO}</span>
                  </li>
                  <li>
                    <span className="card-title">Valor:</span>
                    <span className="card-description">R$ {parseFloat(conta.VALOR).toFixed(2)}</span>
                  </li>
                  <li>
                    <span className="card-title">Descrição:</span>
                    <span className="card-description">{conta.DESCRICAO}</span>
                  </li>
                </ul>
              </div>

            ))
          ) : (
            <p className="info-message">Nenhuma conta encontrada</p>
          )}
        </div>
      </div>




    </div>

  )
}

