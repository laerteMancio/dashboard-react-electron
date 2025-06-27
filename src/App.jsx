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
  const menorDespesa = dadosAgrupados.length > 0 ? Math.min(...dadosAgrupados.map(item => item.valor || 0)) : 0

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

  useEffect(() => {
    if (dataInicio && dataFim) {
      buscarTotal()
    }
  }, [dataInicio, dataFim])

  return (
    <div className="container">
      <div className="header">
        <h1>Gráfico de Despesas</h1>
        <p>Visualização das suas despesas por data e valor</p>
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

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Total de Despesas</h3>
          </div>
          <div className="card-content">
            <div className="stat-value total-expense">{formatarValor(totalDespesas)}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Média por Dia</h3>
          </div>
          <div className="card-content">
            <div className="stat-value average-expense">{formatarValor(mediaDespesas)}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Maior Despesa</h3>
          </div>
          <div className="card-content">
            <div className="stat-value max-expense">{formatarValor(maiorDespesa)}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Menor Despesa</h3>
          </div>
          <div className="card-content">
            <div className="stat-value min-expense">{formatarValor(menorDespesa)}</div>
          </div>
        </div>
      </div>

      {/* Controles de Tipo de Gráfico */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tipo de Gráfico</h3>
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

      {/* Gráfico */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Despesas por Data ({dadosGrafico.length} dias)</h3>
          <p className="card-description">
            {tipoGrafico === 'linha' ? 'Evolução das despesas ao longo do tempo' : 'Comparação das despesas por dia'}
          </p>
        </div>
        <div className="card-content chart-container">
          <ResponsiveContainer width="100%" height="100%">
            {tipoGrafico === 'linha' ? (
              <LineChart data={dadosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
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
  )
}

