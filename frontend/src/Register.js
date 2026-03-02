import { useState } from "react";
import API_URL from "./api";

function Register({ onAuth }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(null);

        try {
            const registerRes = await fetch(`${API_URL}/accounts/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    repeatPassword: repeatPassword,
                }),
            });

            let registerData;
            try {
                registerData = await registerRes.json();
            } catch {
                setError("Nieprawidłowa odpowiedź serwera [registerData]");
                return;
            }
            console.log("REGISTER RESPONSE:", registerRes.status, registerData);

            if (!registerRes.ok) {
                setError(typeof registerData === "string" ? registerData : Object.values(registerData)[0]);
                return;
            }

            const loginRes = await fetch(`${API_URL}/accounts/token/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: email,
                    password,
                }),
            });

            let loginData;
            try {
                loginData = await loginRes.json();
            } catch {
                setError("Nieprawidłowa odpowiedź serwera [loginData]");
                return;
            }
            console.log("LOGIN RESPONSE:", loginRes.status, loginData);

            if (!loginRes.ok) {
                setError(loginData.error || "Błąd logowania po rejestracji");
                return;
            }

            localStorage.setItem("access", loginData.access);
            localStorage.setItem("refresh", loginData.refresh);
            onAuth();

        } catch (err) {
            setError("Błąd połączenia z serwerem")
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <input type="password" placeholder="RepeatPassword" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)}/>
            <button type="submit">Register</button>
            {error && <p style={{color: "red"}}>{error}</p>}
        </form>
    );
}

export default Register;
