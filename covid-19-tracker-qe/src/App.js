import React, { useState, useEffect } from "react";
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import LineGraph from "./LineGraph";
import './App.css';
import { sortData, prettyPrintStat } from './util';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then(data => {
      setCountryInfo(data);
    })
  }, [])

  useEffect(() => {
    //async = sends a request, wait for it, do something with it
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,// United States etc
            value: country.countryInfo.iso2, // UK, USA, FR
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = 
      countryCode === "worldwide"
       ? "https://disease.sh/v3/covid-19/all"
       : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.lng]);
      setMapZoom(4);
    });
  };

  return (
    <div className="app">
       <div className="app__left">

     {/* Header */}
      <div className="app__header">
        <h1>COVID-19 TRACKER</h1>
        <FormControl className="app__dropdown">
          {/* Title + Select input dropdown */}
          <Select variant="outlined" onChange={onCountryChange} value={country}>
            {/* Loop tru the countries and show a dropdown list of the country */}
            <MenuItem value="worldwide">Worldwide</MenuItem>
            {countries.map((country) => (
              <MenuItem value={country.value}>{country.name}</MenuItem>
            ))}

          </Select>
        </FormControl>
      </div>

      <div className="app__stats">
         {/* InfoBoxs */}
        <InfoBox
           title="Coronavirus Cases"
           cases={prettyPrintStat(countryInfo.todayCases)}
           total={prettyPrintStat(countryInfo.cases)}
        />
        <InfoBox
           title="Recovered" 
           cases={prettyPrintStat(countryInfo.todayRecovered)} 
           total={prettyPrintStat(countryInfo.recovered)}  
        />
        <InfoBox
           title="Deaths" 
           cases={prettyPrintStat(countryInfo.todayDeaths)} 
           total={prettyPrintStat(countryInfo.deaths)}  
        />
       
      </div>
       
      {/* Map */}
      <Map countries={mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live cases by country</h3>
               {/* Table */}
               <Table countries={tableData} />
               <h3>worldwide new cases</h3>
               {/* Graph */}
               <LineGraph />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
