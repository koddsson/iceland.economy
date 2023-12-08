const EleventyFetch = require("@11ty/eleventy-fetch");
const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser();

async function fetchInterestRates() {
  const url = new URL("https://www.sedlabanki.is/xmltimeseries/Default.aspx");
  const params = new URLSearchParams();
  params.set("DagsFra", "2015-01-01");
  params.set("DagsTil", "2023-12-01");
  params.set("GroupID", "1");
  params.set("TimeSeriesId", "23");
  params.set("Type", "xml");
  url.search = params.toString();

  const rawData = await EleventyFetch(url.toString(), {
    duration: "1d", // 1 day
    type: "text", // also supports "text" or "buffer"
  });
  const data = parser.parse(rawData);

  const interestRatesData = data.Group?.TimeSeries?.find(
    (series) => series.Name === "Meginvextir",
  ).TimeSeriesData.Entry.reduce((sum, curr) => {
    const lastItem = sum.at(-1);

    // New item! Push that.
    if (!lastItem || lastItem.Value !== curr.Value) {
      sum.push(curr);
    }

    return sum;
  }, []);

  return {
    label: "Stýrivextir",
    fill: false,
    data: interestRatesData.map((d) => {
      const date = new Date(d.Date);
      const datestring =
        ("0" + date.getDate()).slice(-2) +
        "/" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "/" +
        date.getFullYear() +
        " " +
        ("0" + date.getHours()).slice(-2) +
        ":" +
        ("0" + date.getMinutes()).slice(-2);
      return { x: datestring, y: d.Value };
    }),
  };
}

async function fetchInflation() {
  const url = new URL(`https://www.sedlabanki.is/xmltimeseries/Default.aspx`);
  const params = new URLSearchParams();
  params.set("DagsFra", "2015-01-01");
  params.set("DagsTil", "2023-12-01");
  params.set("TimeSeriesId", "2");
  params.set("Type", "xml");

  url.search = params.toString();

  const rawData = await EleventyFetch(url.toString(), {
    duration: "1d", // 1 day
    type: "text", // also supports "text" or "buffer"
  });
  const data = parser.parse(rawData);

  const inflationData = data.Group?.TimeSeries?.TimeSeriesData.Entry.reduce(
    (sum, curr) => {
      const lastItem = sum.at(-1);

      // New item! Push that.
      if (!lastItem || lastItem.Value !== curr.Value) {
        sum.push(curr);
      }

      return sum;
    },
    [],
  );

  return {
    label: "Vísitala neysluverðs",
    fill: false,
    data: inflationData.map((d) => {
      const date = new Date(d.Date);
      const datestring =
        ("0" + date.getDate()).slice(-2) +
        "/" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "/" +
        date.getFullYear() +
        " " +
        ("0" + date.getHours()).slice(-2) +
        ":" +
        ("0" + date.getMinutes()).slice(-2);
      return { x: datestring, y: d.Value };
    }),
  };
}

module.exports = async function () {
  return {
    interestRates: await fetchInterestRates(),
    inflation: await fetchInflation(),
  };
};
