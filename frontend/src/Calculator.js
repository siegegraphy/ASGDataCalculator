import React, {useEffect, useRef, useState} from "react";
import API_URL from "./api";

const g = 9.81;
const Cd = 0.47;
const radius = 0.003;
const A = Math.PI * radius * radius;
const dt = 0.001;
const airDensity = 1.2;
const rpm = 5000 / 100;

const minScale = 1.4;
const maxScale = 100;
const defaultScale = 14;

let nameId = 0;

function CalculatorRow({index, data, onRemove, disableRemove, onDuplicate, moveUp, moveDown}) {
    const [name, setName] = useState(data?.name ?? `Calculator ${nameId + 1}`);
    const [startingHeight, setStartingHeight] = useState(data?.startingHeight ?? 1.5);
    const [angle, setAngle] = useState(data?.angle ?? 0);
    const [fps, setFps] = useState(data?.fps ?? 0);
    const [mps, setMps] = useState(data?.mps ?? 0);
    const [weight, setWeight] = useState(data?.weight ?? 0.2);
    const [toJoule, setToJoule] = useState(data?.toJoule ?? true);
    const [joule, setJoule] = useState(data?.joule ?? 0);
    const [hopUp, setHopUp] = useState(data?.hopUp ?? 0);
    const [range, setRange] = useState(data?.range ?? 0);
    const [showTrajectory, setShowTrajectory] = useState(data?.showTrajectory ?? true);

    const canvasRef = useRef(null);
    const [scale, setScale] = useState(defaultScale);
    const [offset] = useState({x:40, y:150});

    const fpsToMps = (fps) => fps * 0.3048;
    const mpsToFps = (mps) => mps / 0.3048;
    const calculateJoule = (mps, weight) => 0.5 * weight / 1000 * mps * mps;
    const calculateMpsFromJoule = (joule, weight) => Math.sqrt((2*joule) / (weight/1000));

    const calculateTrajectory = React.useCallback(() => {
        if (!mps || !weight) return [];
        let x = 0;
        let y = startingHeight;
        let vx = mps * Math.cos(angle * Math.PI / 180);
        let vy = mps * Math.sin(angle * Math.PI / 180);
        let t = 0;
        const points = [];
        while (y>0 && x<300 && t<10){
            points.push({x,y});
            const v = Math.sqrt(vx * vx + vy * vy);
            if(v < 1e-6) break;
            const Fd = 0.5 * airDensity * Cd * A * v * v;
            const Fm = 0.5 * airDensity * (0.65 * radius * rpm * hopUp / v) * A * v * v;
            const ax = (-Fd * (vx / v) - Fm * (vy / v)) / (weight / 1000);
            const ay = (-Fd * (vy / v) + Fm * (vx / v)) / (weight / 1000) - g;
            vx += ax * dt;
            vy += ay * dt;
            x += vx * dt;
            y += vy * dt;
            t += dt;
        }
        return points;
    }, [mps, weight, angle, startingHeight, hopUp]);

    const drawChart = React.useCallback((points) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, -scale);
        ctx.lineWidth = 2 / scale;
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(900, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 110);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        const stepX = Math.ceil(50 / scale);
        const stepY = Math.ceil(20 / scale);
        for (let x = 0; x <= 1000; x += stepX) {
            const px = offset.x + x * scale;
            if (px > 0 && px < canvas.width) {
                ctx.fillText(String(x), px - 6, offset.y + 15);
                ctx.strokeStyle = "#ddd";
                ctx.beginPath();
                ctx.moveTo(px, 0);
                ctx.lineTo(px, offset.y);
                ctx.stroke();
            }
        }
        for (let y = 0; y <= 100; y += stepY) {
            const py = offset.y - y * scale;
            if (py > 0 && py < canvas.height) {
                ctx.fillText(String(y), offset.x - 16, py + 4);
                ctx.strokeStyle = "#ddd";
                ctx.beginPath();
                ctx.moveTo(offset.x, py);
                ctx.lineTo(canvas.width, py);
                ctx.stroke();
            }
        }
        ctx.fillText("distance [m]", canvas.width - 100, offset.y + 27);
        ctx.save();
        ctx.translate(offset.x - 35, offset.y - 60);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("height [m]", 30, 10);
        ctx.restore();
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, -scale);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.restore();
    }, [scale, offset]);

    useEffect(() => {
        const trajectory = calculateTrajectory();
        setRange(trajectory.length ? trajectory.at(-1).x.toFixed(2) : 0);
        drawChart(trajectory);
    }, [calculateTrajectory, drawChart, showTrajectory]);

    const zooming = (e) => {
        e.preventDefault();
        const zoom = e.deltaY < 0 ? 1.1 : 0.9;
        setScale(s => Math.min(Math.max(s * zoom, minScale), maxScale));
    }

    const handleNameChange = (value) => setName(value);

    const handleStartingHeightChange = (value) => setStartingHeight(value);

    const handleAngleChange = (value) => setAngle(value % 360);

    const handleFpsChange = (value) => {
            setFps(value);
            if (!value) return;
            const mpsValue = fpsToMps(value);
            setMps(mpsValue);
            setJoule(calculateJoule(mpsValue, weight));
    };

    const handleMpsChange = (value) => {
        setMps(value);
        if (!value) return;
        setFps(mpsToFps(value));
        setJoule(calculateJoule(value, weight));
    };

    const handleJouleChange = (value) => {
        setJoule(value);
        if (!value) return;
        const mpsValue = calculateMpsFromJoule(value, weight);
        setMps(mpsValue);
        setFps(mpsToFps(mpsValue));
    };

    const handleWeightChange = (value) => {
        setWeight(value);
        if (toJoule && mps && value) {
            setJoule(calculateJoule(mps, value));
        } else if (!toJoule && joule && value) {
            const mpsValue = calculateMpsFromJoule(joule, value);
            setMps(mpsValue);
            setFps(mpsToFps(mpsValue));
        }
    };

    const handleHopUpChange = (value) => setHopUp(value);

    const saveCalculator = async () => {
        const token = localStorage.getItem("access");
        try {
            const res = await fetch(`${API_URL}/accounts/calculators/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: name,
                    data: {name, startingHeight, angle, fps, mps, weight, toJoule, joule, hopUp, range, showTrajectory},
                }),
            });
            if (!res.ok) {
                console.error("SAVE ERROR:", await res.text());
                alert("Błąd zapisu");
            }
        } catch (err) {
            console.error("NETWORK ERROR:", err);
            alert("Błąd połączenia z serwerem");
        }
    };

    return (
        <div className={index % 2 === 0 ? "calculator-row-light" : "calculator-row-dark"}>
            <div className="calculator-name">
                <input value={name} onChange={(e) => handleNameChange(e.target.value)}/>
                {(localStorage.getItem("access")) && (<button className="button-save" onClick={saveCalculator}>🖫</button>)}
            </div>
            <div className="calculator-values">
                <div className="values-column pair">
                    <label>Height</label>
                    <input placeholder="StartingHeight" type="number" step="1" value={startingHeight}
                           onChange={(e) => handleStartingHeightChange(Number(e.target.value))}/>
                    <label>Angle</label>
                    <input placeholder="Angle" type="number" step="1" value={angle}
                           onChange={(e) => handleAngleChange(Number(e.target.value))}/>
                </div>
                <div className="values-column pair">
                    <label>FPS</label>
                    <input placeholder="FPS" type="number" step="1" value={fps}
                           onChange={(e) => handleFpsChange(Number(e.target.value))}/>
                    <label>MPS</label>
                    <input placeholder="MPS" type="number" step="1" value={mps}
                           onChange={(e) => handleMpsChange(Number(e.target.value))}/>
                </div>
                <div className="values-column pair">
                    <label>Weight (g)</label>
                    <input placeholder="Weight (g)" type="number" step="0.01" value={weight}
                           onChange={(e) => handleWeightChange(Number(e.target.value))}/>
                    {(!toJoule) && (<button onClick={() => setToJoule(true)}>{"FPS/MPS ← (g) J"}</button> )}
                    {(toJoule) && (<button onClick={() => setToJoule(false)}>{"FPS/MPS (g) → J"}</button> )}
                </div>
                <div className="values-column solo">
                    <label>Joule</label>
                    <input placeholder="J" type="number" step="0.01" value={joule}
                           onChange={(e) => handleJouleChange(Number(e.target.value))}/>
                </div>
                <div className="values-column solo">
                    <label>HopUp</label>
                    <input placeholder="HopUp" type="range" step="0.01" value={hopUp}
                           onChange={(e) => handleHopUpChange(Number(e.target.value))}/>
                </div>
                <div className="values-column solo">
                    <label>Range</label>
                    <input placeholder="Range (m)" type="number" value={range} readOnly/>
                </div>
                <div className="buttons">
                    <button className="button-big"
                            onClick={() => setShowTrajectory(!showTrajectory)}>{showTrajectory ? "▼" : "▲"}</button>
                    <button className="button-big" onClick={() => onDuplicate({
                        name, startingHeight, angle, fps, mps, weight, toJoule, joule, hopUp, range, showTrajectory,})}>*</button>
                    <div className="values-column">
                        <button className="button-small" onClick={moveUp}>↑</button>
                        <button className="button-small" onClick={moveDown}>↓</button>
                    </div>
                    <button className="button-big" onClick={onRemove} disabled={disableRemove}>-</button>
                </div>
            </div>

            {(showTrajectory) && (
                <div className="calculator-chart">
                    <canvas
                        ref={canvasRef}
                        width={1100}
                        height={180}
                        className="chart-canvas"
                        onWheel={zooming}
                    />
                </div>
            )}
        </div>
    );
}

export default function Calculator() {
    const [rows, setRows] = useState([{id: Date.now(), data: null}]);
    const addRow = () => { nameId += 1; setRows([...rows, {id: Date.now(), data: null}]); };
    const removeRow = (id) => setRows(rows.filter(r => r.id !== id));
    const duplicateRow = (data) => setRows([...rows, {id: Date.now(), data}]);
    const moveRowUp = (index) => {
        if (index === 0) return;
        const newRows = [...rows];
        [newRows[index - 1], newRows[index]] = [newRows[index], newRows[index - 1]];
        setRows(newRows);
    };
    const moveRowDown = (index) => {
        if (index === rows.length - 1) return;
        const newRows = [...rows];
        [newRows[index], newRows[index + 1]] = [newRows[index + 1], newRows[index]];
        setRows(newRows);
    };

    const [savedCalculatorsList, setSavedCalculatorsList] = useState([]);
    const [showSavedCalculatorsList, setShowSavedCalculatorsList] = useState(false);

    const loadSavedCalculators = async () => {
        const token = localStorage.getItem("access");
        if (!token) return;
        const res = await fetch(`${API_URL}/accounts/calculators/`, {
            headers: {Authorization: `Bearer ${token}`,},});
        const data = await res.json();
        setSavedCalculatorsList(data);
        setShowSavedCalculatorsList(true);
        if (!res.ok) {alert("Nie udało się pobrać zapisów");}
    };

    const addSavedCalculator = (savedCalculator) => {
        setRows([...rows, {id: Date.now(), data: savedCalculator.data }]);
        setShowSavedCalculatorsList(false);
    };

    const deleteSavedCalculator = async (id) => {
        const token = localStorage.getItem("access");
        if (!window.confirm("Usunąć zapisany kalkulator?")) return;
        try {
            const res = await fetch(`${API_URL}/accounts/calculators/${id}/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                alert("Nie udało się usunąć");
                return;
            }
            setSavedCalculatorsList(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert("Błąd połączenia z serwerem");
        }
    };

    return (
        <div className="calculator-site">
            <h1>Kalkulator</h1>
            {rows.map(({id, data}, i) => (
                <CalculatorRow
                    key={id}
                    index={i}
                    data={data}
                    onRemove={() => removeRow(id)}
                    disableRemove={rows.length === 1}
                    onDuplicate={duplicateRow}
                    moveUp={() => moveRowUp(i)}
                    moveDown={() => moveRowDown(i)}
                />
            ))}
            <button onClick={addRow}>+</button>
            {(localStorage.getItem("access")) && (<button onClick={loadSavedCalculators}>⌕</button>)}

            {showSavedCalculatorsList && (
                <div className="modal-system" onClick={() => setShowSavedCalculatorsList(false)}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Zapisane kalkulatory</h3>
                            <button className="modal-header-close" onClick={() => setShowSavedCalculatorsList(false)}>X</button>
                        </div>
                        <div className="modal-content">
                            {savedCalculatorsList.map((s) => (
                                <div className="modal-content-row" key={s.id}>
                                    <button className="modal-content-row-calculator" key={s.id} onClick={() => addSavedCalculator(s)}>{s.name}</button>
                                    <button className="modal-content-row-delete" onClick={() => deleteSavedCalculator(s.id)}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}
