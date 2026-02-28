import { useState } from "react";

function Form() {
    const [name, setName] = useState("");
    const [picture, setPicture] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setPicture(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

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
                    <button type="submit">Submit</button>
                </form>
            </div>

            <div id="resultwrapper">Results</div>
        </div>
    );
}
export default Form;