"use client"
import { useState } from "react";
import Button from "../../_components/Button";
import styles from "./addGame.module.scss";
import { createGame } from "@/app/_lib/gameSlice.js"; 
import { useSelector, useDispatch } from "react-redux";

export default function AddGame({user, active, setActive}) {
    const [gameName, setGameName] = useState("");
    const [players, setPlayers] = useState("");
    const [goal, setGoal] = useState("");
    const [rules, setRules] = useState("");
    const [inputError, setInputError] = useState("");

    const dispatch = useDispatch();

    const { error, isLoading } = useSelector((state) => state.game);

    function handleCreate(){
        setInputError("");
        if(!gameName){
            setInputError("Please enter game name");
            return;
        }
        if(!players){
            setInputError("Please please enter amount of players");
            return;
        }
        if(!goal){
            setInputError("Please fill the goal of the game");
            return;
        }
        if(!rules){
            setInputError("Please fill the rules");
            return;
        }
        dispatch(createGame(user.email, user.userId, gameName, players, goal, rules));
        setActive(false);
    }

    return (
        <>{active ?  
            <div className={styles.authenticate}>
            <form className={styles.section7_login}>
                <h2 className={styles.main_title_caption}>
                    Add new game
                    <p className={styles.cross} onClick={() => setActive(false)}>&times;</p>
                </h2>
                <p className={styles.section7_consultation_description}>Please enter all the inputs to submit this form</p>
                
                <input type="text" className={styles.name} required name="login" placeholder="Game name"  value={gameName} onChange={(e) => setGameName(e.target.value)} /> <br />
                <input type="text" className={styles.name} required placeholder="Players" value={players} onChange={(e) => setPlayers(e.target.value)}/> <br />
                <input type="text" className={styles.name} required placeholder="Goal" value={goal} onChange={(e) => setGoal(e.target.value)}/> <br />
                <input type="text" className={styles.name} required placeholder="Rules" value={rules} onChange={(e) => setRules(e.target.value)}/> <br />
                {(inputError || error) && <h2 className={styles.error}>{error ? error : inputError}</h2>}
                <Button 
                    action={() => handleCreate()} 
                    name={"button_template2"} 
                    width={250}>
                    <p>{isLoading ? "Loading..." : "Submit"}</p>
                </Button>
                
            </form>
        </div>
        : null}</>
    );
}
