Hooks.once('init', async function () {
    console.log('SongGen | Initializing Song Generator Module');

    // Load the download.js script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/downloadjs/1.4.8/download.min.js';
    document.head.appendChild(script);

    // Register the base URL setting
    game.settings.register("songgen", "baseUrl", {
        name: "Suno API Base URL",
        hint: "Enter the full URL of your deployed Vercel app.",
        scope: "world",
        config: true,
        type: String,
        default: ""
    });

    // Register the OpenAI API key setting
    game.settings.register("songgen", "openaiApiKey", {
        name: "OpenAI API Key",
        hint: "Enter your OpenAI API key.",
        scope: "world",
        config: true,
        type: String,
        default: ""
    });

    // Add a control button to the UI
    Hooks.on('getSceneControlButtons', (controls) => {
        controls.push({
            name: "songgen",
            title: "Song Generator",
            icon: "fa-solid fa-piano-keyboard",
            layer: "controls",
            tools: [{
                name: "generate-song",
                title: "Generate Song",
                icon: "fa-solid fa-plus",
                onClick: () => {
                    new SongGenApp().render(true);
                }
            }],
            activeTool: "generate-song"
        });

        // Add the Karaoke button to the Ambient Sound Controls
        const soundControls = controls.find(control => control.name === "sounds");
        if (soundControls) {
            soundControls.tools.push({
                name: "run-karaoke",
                title: "Run Karaoke",
                icon: "fa-solid fa-microphone-stand",
                onClick: runKaraokeMacro
            });
        }
    });
});

Hooks.once("ready", () => {
    // Prompt user to set baseUrl if not already set
    if (!game.settings.get("songgen", "baseUrl")) {
        new Dialog({
            title: "Set Suno API Base URL",
            content: `<p>Please enter the full URL of your deployed Vercel app:</p>
                      <input type="text" id="suno-api-url" style="width: 100%;" value="">
                      <p>This setting can be updated later from the module's configuration menu.</p>`,
            buttons: {
                confirm: {
                    icon: "<i class='fas fa-check'></i>",
                    label: "Save",
                    callback: (html) => {
                        const url = html.find("#suno-api-url")[0].value;
                        if (url) {
                            game.settings.set("songgen", "baseUrl", url);
                            ui.notifications.info("Suno API Base URL has been set.");
                        } else {
                            ui.notifications.error("URL cannot be empty.");
                        }
                    }
                }
            },
            default: "confirm"
        }).render(true);
    }
});

class SongGenApp extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: "Song Generator",
            id: "songgen-app",
            template: "modules/songgen/templates/songgen-app.html",
            width: 400
        });
    }

    getData() {
        // Provide data for the form
        return {
            prompt: "A theme song",
            tags: ["cinematic", "epic", "melancholic", "uplifting"],
            title: "song",
            instrumental: false,
            baseUrl: game.settings.get("songgen", "baseUrl")  // Get the current base URL
        };
    }

    async _updateObject(event, formData) {
        const baseUrl = game.settings.get("songgen", "baseUrl");

        if (!baseUrl) {
            ui.notifications.error("You must set the Suno API Base URL in the module settings.");
            return;
        }

        // Display messages while waiting for the song to generate
        const messages = [
            "The song is generating...",
            "Bells and whistles are being added...",
            "Voice being generated!",
            "It might take up to 3 minutes!",
            "Be patient, we are working for you!",
            "Just adding the final touches...",
            "Checking the harmonies...",
            "Adding a little magic...",
            "The orchestra is warming up...",
            "The choir is clearing their throats...",
            "Putting on our best headphones...",
            "Synchronizing with the cloud...",
            "Finalizing the masterpiece...",
            "The conductor is raising the baton...",
            "Mixing and mastering in progress...",
            "One moment please, it's almost ready...",
            "We hope you like epic sounds...",
            "Just a little more time...",
            "Almost there, stay tuned...",
            "The music gods are working their magic...",
            "The final note is about to drop..."
        ];

        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            const messageElement = document.getElementById("songgen-message");
            if (messageElement && messageIndex < messages.length) {
                messageElement.innerText = messages[messageIndex];
                messageIndex++;
            } else {
                clearInterval(messageInterval);
            }
        }, 3000); // Change message every 3 seconds

        // Generate the song based on form data
        try {
            const lyricsResponse = await fetch(`${baseUrl}/api/generate_lyrics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: formData.prompt
                })
            });

            if (!lyricsResponse.ok) {
                throw new Error("Failed to generate lyrics");
            }

            const lyricsData = await lyricsResponse.json();
            const generatedLyrics = lyricsData.text;

            const audioResponse = await fetch(`${baseUrl}/api/custom_generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: generatedLyrics,
                    tags: formData.tags,
                    title: formData.title,
                    make_instrumental: formData.instrumental,
                    wait_audio: true
                })
            });

            if (!audioResponse.ok) {
                throw new Error("Failed to generate audio");
            }

            const audioData = await audioResponse.json();
            const audioUrl = audioData[0].audio_url;
            const audioTitle = formData.title || "song";

            const audioFetchResponse = await fetch(audioUrl);
            if (!audioFetchResponse.ok) {
                throw new Error("Failed to fetch audio stream");
            }

            const audioBlob = await audioFetchResponse.blob();
            download(audioBlob, `${audioTitle}.mp3`, 'audio/mp3');

            ui.notifications.info("Song generated and download started!");

        } catch (error) {
            console.error("Error generating song:", error);
            ui.notifications.error("Failed to generate and download song.");
        } finally {
            clearInterval(messageInterval); // Stop the messages when done
            const messageElement = document.getElementById("songgen-message");
            if (messageElement) {
                messageElement.innerText = "Song generation complete!";
            }
        }
    }
}

async function runKaraokeMacro() {
    // Ensure the Sequencer module is active
    if (typeof game.modules.get('sequencer') === 'undefined' || !game.modules.get('sequencer').active) {
        ui.notifications.error("Sequencer module not active or installed");
        return;
    }

    // Get the API keys for OpenAI from the Foundry VTT settings
    const openaiApiKey = game.settings.get("songgen", "openaiApiKey");
    if (!openaiApiKey) {
        ui.notifications.error("API key is missing. Please set it up in the SongGen module settings.");
        return;
    }

    // Ensure an ambient sound is selected
    if (!canvas.sounds.controlled.length) {
        ui.notifications.warn("No ambient sound selected.");
        return;
    }

    // Get the first selected ambient sound and extract the sound file path and name
    const selectedSound = canvas.sounds.controlled[0];
    const soundUrl = selectedSound.document.path;

    if (!soundUrl) {
        ui.notifications.error("Could not retrieve the sound URL.");
        return;
    }

    // Extract the filename from the sound URL to use for the macro name
    const soundFilename = soundUrl.substring(soundUrl.lastIndexOf('/') + 1, soundUrl.lastIndexOf('.'));

    const macroName = `karaoke-${soundFilename}`;
    let existingMacro = game.macros.find(m => m.name === macroName);

    if (existingMacro) {
        // If a macro already exists for this sound, execute it instead of regenerating
        existingMacro.execute();
        return;
    }

    try {
        // Step 1: Transcribe the audio using Whisper API
        const response = await fetch(soundUrl);
        const blob = await response.blob();

        let formData = new FormData();
        formData.append("file", blob, "ambient_sound.mp3");
        formData.append("model", "whisper-1");
        formData.append("response_format", "srt");
        formData.append("language", "en");

        const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiApiKey}`
            },
            body: formData
        });

        if (!transcriptionResponse.ok) {
            throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
        }

        const transcription = await transcriptionResponse.text();

        // Step 2: Post-process the transcription using GPT-4
        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful assistant. Correct any spelling discrepancies in the transcribed text. Add necessary punctuation such as periods, commas, and capitalization, using only the context provided." },
                    { role: "user", content: transcription }
                ]
            })
        });

        const gptData = await gptResponse.json();
        const srtData = gptData.choices[0].message.content;

        // Function to parse SRT format
        function parseSRT(data) {
            const regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n([\s\S]*?)(?=\n\n|\n*$)/g;
            let match;
            const subtitles = [];

            while ((match = regex.exec(data)) !== null) {
                const start = match[2];
                const end = match[3];
                const text = match[4].replace(/\n/g, ' ');
                subtitles.push({
                    start: parseTime(start),
                    end: parseTime(end),
                    text
                });
            }
            return subtitles;
        }

        // Function to convert SRT time format to seconds
        function parseTime(time) {
            const parts = time.split(/[:,]/);
            return (
                parseInt(parts[0], 10) * 3600 +
                parseInt(parts[1], 10) * 60 +
                parseInt(parts[2], 10) +
                parseInt(parts[3], 10) / 1000
            );
        }

        // Parse the SRT data
        const lyrics = parseSRT(srtData);

        // Style for the lyrics
        const style = {
            "fill": "#ffffff",
            "fontFamily": "Arial Black",
            "fontSize": 40,
            "strokeThickness": 4,
            "align": "center"
        };

        // Create a sequence for the audio
        let audioSequence = new Sequence();
        audioSequence.sound()
            .file(soundUrl) // Use the selected ambient sound's URL
            .play();

        // Play the audio sequence
        audioSequence.play();

        // Create a separate sequence for the lyrics
        let textSequence = new Sequence();
        for (let lyric of lyrics) {
            const duration = lyric.end - lyric.start;
            textSequence.scrollingText()
                .atLocation({ x: selectedSound.x, y: selectedSound.y })
                .text(lyric.text, style)
                .duration(duration * 1000) // Duration for each lyric to stay visible
                .delay(lyric.start * 1000)
                .play();
        }

        // Play the text sequence
        textSequence.play();

        // Save the sequence as a macro document for future use
        const macroData = {
            name: macroName,
            type: "script",
            command: `
            let audioSequence = new Sequence();
            audioSequence.sound()
                .file("${soundUrl}")
                .play();
            audioSequence.play();

            let textSequence = new Sequence();
            const style = ${JSON.stringify(style)};
            const lyrics = ${JSON.stringify(lyrics)};
            for (let lyric of lyrics) {
                const duration = lyric.end - lyric.start;
                textSequence.scrollingText()
                    .atLocation({ x: ${selectedSound.x}, y: ${selectedSound.y} })
                    .text(lyric.text, style)
                    .duration(duration * 1000)
                    .delay(lyric.start * 1000)
                    .play();
            }
            textSequence.play();
            `,
            img: "icons/svg/music.svg",
            scope: "global"
        };

        await Macro.create(macroData);
        ui.notifications.info(`Karaoke macro created: ${macroName}`);

    } catch (error) {
        console.error("Error during transcription or post-processing:", error);
        ui.notifications.error("Failed to transcribe or process the audio. Check the console for details.");
    }
}

