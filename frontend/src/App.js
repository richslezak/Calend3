import React, { useState, useEffect } from "react";
import "./App.css";
import detectEtheriumProvider from "@metamask/detect-provider";
import Calendar from "./components/Calendar";

function App() {
  const [account, setAccount] = useState(false);

  useEffect(() => {
    isConnected();
  }, []);

  const isConnected = async () => {
    const provider = await detectEtheriumProvider();
    const accounts = await provider.request({
      method: "eth_accounts",
    });

    if (accounts.length > 0) {
      setAccount(accounts[0]);
      console.log("account should now be true", account);
    } else {
      console.log("no authorized account found");
    }
  };

  const connect = async () => {
    try {
      const provider = await detectEtheriumProvider();
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        console.log("account found", accounts);
        setAccount(accounts[0]);
        console.log(account);
      } else {
        console.log("No account found");
        console.log(account);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Calend3</h1>
        <h2 id="slogan">Web3 pay per minute calendar!</h2>
        {!account && <button onClick={connect}>Connect Wallet</button>}
      </header>
      <main className="App-main">
        {account && <Calendar account={account} />}
      </main>
    </div>
  );
}

export default App;
