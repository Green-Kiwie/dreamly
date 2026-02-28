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
                <Link to="/Editor" className="nav-button">
                    Editor
                </Link>
                <Link to="/About" className="nav-button">
                    About
                </Link>
            </div>
        </nav>
    );
}
export default Navbar;
