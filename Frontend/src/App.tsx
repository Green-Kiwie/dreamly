import { useRoutes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import About from "./components/About";
import Footer from "./components/Footer";
import HowItWorks from "./components/HowItWorks";
import FAQ from "./components/FAQ";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";
import "./App.css";

function App() {
    let element = useRoutes([
        {
            path: "/",
            element: <Editor />,
        },
        {
            path: "/Editor",
            element: <Editor />,
        },
        {
            path: "/About",
            element: <About />,
        },
        {
            path: "/howitworks",
            element: <HowItWorks />,
        },
        {
            path: "/faq",
            element: <FAQ />,
        },
        {
            path: "/privacy",
            element: <Privacy />,
        },
        {
            path: "/Terms",
            element: <Terms />,
        },
    ]);
    return (
        <>
            <div className="app-container">
                <Navbar />
                {element}
                <Footer />
            </div>
        </>
    );
}

export default App;
