import { NavDropdown } from 'react-bootstrap';
import './style.css';

const LangOption = () => {
  return (
    <div className="lang-wrap">
      <img className="lang-icon" src="/images/globe-earth.png" alt="Globe Icon" />
      <NavDropdown title="" id="lang-option">
        <NavDropdown.Item eventKey="4.1">EN</NavDropdown.Item>
        <NavDropdown.Item eventKey="4.2">FR</NavDropdown.Item>
        <NavDropdown.Item eventKey="4.3">GE</NavDropdown.Item>
      </NavDropdown>
    </div>
  );
};

export default LangOption;
