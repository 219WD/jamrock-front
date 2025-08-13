import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import "./css/PedidosChart.css";

const PedidosChart = ({ pedidos }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  console.log("createChart:", createChart);

  const processData = () => {
    if (!Array.isArray(pedidos)) {
      console.error("Pedidos no es un arreglo válido:", pedidos);
      return [];
    }

    const dailyData = {};
    pedidos.forEach((pedido) => {
      const date = new Date(pedido.createdAt);
      const formattedDate = date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
      dailyData[formattedDate] = (dailyData[formattedDate] || 0) + pedido.totalAmount;
    });

    return Object.entries(dailyData)
      .map(([time, value]) => ({
        time,
        value,
      }))
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    if (typeof createChart !== "function") {
      console.error("Lightweight Charts no está disponible");
      return;
    }

    const container = chartContainerRef.current;
    if (!container) {
      console.error("Contenedor del gráfico no encontrado");
      return;
    }

    try {
      const chart = createChart(container, {
        layout: {
          background: { color: "transparent" },
          textColor: "#D9D9D9",
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: "rgba(255, 255, 255, 0.1)" },
        },
        width: container.clientWidth,
        height: 200,
        localization: {
          dateFormat: "dd/MM/yyyy",
        },
      });

      console.log("Chart object:", chart);
      console.log("Chart methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(chart)));

      if (typeof chart.addAreaSeries !== "function") {
        console.error("addAreaSeries no está disponible. Usando addLineSeries...");
        const lineSeries = chart.addLineSeries({
          color: "rgba(31, 123, 0, 1)",
          lineWidth: 2,
        });
        if (pedidos?.length > 0) {
          const chartData = processData();
          lineSeries.setData(chartData);
          chart.timeScale().fitContent();
        }
      } else {
        const areaSeries = chart.addAreaSeries({
          topColor: "rgba(31, 123, 0, 0.4)",
          bottomColor: "rgba(31, 123, 0, 0)",
          lineColor: "rgba(31, 123, 0, 1)",
          lineWidth: 2,
          priceFormat: {
            type: "custom",
            formatter: (price) => `$${price.toFixed(2)}`,
          },
        });
        if (pedidos?.length > 0) {
          const chartData = processData();
          areaSeries.setData(chartData);
          chart.timeScale().fitContent();
        }
      }

      chartRef.current = chart;
    } catch (error) {
      console.error("Error al inicializar el gráfico:", error);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !pedidos?.length) return;

    try {
      const series = chartRef.current.series()[0]; // Corregido de getSeries a series
      if (series) {
        const chartData = processData();
        series.setData(chartData);
        chartRef.current.timeScale().fitContent();
      }
    } catch (error) {
      console.error("Error al actualizar datos:", error);
    }
  }, [pedidos]);

  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="chart-wrapper">
        <div className="chart-placeholder">
          No hay datos suficientes para mostrar el gráfico
        </div>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h3>TOTAL DE PEDIDOS</h3>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#1f7b00" }}></span>
            <span>Monto total diario</span>
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="chart-container" />
      <div className="chart-footer">
        <span>Desliza para zoom • Doble click para reset</span>
      </div>
    </div>
  );
};

export default PedidosChart;