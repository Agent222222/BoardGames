"use client"
import { useEffect, useState } from "react";
import Button from "../_components/Button";
import styles from "./Login.scss";

import { useSelector, useDispatch } from "react-redux";
import { Register, Login, setError } from "../_lib/accountSlice"; 
import { useRouter } from "next/navigation";

export default function Page() {
  const [sign, setSign] = useState("Register");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const { user, error, isLoading } = useSelector((state) => state.account);

  function handleAuthenticate(e){
    if(!checked){
      dispatch(setError("You have not confirmed the agreement"));
    }else{
      if(sign === "Register"){
        dispatch(Register({ email, name, phone: parseInt(phone), password }));
      }else{
        dispatch(Login({ email, password }));
      }
    }
    
  }

  useEffect(() => {
    if (user && user.email) {
      router.push("/user");
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.email) {
      router.push("/user");
    }
  }, []);

  return (
    <div >
      <select value={sign} onChange={(e) => setSign(e.target.value)}>
        <option value="Register">Register new account</option>
        <option value="Sign in">Sign in to an existing account</option>
      </select>
      <form id="sect7-log" className="section7-login">
          <h2 className="section7-consultation main-title-caption">{sign === "Register"? sign : sign + " to"} account</h2>
          <p className="section7-consultation-description">Leave your contact details in order to book a table to play any boardgames from our list</p>
          
          {sign === "Register" && <><input type="text" id="FromName" className="name _req" required name="login" placeholder="Name" aria-describedby="Name" value={name} onChange={(e) => setName(e.target.value)} /> <br /></>}
          <input type="email" id="FromMail" className="name _req" required aria-describedby="emailHelp"placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}/> <br />
          {sign === "Register" && <><input type="phone" id="FromPhone" className="name _req" aria-describedby="Phone"placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}/> <br /></>}
          <input type="password" id="FromPassword" className="name _req" required aria-describedby="Password"placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/> <br />
          {sign === "Register" &&<div className="section7-checkbox-label2">All new passwords must contain at least 8 characters.
          We also suggest having at least one capital and one lower-case letter (Aa-Zz), one special symbol (#, &, % etc), and one number (0-9) in your password for the best strength. <p className="strong">Please make sure to login after the registration.</p></div>}
          {error && <h2 className="error">{error}</h2>}
          <div className="check_box_sec">
              <input id="cons_check" type="checkbox" required value={checked} onClick={() => setChecked((checked) => !checked)} className="section7-checkbox"/>
              <p className="section7-checkbox-label">I accept the terms of the user agreement for the processing of personal data</p>
              <Button action={handleAuthenticate} name={"button_template2"}>
              <p>{isLoading ? "Loading..." : sign}</p>
              </Button>
          </div>
          
      </form>
    </div>
    
  );
}
