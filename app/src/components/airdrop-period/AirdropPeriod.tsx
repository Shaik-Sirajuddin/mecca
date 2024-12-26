import './style.css'

const AirdropPeriod = () => {
  return (
    <div className="airdrop-period-container">
    <div className='airdrop-period-box'>
        <div className="airdrop-period-inner">
            <div className="airdrop-period-head">
            <h2 className='airdrop-period-title'>Remaining Airdrop Period</h2>
            <div className="timer-wrap">
                <div className="timer-box">
                    <div className="timer-digits">
                        <h3 className="timer-digit">00</h3>
                        <h3 className="timer-day">day</h3>
                    </div>
                    <div className="timer-colon">:</div>
                    <div className="timer-digits">
                        <h3 className="timer-digit">00</h3>
                        <h3 className="timer-day">hours</h3>
                    </div>
                    <div className="timer-colon">:</div>
                    <div className="timer-digits">
                        <h3 className="timer-digit">00</h3>
                        <h3 className="timer-day">min</h3>
                    </div>
                    <div className="timer-colon">:</div>
                    <div className="timer-digits">
                        <h3 className="timer-digit">00</h3>
                        <h3 className="timer-day">sec</h3>
                    </div>
                </div>
            </div>
            </div>
            <div className="airdrop-period-body">  
                <div className="airdrop-period-textbox">
                <h3> Receive MECCA airdrop</h3>
                <p>You must have 0.001SOL in your wallet on the Solana mainnet.
                MECCA tokens can be airdropped every 24 hours.</p>
                </div>

                <form id='airdrop-form' className='w-100'>
                    <div className="airdrop-form-wrap">
                    <div className="airdrop-form-row">
                    <div className="token-selector">
                        <label htmlFor="token-selection">Token selection</label>
                        <div className="input-token-container">
                        <img src="/images/mecca-logo.png" alt="" className="mecca-logo-input" />
                        <input type="text" placeholder="0.001" name="token selection" id="token-selection" className="input-mecca token-input " />
                       <span>MECCA</span>
                        </div>
                        </div>
                        <div className="wallet-address-input">
                        <label htmlFor="mecca-pay">Wallet address</label>
                        <div className="input-mecca-container">
                        <input type="email" placeholder="Enter your Solana wallet address." name="mecca-pay" id="mecca-pay" className="input-mecca mecca-pay " />
                        </div>
                        </div>
                        </div>
                    </div>
                    <div className="airdrop-form-btn">
                        <button type="submit">Receive</button>
                    </div>
                </form>
        
            </div>

        </div>
    </div>
    
    </div>
  )
}

export default AirdropPeriod