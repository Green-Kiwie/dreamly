import { useRoutes } from "react-router-dom";
import Landing from "./components/Landing";
import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import About from "./components/About";
import "./App.css";

function App() {
    let element = useRoutes([
        {
            path: "/",
            element: <Landing />,
        },
        {
            path: "/Editor",
            element: <Editor />,
        },
        {
            path: "/About",
            element: <About />,
        },
    ]);
    return (
        <>
            <div className="app-container">
                <Navbar />
                {element}
            </div>
        </>
    );
}

export default App;
