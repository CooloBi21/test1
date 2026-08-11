import { useEffect, useRef } from "react";

import {
  createChart,
  CandlestickSeries,
} from "lightweight-charts";

import candleData from "../../data/candleData";

import "./CandleStickChart.css";


function CandleStickChart() {

  const chartContainerRef = useRef(null);


  useEffect(() => {

    const chartContainer =
      chartContainerRef.current;


    const chart = createChart(
      chartContainer,
      {
        width: chartContainer.clientWidth || 800,

        height: 500,

        layout: {
          background: {
            color: "#ffffff",
          },

          textColor: "#333333",
        },

        grid: {
          vertLines: {
            color: "#eeeeee",
          },

          horzLines: {
            color: "#eeeeee",
          },
        },

        timeScale: {
          timeVisible: true,
        },
      }
    );


    const candlestickSeries =
      chart.addSeries(
        CandlestickSeries,
        {
          upColor: "#26a69a",

          downColor: "#ef5350",

          borderUpColor: "#26a69a",

          borderDownColor: "#ef5350",

          wickUpColor: "#26a69a",

          wickDownColor: "#ef5350",
        }
      );


    candlestickSeries.setData(candleData);


    chart.timeScale().fitContent();


    const handleResize = () => {

      chart.applyOptions({
        width:
          chartContainer.clientWidth || 800,
      });

    };


    window.addEventListener(
      "resize",
      handleResize
    );


    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );

      chart.remove();

    };

  }, []);


  return (

    <div className="chart-wrapper">

      <h2>
        Candlestick Chart
      </h2>


      <div
        ref={chartContainerRef}
        className="chart-container"
      />

    </div>

  );
}


export default CandleStickChart;