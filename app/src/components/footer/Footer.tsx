import './style.css'

const Footer = () => {
  return (
  
    <footer>
    <div className="top-footer">
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="top-footer-inner">
                        <img src="images/footer-logo.svg" alt="" className="img-fluid"/>
                        <ul className="socail-list">
                            <li>
                                <a href="#">
                                    <img src="images/twiter-icon.svg" alt="" className="img-fluid"/>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <img src="images/telegram-icon.svg" alt="" className="img-fluid"/>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <img src="images/discord-icon.svg" alt="" className="img-fluid"/>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <img src="images/github-icon.svg" alt="" className="img-fluid"/>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <img src="images/youtube-icon.svg" alt="" className="img-fluid"/>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <img src="images/linkdin-icon.svg" alt="" className="img-fluid"/>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <img src="images/instagram-icon.svg" alt="" className="img-fluid"/>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <img src="images/facebook-icon.svg" alt="" className="img-fluid"/>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div className="bottom-footer">
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="footer-lists">
                        <div className="">
                            <h5>Chain</h5>
                            <ul>
                                <li>
                                    <a href="#">MECCA Smart Chain</a>
                                </li>
                                <li>
                                    <a href="#">MECCA Greenfield</a>
                                </li>
                            </ul>
                        </div>
                        <div className="">
                            <h5>Use MECCA Chain</h5>
                            <ul>
                                <li>
                                    <a href="#">Download Wallet</a>
                                </li>
                                <li>
                                    <a href="#">Get MECCA</a>
                                </li>
                                <li>
                                    <a href="#">Stake MECCA</a>
                                </li>
                            </ul>
                        </div>
                        <div className="">
                            <h5>Build</h5>
                            <ul>
                                <li>
                                    <a href="#">Portal</a>
                                </li>
                                <li>
                                    <a href="#">Documentations</a>
                                </li>
                                <li>
                                    <a href="#">Faucet</a>
                                </li>
                            </ul>
                        </div>
                        <div className="">
                            <h5>Participate</h5>
                            <ul>
                                <li>
                                    <a href="#">Events</a>
                                </li>
                                <li>
                                    <a href="#">Hackathon</a>
                                </li>
                                <li>
                                    <a href="#">Program</a>
                                </li>
                            </ul>
                        </div>
                        <div className="">
                            <h5>About</h5>
                            <ul>
                                <li>
                                    <a href="#">Blog</a>
                                </li>
                                <li>
                                    <a href="#">Careers</a>
                                </li>
                                <li>
                                    <a href="#">MECCA Chain Verify</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </footer>
  )
}

export default Footer