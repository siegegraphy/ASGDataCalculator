import React, {useEffect, useState, useCallback} from "react";

const cities = {
    Białystok: { lat:53.1333, lon: 23.1643 },
    Bydgoszcz: { lat:53.1235, lon: 18.0076 },
    Gdańsk: { lat:54.3523, lon: 18.6491 },
    Gorzów_Wielkopolski: { lat:52.7368, lon: 15.2288 },
    Katowice: { lat:50.2584, lon: 19.0275 },
    Kielce: { lat:50.8703, lon: 20.6275 },
    Kraków: { lat:50.0614, lon: 19.9366 },
    Lublin: { lat:51.25, lon: 22.5667 },
    Łódź: { lat:51.7706, lon: 19.4739 },
    Olsztyn: { lat:53.7799, lon: 20.4942 },
    Opole: { lat:50.6721, lon: 17.9253 },
    Poznań: { lat:52.4069, lon: 16.9299 },
    Rzeszów: { lat:50.0413, lon: 21.999 },
    Szczecin: { lat:53.4289, lon: 14.553 },
    Toruń: { lat:53.0138, lon: 18.5981 },
    Warszawa: { lat:52.2298, lon: 21.0118 },
    Wrocław: { lat:51.1, lon: 17.0333 },
    Zielona_Góra: { lat:51.9355, lon: 15.5064 },
};    

function Tables() {
    const [selectedCity, setSelectedCity] = useState("Warszawa");
    const [selectedDate, setSelectedDate] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (cityName) => {
        const {lat,lon} = cities[cityName];
        setLoading(true);
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,windspeed_10m,winddirection_10m&forecast_days=7&timezone=Europe/Warsaw`);
            if (!res.ok) throw new Error("Błąd pobierania danych pogody");
            const data = await res.json();
            setWeather(data.hourly);
            const firstDate = data.hourly.time[0].split("T")[0];
            setSelectedDate(firstDate);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData(selectedCity);
    }, [selectedCity, fetchData]);

    if (loading) return <p>Loading...</p>;
    if (!weather) return null;

    const availableDates = [...new Set(weather.time.map(t => t.split("T")[0]))];

    const filteredIndexes = weather.time
        .map((t, i) => t.startsWith(selectedDate) ? i : null)
        .filter(i => i !== null);

    const getWindArrow = (degree) => { 
        const directions = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"];
        const index = Math.round(degree/45)%8;
        return directions[index];
    };
                
    return (
        <div>
            <h2>Pogoda</h2>

            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                {Object.keys(cities).map((city) => (<option key={city} value={city}>{city}</option>))}
            </select>
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                {availableDates.map(date => (<option key={date} value={date}>{date}</option>))}
            </select>
                {loading && <p>Loading...</p>}
                {weather && (
                    <table>
                        <thead>
                            <tr>
                                <th>Godzina</th>
                                <th>Temp (°C)</th>
                                <th>Opady (mm)</th>
                                <th>Wiatr (km/h)</th>
                                <th>Kierunek</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIndexes.map(index => (
                                <tr key={weather.time[index]}>
                                    <td>{weather.time[index].split("T")[1]}</td>
                                    <td>{weather.temperature_2m[index]}</td>
                                    <td>{weather.precipitation[index]}</td>
                                    <td>{weather.windspeed_10m[index]}</td>
                                    <td>{getWindArrow(weather.winddirection_10m[index])}{" "}({weather.winddirection_10m[index]})</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
        </div>
    );
}


export default Tables;



























