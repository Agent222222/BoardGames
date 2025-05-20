"use client"
import { useReducer, useState } from "react";
import Button from "../_components/Button";
import styles from "./Prices.scss";

import { useRouter } from 'next/navigation';

const initialState = {
  hours: 0,
  people: 0,
  price: 0,
}

function reducer(state, action){
  switch(action.type){
    case 'setHours':
      return {
        ...state, 
        hours: action.payload,
        price: state.people * action.payload * 5
      };
    case 'setPeople':
      return {
        ...state, 
        people: action.payload,
        price: state.hours * action.payload * 5
      };
    case 'resetHours':
      return {
        ...state, 
        hours: 0,
        price: 0,
      };
    case 'resetPeople':
      return {
        ...state, 
        people: 0,
        price: 0,
      };
    default: 
      throw new Error("Unknown action"); 
  }
}

export default function Home() {
  const [{hours, people, price}, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();
  
  function handleSetHours(value){
    if(value < 5){
      dispatch({type: 'setHours', payload: value});
    }
    
  }

  function handleSetPeople(value){
    if(value < 10){
      dispatch({type: 'setPeople', payload: value});
    }
  }

  function handleMovetoLogin(){
    router.push('/login');
  }
  return (
    <>
      <div className="sections">
        <Section type={"Hours"} value={hours} setValue={handleSetHours} max={5} reset={() => dispatch({type: 'resetHours'})}/>
        <Section type={"People amount"} value={people} setValue={handleSetPeople} max={10} reset={() => dispatch({type: 'resetPeople'})}/>
      </div>
      
      <div className="total_cost">  
        <p className="total_c_desc">Your total cost for an <br/> entire group will be: </p>
        <p className="total_c_amount">{`$${price}`}</p>
        <Button action={handleMovetoLogin} width={200} name={"button_template1"}>Book a table</Button>
        
      </div>
    </>
    
  );
}

function Section({type, value, setValue, max, reset}){
  return(
    <div className="confirmation_bar  cart_section">
          <h2 className="confirmation_bar-caption">{type}</h2>
          <input 
              type="text" 
              id="promo_check" 
              className="name" 
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter the amount"
          />
          <input
              type='range'
              className="name_range" 
              min='0'
              max={max}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          <div className="confirm_bar_cost">
              <p className="confirm_barp_cost _amount">{`${type === "Hours" ? "Each group member will be charged $5.00 for each played hour" : "The price for one member per hour is multiplied by the amount of the group members"}`}</p>
          </div> 
          <div className="main-title-btn_sec">
              <Button action={reset} width={260} name={"button_template2"}>Reset</Button>
          </div>
      </div>
  );
}