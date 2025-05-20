"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getGames } from "../_lib/gameSlice.js"; 
import styles from "./GameList.module.scss";
import Loading from "../loading.js";

export default function Home() {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [display, setDisplay] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getGames());
  }, [dispatch]);

  const { games, isLoading, error } = useSelector((store) => store.game);

  const toggleDescription = (id) => {
    if(selectedGameId && selectedGameId === id){
      setSelectedGameId((prevId) => (prevId === id ? null : id));
    }else{
      setSelectedGameId(null)
      setTimeout(() => {
        setSelectedGameId((prevId) => (prevId === id ? null : id));
      }, 400);
    }
    
    setDisplay((prevId) => (prevId === id ? null : id));
  };

  if (isLoading) return <Loading />;
  if (error) return <p>Error loading games: {error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.Gametitle}>Game List</h1>
      <div className={styles.line}></div>
      <ul className={styles.GameList}>
        {games.map((game) => (
          <li key={game.game_id} className={`${styles.game} ${display === game.game_id ? styles.active : ""}`} onClick={() => toggleDescription(game.game_id)}>
            <h2 className={styles.caption}>{game.game_name}</h2>

            {selectedGameId === game.game_id && (
              <>
                <p className={styles.players}>
                  <strong className={styles.desc_cap}>Players:</strong> {game.players}
                </p>
                <p className={styles.rules}>
                  <strong className={styles.desc_cap}>Goal of Game:</strong> {game.goal}
                </p>
                <p className={styles.rules}>
                  <strong className={styles.desc_cap}>Rules:</strong> {game.rules}
                </p>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}