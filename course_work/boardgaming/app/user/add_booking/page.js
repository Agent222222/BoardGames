"use client";
import Button from "@/app/_components/Button";
import styles from "./AddBooking.module.scss";
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from 'next/navigation';
import { getGames } from "@/app/_lib/gameSlice.js"; 
import { createBooking } from "../../_lib/bookingsSlice.js";
import { useEffect, useState } from "react";

const availableTimes = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",];
const bookedGames = ["VR Arena"]; 
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{9}$/;

export default function Home() {
    const searchParams = useSearchParams();
    const date = searchParams.get('date');

    const [playerCount, setPlayerCount] = useState(2);
    const [inputError, setInputError] = useState("");
    const [players, setPlayers] = useState([{ name: "", email: "", phone: "" }, { name: "", email: "", phone: "" }]);
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [selectedGame, setSelectedGame] = useState("");
    const [availableGames, setAvailableGames] = useState([]);

    const { games, isLoading, error } = useSelector((store) => store.game);
    const { bookingError, bookingIsLoading } = useSelector((state) => state.bookings);
    const { user } = useSelector((state) => state.account);
    const dispatch = useDispatch();

    useEffect(() => {
        setInputError("");
        dispatch(getGames());
    }, [dispatch]);

    useEffect(() => {
        if (games && games.length > 0) {
            const gameNames = games.map((game) => game.game_name);
            setAvailableGames(gameNames);
        }
    }, [games]);

    const router = useRouter();
    useEffect(function(){
        if(user.email === ""){
            router.push("/");
        }
    }, [user.email, router]);

    const handlePlayerChange = (index, field, value) => {
        const updated = [...players];
        updated[index][field] = value;
        setPlayers(updated);
    };

    const handlePlayerCountChange = (e) => {
        const count = parseInt(e.target.value);
        if(count > 1 && count < 13){
            setPlayerCount(count);
            const updatedPlayers = Array.from({ length: count }, (_, i) => players[i] || { name: "", email: "", phone: "" });
            setPlayers(updatedPlayers);
        }
    };

    const handlePeriod = (value) => {
        const count = parseInt(value);
        if(count >= 1 && count < 5){
            setSelectedPeriod(count);
        }
    }

    const availableGamesFiltered = availableGames.filter(game => !bookedGames.includes(game));

    // to create new booking

    function handleCreateBooking(){
        setInputError("");
        const hasInvalidPlayer = players.some((player, index) => {
            if (index !== 0) {
                const hasMissingFields = !player.email || !player.name || !player.phone;
                const isInvalidEmail = !emailRegex.test(player.email || "");
                const isNotUserEmail = player.email === user.email;
                const isInvalidPhone = !phoneRegex.test(player.phone || "" );
    
            return hasMissingFields || isInvalidEmail || isInvalidPhone || isNotUserEmail;
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
        if(!selectedPeriod){
            setInputError("Please choose the amount of hours");
            return;
        }
        if(!selectedGame){
            setInputError("Please choose the game you want to play");
            return;
        }
        
        dispatch(createBooking(user.email, user.userId, date, selectedTime, selectedPeriod, selectedGame, players));
        router.push("/user");
    }

    return (
        <div className={styles.addB_container}>
            {user.email && <>
                <div className={styles.caption_part}>
                    <h1 className={styles.title}>Add Booking</h1>
                    <p className={styles.date}>Selected date: {date}</p>
                </div>

                <div className={styles.formGroup1}>
                    <label>Number of players:</label>
                    <input
                        type="number"
                        min="2"
                        max="12"
                        value={playerCount}
                        onChange={handlePlayerCountChange}
                    />
                </div>

                <div className={styles.button_part}>
                    {(bookingError || inputError) && <h2 className={styles.error}>{bookingError? bookingError: inputError}</h2>}
                    {players.map((player, index) => (
                        <div key={index} className={styles.playerForm}>
                            <h3>Player {index + 1}</h3>

                            {index === 0 ? (
                            <p className={styles.youLabel}>You</p>
                            ) : (
                            <>
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
                                aria-describedby="emailHelp"
                                value={player.email}
                                onChange={(e) => handlePlayerChange(index, "email", e.target.value)}
                                />
                                <input
                                required
                                type="tel"
                                placeholder="Phone Number"
                                aria-describedby="Phone"
                                value={player.phone}
                                onChange={(e) => handlePlayerChange(index, "phone", e.target.value)}
                                />
                            </>
                            )}
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

                    <div className={styles.formGroup}>
                        <label>Amount of hours:</label>
                        <input
                            type="number"
                            min="1"
                            max="4"
                            value={selectedPeriod}
                            onChange={(e) => handlePeriod(e.target.value)}
                        /> 
                    </div>

                    <div className={styles.formGroup}>
                        <label>Select Game:</label>
                        <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
                            <option value="">-- Select Game --</option>
                            {availableGamesFiltered.map((game) => (
                                <option key={game} value={game}>{game}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.button_sec}>
                        <p>Please keep in mind that only member of the desired playing group can create the booking. So if you are not the member of the group you want to register, please ask any member to register it, as in case you just add yourself to the group it will increase the cost of booking</p>
                        <Button 
                            name={"button_template1"} 
                            width={490}
                            action={handleCreateBooking}
                        >
                            {bookingIsLoading ? "Loading..." : "Register Booking"}
                            
                        </Button>
                    </div>
                </div>
            </>}
        </div>
    );
}