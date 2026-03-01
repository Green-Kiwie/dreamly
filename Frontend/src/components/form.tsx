import { useState } from "react";
import { webglRef } from "./Editor";
import './Form.css';

function Form() {
    interface Furniture{
        name: string;
        link: string;
        image: string;
        id: string;
        from: string;
    }

    const [name, setName] = useState("");
    const [picture, setPicture] = useState("");
    const [furnitures, setfurnitures] = useState<Furniture[]>([]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            setPicture(base64)};
        reader.readAsDataURL(file);
    };

    const postSearch = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
             },
            body: JSON.stringify({
                "image_b64": picture,
                "text": name
                }),
        });

        const data = await response.json();
        const result = data["results"]
        setfurnitures(result)
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(name == "" && picture == ""){
            return
        }
        try{
            await postSearch()
            console.log(furnitures[0].from)
        }
        catch(e){
            console.log("Posting Error")
            console.log(e)
        }
    };

    const addButton = () => {
        if(picture == ""){
            return(
                <div/>
            )
        }else{
            return(
                <button onClick={() => {postFurniture()}}>hello</button>
            )
        }
        
    }

    const base64ToBlob = (image: string = picture, mimeType: string = 'image/jpeg'): Blob => {
        const byteCharacters = atob(image);
        const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    };

    const postFurniture = async (image: string = picture) => {
        const blob = base64ToBlob(image);
        const formData = new FormData();
        formData.append('image', blob);

        if (blob.size > 10 * 1024 * 1024) { // 10MB limit
            alert("File is too large for the ngrok tunnel! Please use a smaller image.");
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/furniture/generate`, {
            method: 'POST',
            headers: { 
                /*'Content-Type': 'application/json',*/
                'ngrok-skip-browser-warning': 'true' 
             },
            body: formData
        });

        const data = await response.json();
        const result = data["results"]
        setfurnitures(result)
    }

    const handleClick = async (image: string) => {

        try{
            console.log("hi")
            const result = await postFurniture(image)
            console.log(result)
            webglRef.sendMessage?.('ModelManager', 'ModelLoader', result);
        }
        catch(e){
            console.log("Posting Error")
            console.log(e)
        }
    };

    return (
        <div id="search-wrapper">
            <div id="form-wrapper">
                <form id="form" onSubmit={handleSubmit}>
                    <div id="search">
                        <input id="search-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Start searching for furniture"
                        />
                    </div>
                    <p>or</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <button type="submit">Submit</button>
                </form>
                {addButton()}
            </div>

            <div id="result-wrapper">
                {furnitures.map((furniture)=>(
                    <div key={furniture.image}className="result" onClick={() => {handleClick(furniture.image)}}>
                        <img src={furniture.image}/>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Form;