import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="logo">
                    Dreamly
                </Link>
            </div>
            <div className="navbar-links">
                <Link to="/about" className="nav-button">
                    About
                </Link>
                <Link to="/HowItWorks" className="nav-button">
                    How It Works
                </Link>
                <Link to="/faq" className="nav-button">
                    FAQ
                </Link>
            </div>
        </nav>
    );
}
export default Navbar;
