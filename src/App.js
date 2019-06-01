
import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from "react-simple-maps";
import {
  Select,
  Button,
  Spin
} from 'antd';
import ReactTooltip from 'react-tooltip';
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
  const [languages, setLanguages] = useState([]);
  const [world, setWorld] = useState([]);

  useEffect(() => {
    fetchLanguages();
    fetchWorld();
  }, [])

  useEffect(() => {
    setTimeout(() => {
      ReactTooltip.rebuild()
    }, 100)
  }, [selectedCountries])

  async function fetchLanguages() {
    const { data } = await axios.get(api_endpoints.languages);
    setLanguages(data);
  }

  async function fetchWorld() {
    const { data } = await axios.get(api_endpoints.world);
    setWorld(data);
  }

  function handleLangChange(value) {
    setSelectedLanguages(value);
  }

  function handleSearch() {
    if (selectedLanguages) {
      const promises = [];
      selectedLanguages.forEach(lang => {
        const promise = new Promise(async (resolve, reject) => {
          try {
            setLoading(true)
            const { data } = await axios.get(`${api_endpoints.lang}/${lang}`);
            const countries = []
            data.forEach(country => {
              countries.push(country['alpha3Code']);
            });
            resolve(countries);
          }
          catch (e) {
            resolve();
            throw e;
          }
        });
        promises.push(promise);
      });

      Promise.all(promises).then(values => {
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
          placeholder="Choose any language"
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

      {loading ? <div style={{ height: 450, display: "flex", justifyContent: "center", alignItems: "center" }}><Spin size="large" /></div>
        : <div style={{ textAlign: "center" }}>
          <ComposableMap>
            <ZoomableGroup disablePanning>
              <Geographies geography={world}>
                {(geographies, projection) =>
                  geographies.map((geography, i) => {
                    return (
                      <Geography
                        key={i}
                        geography={geography}
                        projection={projection}
                        data-tip={geography.properties.name}
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
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
      }
      <ReactTooltip />
    </div>
  );
}

export default App;
