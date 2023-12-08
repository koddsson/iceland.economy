module.exports = function (eleventyConfig) {
  eleventyConfig.addAsyncShortcode("chart", async function (...datasets) {
    const chartData = {
      type: "line",
      data: {
        datasets
      },
      options: {
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                parser: "DD/MM/YYYY HH:mm",
                displayFormats: {
                  day: "DD MMM YYYY",
                },
              },
            },
          ],
        },
      },
    };
    const chartURL = new URL("https://quickchart.io/chart");
    const chartParams = new URLSearchParams(`width=500&height=300`);
    chartParams.set("chart", JSON.stringify(chartData));
    chartParams.set("backgroundColor", "white");
    chartURL.search = chartParams.toString();

    return `<img src="${chartURL.toString()}">`;
  });
};
