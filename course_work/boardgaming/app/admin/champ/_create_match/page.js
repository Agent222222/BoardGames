"use client";
import Button from "@/app/_components/Button";
import styles from "./AddMatch.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { getMatches, createMatch } from "@/app/_lib/matchesSlice.js";
import { useEffect, useState } from "react";

const availableTimes = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{9}$/;

export default function AddMatch({handleActiveClick, place}) {

    const [selectedDate, setSelectedDate] = useState();

    const [playerCount, setPlayerCount] = useState(2);
    const [inputError, setInputError] = useState("");
    const [players, setPlayers] = useState([{ name: "", email: "", phone: "" }, { name: "", email: "", phone: "" }]);
    const [winner, setWinner] = useState("");

    const [selectedTime, setSelectedTime] = useState("");
    const game = "Monopoly";

    const { user } = useSelector((state) => state.account);
    const dispatch = useDispatch();

    useEffect(function(){
        setSelectedDate(new Date().toISOString().split("T")[0]);
    }, []);


    const handlePlayerChange = (index, field, value) => {
        const updated = [...players];
        updated[index][field] = value;
        setPlayers(updated);
    };

    const handleDateClick = (date) => setSelectedDate(date);

    const handlePlayerCountChange = (e) => {
        const count = parseInt(e.target.value);
        if (count >= 2 && count <= 12) {
            setPlayerCount(count);
            const updatedPlayers = Array.from({ length: count }, (_, i) => players[i] || { name: "", email: "", phone: "" });
            setPlayers(updatedPlayers);
        }
    };

    const validPlayers = players.filter(
        p => p.name && emailRegex.test(p.email) && phoneRegex.test(p.phone)
    );

    const allEmailsValid = validPlayers.length === playerCount;

    // to create new booking

    function handleCreateMatch(){
        setInputError("");
        const hasInvalidPlayer = players.some((player, index) => {
            if (index !== 0) {
                const hasMissingFields = !player.email || !player.name || !player.phone;
                const isInvalidEmail = !emailRegex.test(player.email || "");
                const isInvalidPhone = !phoneRegex.test(player.phone || "" );
    
            return hasMissingFields || isInvalidEmail || isInvalidPhone;
            }
        });

        if (hasInvalidPlayer) {
            setInputError("Please enter valid name, email, and phone for some players");
            return;
        }
        if(!selectedTime){
            setInputError("Please choose the time");
            return;
        }
        if(!winner){
            setInputError("Please choose the winner of the match");
            return;
        }
        
        dispatch(createMatch(user.email, user.userId, playerCount, players, winner, selectedDate, selectedTime, place));
        dispatch(getMatches());
        handleActiveClick(false);
    }

    return (
        <div className={styles.addM_container}>
            <div className={styles.sub_container}>
                <div className={styles.caption_part}>
                    <h1 className={styles.title}>Create new match</h1>
                    <div className={styles.datePickerContainer}>
                        <label htmlFor="datePicker">Date:</label>
                        <input
                            id="datePicker"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateClick(e.target.value)}
                            className={styles.datePicker}
                        />
                    </div>
                </div>

                <div className={styles.formGroup1}>
                    <p className={styles.cross} onClick={() => handleActiveClick(false)}>&times;</p>
                    <label>Number of players:</label>
                    <input
                        type="number"
                        min="2"
                        max="12"
                        value={playerCount}
                        onChange={handlePlayerCountChange}
                    />
                </div>

                {inputError && <p className={styles.error}>{inputError}</p>}

                <div className={styles.button_part}>
                    {players.map((player, index) => (
                        <div key={index} className={styles.playerForm}>
                            <h3>Player {index + 1}</h3>
                            <input
                                required
                                type="text"
                                placeholder="Name"
                                value={player.name}
                                onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                            />
                            <input
                                required
                                type="email"
                                placeholder="Email"
                                value={player.email}
                                onChange={(e) => handlePlayerChange(index, "email", e.target.value)}
                            />
                            <input
                                required
                                type="tel"
                                placeholder="Phone Number"
                                value={player.phone}
                                onChange={(e) => handlePlayerChange(index, "phone", e.target.value)}
                            />
                        </div>
                    ))}

                    <div className={styles.formGroup}>
                        <label>Select Time:</label>
                        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                            <option value="">-- Select Time --</option>
                            {availableTimes.map((time) => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>

                    {allEmailsValid && (
                        <div className={styles.formGroup}>
                            <label>Select Winner:</label>
                            <select value={winner} onChange={(e) => setWinner(e.target.value)}>
                                <option value="">-- Choose Winner --</option>
                                {players.map((player, i) => (
                                    <option key={i} value={player.email}>{player.name || `Player ${i + 1}`} - {player.email}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className={styles.formGroup2}>
                        <label>Game:</label>
                        <p className={styles.game}>{game}</p>
                    </div>

                    <div className={styles.button_sec}>
                        <p>Please add the new match only after it was held in the club and you already know the winner.</p>
                        <Button
                            name={"button_template1"}
                            width={490}
                            action={handleCreateMatch}
                        >
                            Register Match
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}