"use client"
import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import styles from "./SearchBar.module.scss";
import Image from "next/image";
import img from "@/public/Group27319068.svg";

export default function SearchBar({}) {

    const [query, setQuery] = useState("");
    const router = useRouter();
    const inputEl = useRef(null);

    useEffect(function(){

        function callback(e){
            if(e.code.toLowerCase() === "Enter".toLowerCase()){
                if(document.activeElement === inputEl.current) 
                router.push("/gamelist");
                inputEl.current.focus();
            }
        }
        document.addEventListener("keydown", callback); 
        
        return function(){
            document.removeEventListener("keydown", callback); 
        }
    }, [query]);

    function handleOpen(){
        router.push("/gamelist");
    }

    return(
        <div className={styles.bottom_part}>
            <div className={styles.link_section}>
                <p className={styles.fast_link} onClick={handleOpen}>M</p>
                <p className={styles.fast_link} onClick={handleOpen}>C</p>
            </div>
            <div className={styles.SearchBar}>
                <input
                    className={styles.search}
                    //autoFocus  //this can be used for input to be the main focus after page reload
                    ref={inputEl} // to connect the ref to the element
                    type="text"
                    placeholder="Search your game..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Image 
                    //onClick={setGameQuery(query)}
                    quality={100}
                    className={styles.search_img} 
                    src={img} 
                    alt="White Logo Img" 
                /> {/* we can set for the image fill parameter and it will cover all the parent component*/}
                <p className={styles.search_description}>Search for the description and other details here. FInd the board game you are currently interested in and start playing!</p>
            </div>
        </div>
        
        
    );
}
