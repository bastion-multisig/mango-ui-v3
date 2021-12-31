import { FunctionComponent, useMemo, useState } from 'react'
import { EyeOffIcon } from '@heroicons/react/outline'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { Disclosure } from '@headlessui/react'
import dayjs from 'dayjs'
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import useDimensions from 'react-cool-dimensions'
import { IconButton } from './Button'
import { TradeIcon } from './icons'

interface SwapTokenInfoProps {
  inputTokenId?: string
  inputTokenSymbol?: string
  outputTokenId?: string
}

const SwapTokenInfo: FunctionComponent<SwapTokenInfoProps> = ({
  inputTokenId,
  inputTokenSymbol,
  outputTokenId,
}) => {
  const [chartData, setChartData] = useState([])
  const [hideChart, setHideChart] = useState(false)
  const [outputTokenInfo, setOutputTokenInfo] = useState(null)
  const [mouseData, setMouseData] = useState<string | null>(null)
  //   const [daysToShow, setDaysToShow] = useState(1)
  const { observe, width, height } = useDimensions()

  const handleMouseMove = (coords) => {
    if (coords.activePayload) {
      setMouseData(coords.activePayload[0].payload)
    }
  }

  const handleMouseLeave = () => {
    setMouseData(null)
  }

  // Use ohlc data. Don't think it works

  //   const getChartData = async () => {
  //     const inputResponse = await fetch(
  //       `https://api.coingecko.com/api/v3/coins/${inputTokenId}/ohlc?vs_currency=usd&days=${daysToShow}`
  //     )
  //     const outputResponse = await fetch(
  //       `https://api.coingecko.com/api/v3/coins/${outputTokenId}/ohlc?vs_currency=usd&days=${daysToShow}`
  //     )
  //     const inputData = await inputResponse.json()
  //     const outputData = await outputResponse.json()

  //     const data = inputData.concat(outputData)

  //     const formattedData = data.reduce((a, c) => {
  //       const found = a.find((price) => price.time === c[0])
  //       if (found) {
  //         found.price = found.inputPrice / c[2]
  //       } else {
  //         a.push({ time: c[0], inputPrice: c[2] })
  //       }
  //       return a
  //     }, [])
  //     setChartData(formattedData.filter((d) => d.price))
  //   }

  const getChartData = async () => {
    const now = Date.now() / 1000
    const inputResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/${inputTokenId}/market_chart/range?vs_currency=usd&from=${
        now - 1 * 86400
      }&to=${now}`
    )

    const outputResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/${outputTokenId}/market_chart/range?vs_currency=usd&from=${
        now - 1 * 86400
      }&to=${now}`
    )
    const inputData = await inputResponse.json()
    const outputData = await outputResponse.json()

    const data = inputData?.prices.concat(outputData?.prices)

    const formattedData = data.reduce((a, c) => {
      const found = a.find(
        (price) => c[0] >= price.time - 120000 && c[0] <= price.time + 120000
      )
      if (found) {
        found.price = found.inputPrice / c[1]
      } else {
        a.push({ time: c[0], inputPrice: c[1] })
      }
      return a
    }, [])
    setChartData(formattedData.filter((d) => d.price))
  }

  const getOutputTokenInfo = async () => {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${outputTokenId}?localization=false&tickers=false&developer_data=false&sparkline=false
      `
    )
    const data = await response.json()
    setOutputTokenInfo(data)
  }

  useMemo(() => {
    if (inputTokenId && outputTokenId) {
      getChartData()
    }
  }, [
    //   daysToShow,
    inputTokenId,
    outputTokenId,
  ])

  useMemo(() => {
    if (outputTokenId) {
      getOutputTokenInfo()
    }
  }, [outputTokenId])

  console.log(outputTokenInfo)

  const chartChange = chartData.length
    ? ((chartData[chartData.length - 1]['price'] - chartData[0]['price']) /
        chartData[0]['price']) *
      100
    : 0

  return (
    <div>
      {chartData.length ? (
        <div className="p-4">
          <div className="flex justify-between">
            <div>
              {inputTokenSymbol && outputTokenInfo ? (
                <div className="text-th-fgd-3 text-sm">{`${inputTokenSymbol.toUpperCase()}/${outputTokenInfo.symbol.toUpperCase()}`}</div>
              ) : null}
              {mouseData ? (
                <>
                  <div className="font-bold text-lg text-th-fgd-1">
                    {mouseData['price'].toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6,
                    })}
                    <span
                      className={`ml-2 text-sm ${
                        chartChange >= 0 ? 'text-th-green' : 'text-th-red'
                      }`}
                    >
                      {chartChange.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs font-normal text-th-fgd-4">
                    {dayjs(mouseData['time']).format('DD MMM YY, h:mma')}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold text-lg text-th-fgd-1">
                    {chartData[chartData.length - 1]['price'].toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 6,
                      }
                    )}
                    <span
                      className={`ml-2 text-sm ${
                        chartChange >= 0 ? 'text-th-green' : 'text-th-red'
                      }`}
                    >
                      {chartChange.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs font-normal text-th-fgd-4">
                    {dayjs(chartData[chartData.length - 1]['time']).format(
                      'DD MMM YY, h:mma'
                    )}
                  </div>
                </>
              )}
            </div>
            <IconButton onClick={() => setHideChart(!hideChart)}>
              {hideChart ? (
                <TradeIcon className="w-4 h-4" />
              ) : (
                <EyeOffIcon className="w-4 h-4" />
              )}
            </IconButton>
            {/* <div className="flex h-5">
              <button
                className={`default-transition font-bold mx-3 text-th-fgd-1 text-xs hover:text-th-primary focus:outline-none ${
                  daysToShow === 1 && 'text-th-primary'
                }`}
                onClick={() => setDaysToShow(1)}
              >
                24H
              </button>
              <button
                className={`default-transition font-bold mx-3 text-th-fgd-1 text-xs hover:text-th-primary focus:outline-none ${
                  daysToShow === 7 && 'text-th-primary'
                }`}
                onClick={() => setDaysToShow(7)}
              >
                7D
              </button>
              <button
                className={`default-transition font-bold ml-3 text-th-fgd-1 text-xs hover:text-th-primary focus:outline-none ${
                  daysToShow === 30 && 'text-th-primary'
                }`}
                onClick={() => setDaysToShow(30)}
              >
                30D
              </button>
            </div> */}
          </div>
          {!hideChart ? (
            <div className="h-52 mt-4 w-full" ref={observe}>
              <AreaChart
                width={width}
                height={height}
                data={chartData}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <Tooltip
                  cursor={{
                    strokeOpacity: 0,
                  }}
                  content={<></>}
                />
                <defs>
                  <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF9C24" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#FF9C24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  isAnimationActive={true}
                  type="monotone"
                  dataKey="price"
                  stroke="#FF9C24"
                  fill="url(#gradientArea)"
                />
                <XAxis dataKey="time" hide />
                <YAxis
                  dataKey="price"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  hide
                />
              </AreaChart>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="bg-th-bkg-3 mx-4 p-4 rounded-md text-center text-th-fgd-3">
          Chart not available
        </div>
      )}

      {outputTokenInfo ? (
        <div className="px-4 w-full">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button
                  className={`bg-th-bkg-2 border border-th-bkg-4 default-transition flex items-center justify-between mt-4 p-4 rounded-md w-full hover:bg-th-bkg-3 ${
                    open
                      ? 'border-b-transparent rounded-b-none'
                      : 'transform rotate-360'
                  }`}
                >
                  <h2 className="font-bold text-base text-th-fgd-1">
                    About {outputTokenInfo.name}
                  </h2>
                  <ChevronDownIcon
                    className={`default-transition h-6 w-6 text-th-fgd-3 ${
                      open ? 'transform rotate-180' : 'transform rotate-360'
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel>
                  <div className="border border-th-bkg-4 border-t-0 grid grid-flow-col grid-rows-2 px-3 py-6 rounded-b-md">
                    {outputTokenInfo.market_cap_rank ? (
                      <div className="border border-th-bkg-4 m-1 p-3 rounded-md">
                        <div className="text-th-fgd-4 text-xs">
                          Market Cap Rank
                        </div>
                        <div className="font-bold text-th-fgd-1 text-lg">
                          #{outputTokenInfo.market_cap_rank}
                        </div>
                      </div>
                    ) : null}
                    {outputTokenInfo.market_data?.market_cap ? (
                      <div className="border border-th-bkg-4 m-1 p-3 rounded-md">
                        <div className="text-th-fgd-4 text-xs">Market Cap</div>
                        <div className="font-bold text-th-fgd-1 text-lg">
                          $
                          {outputTokenInfo.market_data?.market_cap?.usd.toLocaleString()}
                        </div>
                      </div>
                    ) : null}
                    {outputTokenInfo.market_cap_rank ? (
                      <div className="border border-th-bkg-4 m-1 p-3 rounded-md">
                        <div className="text-th-fgd-4 text-xs">
                          Market Cap Rank
                        </div>
                        <div className="font-bold text-th-fgd-1 text-lg">
                          #{outputTokenInfo.market_cap_rank}
                        </div>
                      </div>
                    ) : null}
                    {outputTokenInfo.market_data?.market_cap ? (
                      <div className="border border-th-bkg-4 m-1 p-3 rounded-md">
                        <div className="text-th-fgd-4 text-xs">Market Cap</div>
                        <div className="font-bold text-th-fgd-1 text-lg">
                          $
                          {outputTokenInfo.market_data?.market_cap?.usd.toLocaleString()}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
      ) : null}
    </div>
  )
}

export default SwapTokenInfo
