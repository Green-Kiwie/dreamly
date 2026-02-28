import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; 2026 Dreamly. All rights reserved.</p>
                <div className="footer-links">
                    <Link to="/terms">Terms of Service</Link>
                    <Link to="/privacy">Privacy</Link>
                </div>
            </div>
        </footer>
    );
}
