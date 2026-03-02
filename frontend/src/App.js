import React, {useCallback, useEffect, useState} from "react";
import {Routes, Route, Link} from "react-router-dom";
import Weather from "./Weather";
import AdminPanel from "./AdminPanel";
import Calculator from "./Calculator";
import './main.css';
import Login from "./Login";
import Register from "./Register";
import API_URL from "./api";

function App() {

    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access"));
    const [userName, setUserName] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setLoggedIn(false)
        setUserName(null);
        setIsAdmin(false)
    }, []);

    const myName = useCallback(async () => {
        const token = localStorage.getItem("access");

        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/accounts/name/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                logout();
                return;
            }
            const data = await res.json();
            setUserName(data.first_name);
            setIsAdmin(data.is_superuser);
        } catch (err) {
            alert("Błąd pobierania nazwy")
        }
    }, [logout]);

    useEffect(() => {
        if (loggedIn) myName();
    }, [loggedIn, myName]);


  return (
    <div>
      <nav>

        {loggedIn && isAdmin && (<Link to="/adminPanel">Opcje Admina</Link>)}
        <Link to="/weather">Pogoda</Link>
        <Link to="/calculator">Kalkulator</Link>

            <div className="nav-auth">
              {loggedIn ? (
                  <>
                  <span className="nav-status">{userName ? `${userName}` : "Zalogowano"}</span>
                  <button className="button-logout" onClick={logout}>Wyloguj</button>
                  </>
              ) : (
                  <>
                      <Link to="/login">Sign in</Link>
                      <Link to="/register">Sign up</Link>
                  </>
              )}
          </div>

      </nav>
      <Routes>
        {loggedIn && isAdmin && (<Route path="/adminPanel" element={<AdminPanel/>}/>)}
        <Route path="/weather" element={<Weather/>}/>
        <Route path="/calculator" element={<Calculator/>}/>

        {!loggedIn && (
              <>
              <Route
                path="/login"
                element={<Login onAuth={() => {setLoggedIn(true); myName();}} />}
              />
              <Route
                path="/register"
                element={<Register onAuth={() => {setLoggedIn(true); myName()}} />}
              />
              </>
        )}

        <Route path="*" element={<></>} />
      </Routes>
    </div>
  );
}

export default App;
