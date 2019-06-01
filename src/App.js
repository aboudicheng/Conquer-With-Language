
import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from "react-simple-maps";
import {
  Select,
  Button
} from 'antd';
import ReactTooltip from 'react-tooltip';
import languages from './language_codes.json';
import world from './world-50m.json';
import axios from 'axios';
import * as api_endpoints from './constants/api_endpoints';

const { Option } = Select;

const wrapperStyles = {
  width: "100%",
  maxWidth: 1280,
  margin: "0 auto",
  fontFamily: "Roboto, sans-serif",
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
}

function App() {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoverCountry, setHoverCountry] = useState("");

  useEffect(() => {
    console.log(selectedCountries)
  }, [selectedCountries])

  useEffect(() => {
    setTimeout(() => {
      ReactTooltip.rebuild()
    }, 100)
  }, [])

  function handleMove(geography, evt) {
    const x = evt.clientX
    const y = evt.clientY + window.pageYOffset
    setHoverCountry(geography.properties.name);
    console.log(geography.properties.name)
  }
  function handleLeave() {
    setHoverCountry("");
  }

  function handleLangChange(value) {
    setSelectedLanguages(value);
  }

  function handleSearch() {
    if (selectedLanguages) {
      const promises = [];
      selectedLanguages.forEach(lang => {
        const promise = new Promise(async (resolve, reject) => {
          setLoading(true)
          const { data } = await axios.get(`${api_endpoints.lang}/${lang}`);
          const countries = []
          data.forEach(country => {
            countries.push(country['alpha3Code']);
          });
          resolve(countries);
        });
        promises.push(promise);
      });

      Promise.all(promises).then(values => {
        console.log(values)
        setSelectedCountries(values.flat())
        setLoading(false);
      })
    }
  }

  return (
    <div style={wrapperStyles}>
      <div style={{ textAlign: "center", margin: "25px 15px" }}>
        <Select
          mode="multiple"
          placeholder="Choose a language"
          style={{ width: 400, marginRight: 15 }}
          onChange={handleLangChange}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {languages.map((lang, i) =>
            <Option value={lang["alpha2"]} key={`${lang["alpha2"]}-${i}`}>{lang["English"]}</Option>
          )}
        </Select>
        <Button type="primary" onClick={handleSearch}>Go</Button>
      </div>
      <div style={{ textAlign: "center" }}>
        {!loading &&
          <ComposableMap>
            <ZoomableGroup disablePanning>
              <Geographies geography={world}>
                {(geographies, projection) => {
                  return geographies.map((geography, i) => {
                    return (
                      <Geography
                        key={i}
                        geography={geography}
                        projection={projection}
                        onMouseMove={handleMove}
                        onMouseLeave={handleLeave}
                        data-tip={geography.properties.name}
                        //data-tip={hoverCountry}
                        //data-for={'countryTooltip'}
                        style={{
                          default: {
                            fill: selectedCountries.includes(geography.id) ? "#00c42a" : "#ECEFF1",
                            stroke: "#607D8B",
                            strokeWidth: 0.75,
                            outline: "none",
                          },
                          hover: {
                            fill: selectedCountries.includes(geography.id) ? "#00c42a" : "#ECEFF1",
                            stroke: "#607D8B",
                            strokeWidth: 0.75,
                            outline: "none",
                          },
                          pressed: {
                            fill: selectedCountries.includes(geography.id) ? "#00c42a" : "#ECEFF1",
                            stroke: "#607D8B",
                            strokeWidth: 0.75,
                            outline: "none",
                          },
                        }}
                      />
                    )
                  })
                }
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        }
      </div>
      <ReactTooltip />
    </div>
  );
}

export default App;
