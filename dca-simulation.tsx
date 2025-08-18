"use client"

import { useState, useEffect } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, DollarSign, Calculator, Percent, PieChart } from "lucide-react"

const defaultConfig = {
  initialCapital: 12000000,
  initialPrice: 10000,
  monthlyChange: 1000,
}

function makeSimulationData(config: typeof defaultConfig) {
  const { initialCapital, initialPrice, monthlyChange } = config
  const monthlyInvestment = initialCapital / 12
  const months = 24

  // 주가 데이터 생성
  const stockPrices: number[] = []
  let currentPrice = initialPrice
  for (let i = 0; i < 5; i++) { stockPrices.push(currentPrice); currentPrice -= monthlyChange }
  for (let i = 0; i < 19; i++) { stockPrices.push(currentPrice); currentPrice += monthlyChange }

  // 일시불 투자
  const lumpSumInitialShares = stockPrices[0] > 0 ? initialCapital / stockPrices[0] : 0
  const lumpSumSharesHistory = Array(months).fill(lumpSumInitialShares)
  const lumpSumValues = stockPrices.map(price => price * lumpSumInitialShares)
  const lumpSumReturnRates = lumpSumValues.map(value => initialCapital > 0 ? ((value / initialCapital) - 1) * 100 : 0)
  const lumpSumMinValueFirstYear = Math.min(...lumpSumValues.slice(0, 12))
  const lumpSumMinReturn = initialCapital > 0 ? ((lumpSumMinValueFirstYear / initialCapital) - 1) * 100 : 0

  // 분할 매수
  const dcaSharesHistory: number[] = [], dcaValues: number[] = [], dcaReturnRates: number[] = []
  let dcaCumulativeShares = 0, dcaCumulativeInvested = 0, dcaMinReturn = 0
  for (let i = 0; i < months; i++) {
    if (i < 12) {
      dcaCumulativeShares += stockPrices[i] > 0 ? monthlyInvestment / stockPrices[i] : 0
      dcaCumulativeInvested += monthlyInvestment
    }
    dcaSharesHistory.push(dcaCumulativeShares)
    const currentValue = dcaCumulativeShares * stockPrices[i]
    dcaValues.push(currentValue)
    const currentReturnRate = dcaCumulativeInvested > 0 ? ((currentValue / dcaCumulativeInvested) - 1) * 100 : 0
    dcaReturnRates.push(currentReturnRate)
    if (i < 12 && currentReturnRate < dcaMinReturn) dcaMinReturn = currentReturnRate
  }

  // 그래프용 데이터
  const chartData = Array.from({ length: months }, (_, i) => ({
    month: `${i + 1}개월`,
    stockPrice: stockPrices[i],
    lumpSumShares: lumpSumSharesHistory[i],
    dcaShares: dcaSharesHistory[i],
    lumpSumReturn: lumpSumReturnRates[i],
    dcaReturn: dcaReturnRates[i],
    lumpSumValue: lumpSumValues[i],
    dcaValue: dcaValues[i],
  }))

  return {
    chartData,
    lumpSum: {
      shares: lumpSumInitialShares,
      minReturn: lumpSumMinReturn,
      finalValue: lumpSumValues[months - 1],
    },
    dca: {
      shares: dcaSharesHistory[11],
      minReturn: dcaMinReturn,
      finalValue: dcaValues[months - 1],
    },
  }
}

export function InvestmentDCA() {
  const [config, setConfig] = useState(defaultConfig)
  const [result, setResult] = useState(() => makeSimulationData(defaultConfig))

  useEffect(() => {
    setResult(makeSimulationData(config))
  }, [config])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfig({ ...config, [e.target.name]: Number(e.target.value) })
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("ko-KR", { style: "currency", currency: "KRW" })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(Math.round(num))
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">📈 분할 매수 중요성 시뮬레이션</h1>
          <p className="text-lg text-gray-600">분할 매수와 일시불 투자의 차이를 직접 비교해보세요!</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 입력 패널 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  시뮬레이션 조건
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="initialCapital" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    총 투자금 (원)
                  </Label>
                  <Input
                    id="initialCapital"
                    name="initialCapital"
                    type="text"
                    value={formatNumber(config.initialCapital)}
                    onChange={handleInputChange}
                    step={1000000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialPrice" className="flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    초기 주가 (원)
                  </Label>
                  <Input
                    id="initialPrice"
                    name="initialPrice"
                    type="text"
                    value={formatNumber(config.initialPrice)}
                    onChange={handleInputChange}
                    step={1000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyChange" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    월별 변동액 (원)
                  </Label>
                  <Input
                    id="monthlyChange"
                    name="monthlyChange"
                    type="text"
                    value={formatNumber(config.monthlyChange)}
                    onChange={handleInputChange}
                    step={100}
                  />
                </div>
                <Button onClick={() => setResult(makeSimulationData(config))} className="w-full" size="lg">
                  <Calculator className="w-4 h-4 mr-2" />
                  시뮬레이션 실행
                </Button>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 시뮬레이션 가이드</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>총 투자금</strong>: 12개월간 분할 투자 또는 일시불 투자</li>
                    <li>• <strong>월별 변동액</strong>: 주가의 월별 변동폭</li>
                    <li>• <strong>그래프</strong>: 월별 주가, 보유 주식, 수익률, 자산가치 순서로 표시</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* 결과 패널 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">12개월 후 일시불 보유 주식</p>
                      <p className="text-2xl font-bold text-gray-900">{result.lumpSum.shares.toFixed(2)} 주</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">12개월 후 분할매수 보유 주식</p>
                      <p className="text-2xl font-bold text-blue-600">{result.dca.shares.toFixed(2)} 주</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">12개월 내 일시불 최저 수익률</p>
                      <p className="text-2xl font-bold text-green-600">{result.lumpSum.minReturn.toFixed(2)} %</p>
                    </div>
                    <Percent className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">12개월 내 분할매수 최저 수익률</p>
                      <p className="text-2xl font-bold text-green-600">{result.dca.minReturn.toFixed(2)} %</p>
                    </div>
                    <Percent className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">24개월 후 일시불 자산</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.lumpSum.finalValue)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">24개월 후 분할매수 자산</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.dca.finalValue)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* 그래프 4개 */}
            <Card>
              <CardHeader>
                <CardTitle>월별 주가 변화</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="stockPrice" name="주가" stroke="#2ecc71" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>보유 주식 수 변화</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="lumpSumShares" name="일시불" stroke="#e74c3c" dot={false} />
                      <Line type="monotone" dataKey="dcaShares" name="분할매수" stroke="#3498db" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>수익률 변화</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="lumpSumReturn" name="일시불" stroke="#e74c3c" dot={false} />
                      <Line type="monotone" dataKey="dcaReturn" name="분할매수" stroke="#3498db" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>자산 가치 변화</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="lumpSumValue" name="일시불" stroke="#e74c3c" dot={false} />
                      <Line type="monotone" dataKey="dcaValue" name="분할매수" stroke="#3498db" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* 설명 카드 */}
            <Card className="bg-gradient-to-r from-blue-500 to-green-400 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">💡 분할 매수의 장점</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>시장 변동성에 대응하여 리스크를 분산할 수 있습니다.</li>
                  <li>심리적 부담을 줄이고, 꾸준한 투자 습관을 기를 수 있습니다.</li>
                  <li>장기적으로 평균 매입 단가를 낮출 수 있습니다.</li>
                </ul>
                <p className="text-lg text-center mt-4 opacity-90 font-bold">
                  분할 매수는 변동성이 큰 시장에서 더욱 빛을 발합니다!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}