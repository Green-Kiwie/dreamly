import { useState } from "react";
import { webglRef } from "./Editor";
import './Form.css'
import data from "./search_result_text.json";

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
        reader.onload = () => setPicture(reader.result as string);
        reader.readAsDataURL(file);
    };

    const postSearch = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.parse(`{
                "image_b64": ${picture},
                "text": ${name}
                }`),
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
        }
        catch(e){
            console.log("Posting Error")
            console.log(e)
        }

        console.log({ name });
        console.log({ picture });
    };

    const postFurniture = async (image:string ) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.parse(`{
                "image_b64": ${picture},
                "text": ${name}
                }`),
        });

        const data = await response.json();
        const result = data["results"]
        setfurnitures(result)
    }

    const handleClick = async (image: string) => {

        try{
            await postFurniture(image)
        }
        catch(e){
            console.log("Posting Error")
            console.log(e)
        }
        

        webglRef.sendMessage?.('GameObjectName', 'MethodName', 'data');
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
                    <button type="submit">Submit</button>
                </form>
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