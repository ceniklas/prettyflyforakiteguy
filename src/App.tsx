import 'font-awesome/css/font-awesome.min.css'
import * as React from 'react'
import './App.css'

import logo from './logo.svg'

class App extends React.Component<{}, { windDirection: any, windSpeed: any, gust: any, kiteFlyingIsAGo: boolean }> {
  constructor(props:any){
    super(props)
    
    this.fetchWeatherData()
    setInterval(this.fetchWeatherData, 60 * 1000)

    this.state = {
      gust: null,
      kiteFlyingIsAGo: false,
      windDirection: null,
      windSpeed: null,
    }
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">FLYGA DRAKE IDAG?</h1>
        </header>
        {this.renderContent()}
        {this.renderFooter()}
      </div>
    )
  }

  private fetchWeatherData = () => {
    fetch('https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/16/lat/58/data.json')
    .then(response => {
      return response.json()
    })
    .then(myJson => {
      const wd = myJson.timeSeries[1].parameters[13]
      const ws = myJson.timeSeries[1].parameters[14]
      const gust = myJson.timeSeries[1].parameters[17]

      this.setState({ windDirection: wd, windSpeed: ws, gust })

      const kiteVal = this.calcKiteFly(wd, ws);
      if(kiteVal.wdOptimal && kiteVal.wsOptimal) {
        this.setState({ kiteFlyingIsAGo: true })
      }
    })
  }

  private renderFooter = () => {
    return (
      <div className={this.state.kiteFlyingIsAGo ? "App-footer Footer-background-green" : "App-footer Footer-background-red"}>
        <p>
          {this.isItKiteFlyingWeather()}
        </p>
      </div>
    )
  }

  private renderContent = () => {
    if(this.state.windDirection && this.state.windSpeed) {
      return (
        <div className="Content-wrapper">
          <img src={logo} className="App-logo" alt="logo" />
          <br/>
          <div className="App-content">
            {[
              { icon: <i className="fa fa-compass" />, text: " Vindriktning: " + this.state.windDirection.values[0] + "°" + " (330° - 90°)" },
              { icon: <i className="fa fa-compass" />, text: " Vindstyrka: " + this.state.windSpeed.values[0] + " " + this.state.windSpeed.unit + " (2.7m/s - 6.7m/s)" },
              { icon: <i className="fa fa-compass" />, text: " Vindbyar: " + this.state.gust.values[0] + " " + this.state.gust.unit }
            ]
            .map((item, idx) => (
              <p key={idx}>
                {item.icon}
                {item.text}
              </p>
            ))}
          </div>
        </div>
      )
    }
    else {
      return (
        <p className="App-content">
          Loading...
        </p>
      )
    }
  }

  private calcKiteFly = (wd: any, ws: any) => {
    return { wdOptimal: wd.values[0] < 90 || wd.values[0] > 330, wsOptimal: ws.values[0] > 2.7 ? true : false }
  }

  private isItKiteFlyingWeather = () => {
    // 58.589104, 16.180615 Vår position
    // 2.7 - 6.7 m/s Optimal vindstyrka för drakflygning
    // 330-90 grader för att slippa arbetets museum fuckup 
    const wd = this.state.windDirection
    const ws = this.state.windSpeed
    
    if(!wd || !ws) {
      return null
    }

    const kiteVal = this.calcKiteFly(wd, ws);
    
    if(kiteVal.wdOptimal && kiteVal.wsOptimal) {
      return "Till oändligheten och vidare!"
    }
    else if (!kiteVal.wdOptimal && kiteVal.wsOptimal) {
      return "Det blåser ju, men åt fel håll..."
    }
    else if (kiteVal.wdOptimal && !kiteVal.wsOptimal) {
      return "Om det ändå hade blåst mer..."
    }
    else {
      return "Ingen drakflygning idag tyvärr..."
    }
  }
}

export default App