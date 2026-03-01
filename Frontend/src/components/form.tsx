import { useState } from "react";
import { webglRef } from "./Editor";

function Form() {
    interface Furniture {
        name: string;
        price: string;
        link: string;
        image: string;
        id: string;
        from: string;
    }

    const [name, setName] = useState("");
    const [picture, setPicture] = useState("");
    const [furnitures, setfurnitures] = useState<Furniture[]>([]);

    const handleGLBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("GLB file selected:", file.name);

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result as string;
            console.log(
                "GLB converted to base64, length:",
                base64String.length,
            );

            if (webglRef.sendMessage) {
                console.log("Sending GLB to Unity...");
                webglRef.sendMessage("ModelManager", "LoadGLB", base64String);
            } else {
                console.error(
                    "webglRef.sendMessage is null - Unity may not be loaded",
                );
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setPicture(reader.result as string);
        reader.readAsDataURL(file);
    };

    const postSearch = async () => {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/search`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.parse(`{
                "image_b64": ${picture},
                "text": ${name}
                }`),
            },
        );

        const results: Furniture[] = await response.json();
        setfurnitures(results);
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (name == "" && picture == "") {
            return;
        }
        try {
            await postSearch();
        } catch (e) {
            console.log("Posting Error");
            console.log(e);
        }

        console.log({ name });
        console.log({ picture });
    };

    return (
        <div id="searchWrapper">
            <div id="formWrapper">
                <form id="form" onSubmit={handleSubmit}>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        id="search"
                        placeholder="Start searching for furniture"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <input
                        type="file"
                        accept=".glb"
                        onChange={handleGLBChange}
                    />
                    <button type="submit">Submit</button>
                </form>
            </div>

            <div id="resultwrapper">
                {furnitures.map((furniture) => (
                    <div>
                        <img src={furniture.image} />
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Form;
