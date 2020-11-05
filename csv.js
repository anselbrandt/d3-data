const csvParse = require("d3").csvParse;
const fs = require("fs").promises;

const main = async () => {
  const file = await fs.readFile("giniIndex.csv", "utf-8");
  const parsed = await csvParse(file);
  const dates = parsed.columns.slice(1).map((d) => +d);
  const formatted = parsed
    .map((entry) => {
      const indexed = Object.values(entry).slice(0, dates.length - 1);
      const strings = Object.entries(entry)
        .map((info) => ({
          [info[0]]: info[1],
        }))
        .filter((obj) => !Object.values(obj).includes(""));
      const country = strings.filter((obj) => "country" in obj)[0].country;
      const series = strings
        .filter((obj) => !("country" in obj))
        .map((obj) => {
          return {
            year: +Object.keys(obj)[0],
            value: +Object.values(obj)[0],
          };
        });
      return {
        country: country,
        indexed: indexed,
        series: series,
      };
    })
    .filter((entry) => entry.series.length > 0);
  const values = formatted
    .map((entry) => entry.series.map((year) => year.value))
    .reduce((acc, cur) => acc.concat(cur), []);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const data = {
    y: "Gini index",
    countries: formatted,
    dates: dates,
    max: max,
    min: min,
  };
  const countries = data.countries.map((entry) => entry.country);
  const allCountries = parsed.map((entry) => entry.country);
  console.log(countries);
};

main().catch((error) => console.error(error));
