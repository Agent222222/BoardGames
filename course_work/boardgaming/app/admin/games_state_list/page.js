"use client"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from "react-redux";
import { getGames, deleteGame } from "../../_lib/gameSlice.js"; 
import styles from "./Games.module.scss";
import Loading from "../../loading.js";
import Button from "@/app/_components/Button.js";
import AddGame from "../_add_game/addGame.js";

export default function Home() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const { user } = useSelector((state) => state.account);
  const { games, isLoading, error } = useSelector((store) => store.game);
  const dispatch = useDispatch();

  useEffect(function(){
    if(user.access === ""){
      router.push("/");
    }
    dispatch(getGames());
  }, [user.access, router, dispatch]);

  function handleGameDelete(id){
    dispatch(deleteGame(user.email, user.userId, id));
  }
  
  if (isLoading) return <Loading />;
  if (error) return <p>Error loading games: {error}</p>;
  
  return (
    <div>{user.access && 
      <div className={styles.container}>
        <div className={user.access === "manager" ? styles.top_container : null}>
          <div>
            <h1 className={styles.Gametitle}>Game List</h1>
            <div className={styles.line}></div>
          </div>
          {user.access === "manager" &&
            <div>
              <Button 
                name={"button_template1"} 
                width={200}
                height={60}
                action={() => setShow(true)}
              >
                Add new game
              </Button>
            </div>
          }
        </div>
        <AddGame user={user} active={show} setActive={setShow}/>
        <ul className={styles.GameList}>
          {games.map((game) => (
            <li key={game.game_id} className={`${styles.game} ${styles.active}`}>
              <h2 className={styles.caption}>{game.game_name}</h2>
              <p className={styles.players}>
                <strong className={styles.desc_cap}>Players:</strong> {game.players}
              </p>
              <p className={styles.players}>
                <strong className={styles.desc_cap}>Goal:</strong> {game.goal}
              </p>
              <div className={styles.status}>
                <strong className={styles.desc_cap}>Status:</strong> <p>{game.status}</p>
              </div>
              <p className={styles.rules}>
                <strong className={styles.desc_cap}>Rules:</strong>{game.rules}
              </p>
              {user.access === "manager" &&
                <Button 
                  name={"button_template2"} 
                  width={200}
                  height={60}
                  action={() => handleGameDelete(game.game_id)}
                >
                  Delete
                </Button>
              }
            </li>
          ))}
        </ul>
      </div>
    }</div>
  );
}
