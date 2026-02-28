import { Link } from "react-router-dom";

function Landing() {
    return (
        <>
            <div id="landing-wrapper">
                <div id="text">
                    <h1>Dream House Building,</h1>
                    <h1>Powered by AI</h1>
                    <Link to="/Editor" className="nav-button">
                        Go to Editor
                    </Link>

                </div>
            </div>
        </>
    );
}
export default Landing;
