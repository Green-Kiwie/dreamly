# Dreamly
## Inspiration

Dreamly was inspired by real estate marketing companies like CoreLogic, Matterport, and CloudPano that use 3D modeling to showcase properties. We wanted to take this a step further. Instead of just viewing spaces, we allow prospective buyers to furnish their dream homes in a realistic 3D virtual world, with 3D objects accurately AI generated from pictures on their phone or from the web.

## What it does

Dreamly is a web app that lets home buyers design and furnish their dream home inside an interactive, first-person 3D virtual world. Users can browse furniture from common furniture retailers, or upload an image. Dreamly turns any furniture picture into high-definition 3D models that can be placed directly into their virtual estate for a fully personalized and immersive home design experience. While designing their dream home, prospective buyers can walk through their space, place and rearrange furniture, and build their dream.

## How we built it
**Frontend**
Dreamly is powered by an embedded Unity game built with WebGL, which runs directly inside our web app and serves as the core interactive experience. The Unity environment handles first-person movement, real-time rendering, object placement, collision detection, lighting, shadows, and world physics, providing a fully functional 3D environment.

**Backend: Furniture Search**
The backend connects to external APIs to access and process furniture data. Text-based searches use the IKEA API and Google Shopping via the SERP API to retrieve a broad catalogue of products, while image-based searches are processed with Gemini 2.5 to convert uploaded photos into descriptive queries that are fed into SERP API.

**Backend: 2D to 3D model**
We utilize Tencent’s 6 month old HunYuan 3D-2 AI model then generates high-definition 3D objects from 2D images. We ran Tencent's new model locally using a RTX 3060 GPU as it is not commercially available. Within minutes, we can generate accurately scaled, textured, and colored models to a precision of 500,000 faces. The objects are rendered as a .blg file which is then imported into the Unity WebGL environment for rendering within the 3D world.

## Challenges we ran into
**Frontend Challenges**
One major challenge was embedding a Unity game into a web app using WebGL for the first time. We experienced significant difficulty managing and desynchronizing inputs between the embedded Unity game and the surrounding website interface, which required careful debugging and coordination between systems.

**Backend Challenges**
2D images to 3D object generation is the cutting edge of multimodal AI. Popular services such as Meshy.AI are expensive and not commercially viable. Instead, look for light weight open source models. While HunYuan 3D-2 diffusion model was a good option, it was still too large for our local computation resources. Additionally, the model did not follow standard python installation protocol to be used on cloud services. In the end, we had to find a way to manage RAM across the CPU and the GPU to allow the model to run. Lastly, we avoided three.js because we wanted out furniture to look exactly like the input pictures and at a higher defintion.

## Accomplishments that we're proud of

We are especially proud of successfully embedding the Unity WebGL build into our website, which made the full interactive experience possible.

Another major accomplishment was generating 3D models from 2D images with virtually no cost. The low cost enables bulk generation of 3D models to make the furnishing of a house commercially viable.

## What we learned

Throughout this project, we learned how to integrate WebGL-based Unity builds into web applications and manage communication between frontend interfaces and embedded game environments. We also gained experience working with CUDA and a external GPU for AI-powered model generation from 2D inputs and interactive 3D outputs.

## What's next for Dreamly

Next, we plan to expand Dreamly into a fully immersive VR experience, allowing users to step inside and explore their dream home in real time. As Dreamly is built using Unity, porting over from a website to a VR software can be done quickly. We also aim to add home layout scanning so users can import the structure of their home into the platform, instead of relying on other software to generate the home environment. To enhance usability, we will introduce features like an inventory system, quick furniture placement, a more intuitive interface, and fast navigation for larger virtual spaces.

