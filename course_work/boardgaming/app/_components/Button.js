"use client"
import styles from "../globals.scss";


export default function Button({ children, name, action = ()=> console.log("no action"), width = 165, height=50 }) {
    return (
    <button 
        className={name} 
        onClick={(e) => {
            e.preventDefault();
            action();
        }}
        style={{ width: width ?? 'auto', height: height ?? 'auto' }}  
    >
        {children}
    </button>
    );
}