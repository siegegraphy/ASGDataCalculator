import React, {useEffect, useState} from "react";
import API_URL from "./api";

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [savedCalculators, setSavedCalculators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userToEdit, setUserToEdit] = useState(null);
    const [showUserEditWindow, setShowUserEditWindow] = useState(false);

    const [calculatorToEdit, setCalculatorToEdit] = useState(null);
    const [showCalculatorEditWindow, setShowCalculatorEditWindow] = useState(false);

    const editUser = async () => {
        const token = localStorage.getItem("access");
        if (!userToEdit) return;

        try {
            const res = await fetch(`${API_URL}/accounts/users/${userToEdit.id}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: userToEdit.username,
                    email: userToEdit.email,
                    first_name: userToEdit.first_name,
                    is_staff: userToEdit.is_staff,
                    is_superuser: userToEdit.is_superuser,
                    is_active: userToEdit.is_active,
                }),
            });
            if (!res.ok) throw new Error("Błąd edycji");

            const newUser = await res.json();

            setUsers (prev => prev.map(u => (u.id === newUser.id ? newUser : u)) );

            setUserToEdit(null);
            setShowUserEditWindow(false);
        } catch (err) {
            alert("Błąd edycji: " + err.message);
        }
        
    }

    const editCalculator = async () => {
        const token = localStorage.getItem("access");
        if (!calculatorToEdit) return;

        try {
            const res = await fetch(`${API_URL}/accounts/savedCalculators/${calculatorToEdit.id}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: calculatorToEdit.id,
                    name: calculatorToEdit.name,
                    user: calculatorToEdit.user,
                    created_at: calculatorToEdit.created_at,
                }),
            });
            if (!res.ok) throw new Error("Błąd edycji");

            const newCalculator = await res.json();

            setSavedCalculators (prev => prev.map(c => (c.id === newCalculator.id ? newCalculator : c)) );

            setCalculatorToEdit(null);
            setShowCalculatorEditWindow(false);
        } catch (err) {
            alert("Błąd edycji: " + err.message);
        }
        
    }

    const deleteUser = async (id) => {
        const token = localStorage.getItem("access");
        if (!window.confirm("Czy na pewno?")) return;

        try {
            const res = await fetch(`${API_URL}/accounts/users/${id}/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`,},
            });
            if (!res.ok) throw new Error("Błąd usuwania");

            setUsers (prev => prev.filter(i => i.id !== id));
        } catch (err) {
            alert("Błąd usuwania: " + err.message);
        }
    };

    const deleteCalculator = async (id) => {
        const token = localStorage.getItem("access");
        if (!window.confirm("Czy na pewno?")) return;

        try {
            const res = await fetch(`${API_URL}/accounts/savedCalculators/${id}/`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`,},
            });
            if (!res.ok) throw new Error();

            setSavedCalculators(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            alert("Błąd usuwania: " + err.message);
        }
    };

    const fetchData = async () => {
        const token = localStorage.getItem("access");

        if (!token) {
            setError("Odmowa dostępu");
            setLoading(false);
            return;
        }
            
        try {
            const [usersRes, savedCalculatorsRes] = await Promise.all([
                fetch(`${API_URL}/accounts/users/`, {
                    headers: {Authorization: `Bearer ${token}`, }, }),
                fetch(`${API_URL}/accounts/savedCalculators/`, {
                    headers: {Authorization: `Bearer ${token}`, }, }),
            ]);

            if (!usersRes.ok || !savedCalculatorsRes.ok) {
                throw new Error("Błąd danych");
            }

            const usersData = await usersRes.json();
            const savedCalculatorsData = await savedCalculatorsRes.json();
            
            setUsers(usersData);
            setSavedCalculators(savedCalculatorsData);
            setLoading(false);
            
        } catch (err) {
            console.error("Error:", err);
            setError("Brak dostępu do panelu admina");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{color: "red"}}>Error {error}</p>;

    return (
        <div>
            <h1>Panel Admina</h1>
        
                <h2>Konta</h2>
                {users.length === 0 ? (
                    <p>Brak danych.</p>
                ) : (
                    <table border="1" cellPadding="10" style={{borderCollapse: "collapse", marginBottom: "2rem"}}>
                        <thead>
                        <tr>
                            <th>Nazwa</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Staff</th>
                            <th>Superuser</th>
                            <th>Aktywne</th>
                            <th>Edytuj</th>
                            <th>Usuń</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((r) => (
                            <tr key={r.id}>
                                <td>{r.first_name}</td>
                                <td>{r.username}</td>
                                <td>{r.email}</td>
                                <td>{r.is_staff ? "YES" : "NO"}</td>
                                <td>{r.is_superuser ? "YES" : "NO"}</td>
                                <td>{r.is_active ? "YES" : "NO"}</td>
                                <td><button onClick={() => {setUserToEdit({...r}); setShowUserEditWindow(true);}}>Edytuj</button></td>
                                <td><button onClick={() => deleteUser(r.id)}>Usuń</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
    
                <h2>Zapisane kalkulatory</h2>
                {savedCalculators.length === 0 ? (
                    <p>Brak danych.</p>
                ) : (
                    <table border="1" cellPadding="10" style={{borderCollapse: "collapse", marginBottom: "2rem"}}>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Użytkownik</th>
                            <th>Nazwa</th>
                            <th>Data Utworzenia</th>
                            <th>Edytuj</th>
                            <th>Usuń</th>
                        </tr>
                        </thead>
                        <tbody>
                        {savedCalculators.map((r) => (
                            <tr key={r.id}>
                                <td>{r.id}</td>
                                <td>{r.user_email}</td>
                                <td>{r.name}</td>
                                <td>{r.created_at}</td>
                                <td><button onClick={() => {setCalculatorToEdit({...r}); setShowCalculatorEditWindow(true);}}>Edytuj</button></td>
                                <td><button onClick={() => deleteCalculator(r.id)}>Usuń</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {showUserEditWindow && userToEdit && (
                    <div className="modal-system">
                        <div className="modal-window">
                            <h3>Edycja konta</h3>
                            <div className="modal-content">
                            <label className="modal-content-row modal-user-line">Nazwa: <input type="text" value={userToEdit.first_name || ""} 
                                    onChange={(e) => setUserToEdit({...userToEdit, first_name: e.target.value, })}/></label>
                            <label className="modal-content-row modal-user-line">Email: <input type="text" value={userToEdit.email || ""} 
                                    onChange={(e) => setUserToEdit({...userToEdit, email: e.target.value, username: e.target.value })}/></label>
                            <label className="modal-content-row modal-user-line">Staff: <input type="checkbox" checked={userToEdit.is_staff} 
                                    onChange={(e) => setUserToEdit({...userToEdit, is_staff: e.target.checked, })}/></label>
                            <label className="modal-content-row modal-user-line">Superuser: <input type="checkbox" checked={userToEdit.is_superuser} 
                                    onChange={(e) => setUserToEdit({...userToEdit, is_superuser: e.target.checked, })}/></label>
                            <label className="modal-content-row modal-user-line">Aktywne: <input type="checkbox" checked={userToEdit.is_active} 
                                    onChange={(e) => setUserToEdit({...userToEdit, is_active: e.target.checked, })}/></label>
                            </div>
                            <div>
                                    <button onClick={editUser}>Zapisz</button>
                                    <button onClick={() => {setUserToEdit(null); setShowUserEditWindow(false);}}>X</button>
                            </div>
                        </div>
                    </div>
                )}

                {showCalculatorEditWindow && calculatorToEdit && (
                    <div className="modal-system">
                        <div className="modal-window">
                            <h3>Edycja zapisu kalkulatora</h3>
                            <div className="modal-content">
                            <label className="modal-content-row modal-user-line">Id: <input type="text" value={calculatorToEdit.id || ""}/></label>
                            <label className="modal-content-row modal-user-line">Użytkownik: <input type="text" value={calculatorToEdit.user || ""} 
                                    onChange={(e) => setCalculatorToEdit({...calculatorToEdit, user: e.target.value, })}/></label>
                            <label className="modal-content-row modal-user-line">Nazwa: <input type="text" value={calculatorToEdit.name || ""} 
                                    onChange={(e) => setCalculatorToEdit({...calculatorToEdit, name: e.target.value, })}/></label>
                            <label className="modal-content-row modal-user-line">Data Utworzenia: <input type="text" value={calculatorToEdit.created_at || ""} 
                                    onChange={(e) => setCalculatorToEdit({...calculatorToEdit, created_at: e.target.value, })}/></label>
                            </div>
                            <div>
                                    <button onClick={editCalculator}>Zapisz</button>
                                    <button onClick={() => {setCalculatorToEdit(null); setShowCalculatorEditWindow(false);}}>X</button>
                            </div>
                        </div>
                    </div>
                )}

        </div>
    );
}


export default AdminPanel;            





