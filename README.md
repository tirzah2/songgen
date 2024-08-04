Do you need support or help with the installation? 
Offer me a coffee and contact me on Discord! #dmkal
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D210UKH9)  

# SongGen FoundryVTT Module


https://github.com/user-attachments/assets/044c780e-2ead-4c97-a4b9-be3a1c3b4c28


**SongGen** is a FoundryVTT module that integrates with Suno API for generating songs and OpenAI API for creating karaoke lyrics from ambient sounds. This module allows you to dynamically create music for your game sessions and add karaoke effects to your ambient sounds.

## Features

- **Song Generator**: Generate custom music using the Suno API.
- **Karaoke Mode**: Transcribe ambient sound audio and display synchronized lyrics using OpenAI's Whisper and GPT-4 models.
- **Macro Integration**: Automatically saves the karaoke sequence as a macro for future use, avoiding repetitive API calls.

---

## Setup Guide

### 1. Suno API Setup

#### Obtain Suno API Cookie

1. **Visit Suno.ai**: Go to [Suno.ai](https://app.suno.ai) and log into your account.
2. **Open Developer Tools**: In your browser, press `F12` or right-click and select `Inspect` to open the Developer Tools.
3. **Go to the Network Tab**: Click on the "Network" tab and refresh the page.
4. **Find the Cookie**: Locate a request with the keyword `client?_clerk_js_version` in its name.
5. **Copy the Cookie**: Click on the request, go to the "Headers" tab, find the `Cookie` field, and copy the entire value.

#### Deploy to Vercel

1. **Clone and Deploy**: Click the button below to clone the Suno API project and deploy it to Vercel:

   [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgcui-art%2Fsuno-api&env=SUNO_COOKIE&project-name=suno-api&repository-name=suno-api)

2. **Add Environment Variable**: In the Vercel dashboard, add the environment variable `SUNO_COOKIE` with the value of the cookie you copied from the previous step.

#### Run Suno API

1. **Deploy the Project**: After configuring the environment variable, deploy the project.
2. **Test the Deployment**: Visit `https://<your-vercel-domain>/api/get_limit` to confirm the deployment is successful. You should see your API usage and limit information.

### 2. OpenAI API Setup

#### Obtain OpenAI API Key

1. **Sign Up/Log In**: Go to [OpenAI](https://platform.openai.com/signup) and create an account or log in if you already have one.
2. **Create API Key**: Navigate to the API section and create a new API key.
3. **Copy API Key**: Make sure to copy the key and store it securely, as you'll need to input it into the module settings.

---

## Installation in FoundryVTT

1. **Download the Module**: Install the SongGen module via FoundryVTT's Add-on Modules interface.
2. **Configure Settings**: 
   - Open the module settings and set the **Suno API Base URL** to your deployed Vercel app's URL.
   - Set the **OpenAI API Key** to the key you generated from the OpenAI platform.

---

## Usage

### Song Generator

1. **Open the Song Generator**: Click the "Piano" icon on the left sidebar and select the "+" button to open the Song Generator form.
2. **Fill in the Details**: Provide the song theme, tags, title, and whether you want instrumental or vocal music.
3. **Generate and Download**: Click "Generate Song" to create the music. The song will automatically be downloaded to your computer.

### Karaoke Mode

1. **Select an Ambient Sound**: Go to the Ambient Sound Controls and select the sound you want to add karaoke effects to.
2. **Run Karaoke**: Click the microphone stand icon in the Ambient Sound Controls toolbar. If a macro for the selected sound already exists, it will be executed. Otherwise, the module will generate lyrics, create a sequence, and save it as a macro for future use.

---

## Troubleshooting

- **API Key Issues**: Ensure your OpenAI API key is correctly set in the module settings.
- **Deployment Errors**: Double-check your Vercel environment variable setup and make sure the Suno API is correctly deployed.

---

## Contributing

Contributions are welcome! Feel free to fork the project and submit a pull request. If you encounter any issues, please report them on the project's GitHub page.

---

## License

This module is released under the MIT License. See `LICENSE` for more details.

---

## Acknowledgments

- [Suno.ai](https://app.suno.ai) for providing the music generation API.
- [OpenAI](https://platform.openai.com/) for their transcription and language models.
- The FoundryVTT community for ongoing support and resources.
