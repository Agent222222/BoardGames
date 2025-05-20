"use client"
import Button from "@/app/_components/Button";
import styles from "./Account.scss";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import { setError, updateUser } from "@/app/_lib/accountSlice"; 


export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(0);
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);

  const { user, isLoading, error } = useSelector((state) => state.account);
  useEffect(function(){
    if(user.email === ""){
      router.push("/");
    }
  }, [user.email, router]);

  useEffect(() => {
    if (user) {
      dispatch(setError(""));
      setName(user.name || "");
      setPhone(user.phone || "");
      setPassword(user.password || "");
    }
  }, [user]);

  function handleClick() {
    dispatch(setError(""));

    if (!checked) {
      return dispatch(setError("You have not confirmed the agreement"));
    }
    if (!name.trim()) {
      return dispatch(setError("Please enter your new name"));
    }
    const phoneRegex = /^[0-9]{9}$/; 
    if (!phoneRegex.test(phone)) {
      return dispatch(setError("Please enter a valid phone number(9 digits)"));
    }
    if (!password.trim()) {
      return dispatch(setError("Please type the password"));
    }

    dispatch(updateUser(name, phone, password));
  }

  return (
    <>
      {user.email && 
        <form id="sect7-log" className="section7-login">
          <h2 className="section7-consultation main-title-caption">Your account details </h2>
          <p className="section7-consultation-description">Please take into account that user email cannot be changed. You can only change your full name, your phone number or your account password.</p>
          
          <p className="email">{user.email}</p>
          <input type="text" className="name _req" required name="login" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /> <br />
          <input type="phone" className="name _req" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}/> <br />
          <input type="text" className="name _req" required aria-describedby="Password"placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/> <br />
          {error && <h2 className="error">{error}</h2>}
          <div className="check_box_sec">
              <input id="cons_check" type="checkbox" required value={checked} onClick={() => setChecked((checked) => !checked)} className="section7-checkbox"/>
              <p className="section7-checkbox-label">I accept the terms of the user agreement for the processing of personal data</p>
              <Button action={handleClick} name={"button_template2"}>
              <p>{isLoading ? "Loading..." : "Submit"}</p>
              </Button>
          </div>
          
      </form>
      }
    </>
    
  );
}
