"use client"
import styles from "./Main.module.scss";
import Image from "next/image";
import back from "../public/Untitled-1.svg"
import Button from "./_components/Button";
import SearchBar from "./_components/SearchBar/SearchBar";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  function handleNav() {
      router.push('/login');
  }

  return (
    <div className={styles.main_title}>
      
      <h2 className={styles.title}>Have a great time with friends<br/> playing our games</h2>
      <p>FROM BOOKING TO BOARD – YOUR GAME STARTS HERE.</p>
      <Image
        className={styles.main_back_img}
        src={back}
        alt="People playing a board game"
      />
      <Button action={handleNav} name={"button_template1"}>Play now</Button>
      <SearchBar></SearchBar>
    </div>
  );
}


