document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded, initializing AI widget...");
    const widget = document.getElementById("aiWidget");
    const menu = document.getElementById("aiWidgetMenu");

    if (!widget) {
        console.error("AI Widget element not found! Make sure you have an element with id 'aiWidget'");
    }
    if (!menu) {
        console.error("AI Widget menu element not found! Make sure you have an element with id 'aiWidgetMenu'");
    }

    // Toggle menu display
    if (widget && menu) {
        widget.addEventListener("click", function () {
            console.log("Widget clicked, toggling menu");
            menu.style.display = menu.style.display === "flex" ? "none" : "flex";
        });
    }

    // Add event listeners to menu items based on existing HTML structure
    const textToSpeechBtn = document.querySelector("#aiWidgetMenu button:nth-child(1)");
    const dictionaryBtn = document.querySelector("#aiWidgetMenu button:nth-child(2)");

    if (textToSpeechBtn) {
        textToSpeechBtn.addEventListener("click", textToSpeech);
    } else {
        console.error("Text-to-speech button not found!");
    }

    if (dictionaryBtn) {
        dictionaryBtn.addEventListener("click", dictionaryLookup);
    } else {
        console.error("Dictionary button not found!");
    }
});

function textToSpeech() {
    console.log("Text-to-speech function called");

    // Create popup
    const popup = document.createElement("div");
    popup.id = "aiWidgetPopup";

    const content = document.createElement("div");
    content.className = "ai-popup-content";

    // Stop click events from bubbling up (Prevents unwanted closing)
    content.addEventListener("click", (e) => e.stopPropagation());

    // Header
    const header = document.createElement("div");
    header.className = "ai-popup-header";

    const title = document.createElement("h2");
    title.className = "ai-popup-title";
    title.innerHTML = '<i class="fas fa-volume-up"></i> Text-to-Speech';

    header.appendChild(title);

    // Body
    const body = document.createElement("div");
    body.className = "ai-popup-body";

    const inputGroup = document.createElement("div");
    inputGroup.className = "ai-input-group";

    const label = document.createElement("label");
    label.className = "ai-input-label";
    label.textContent = "Enter text to be read aloud:";

    const textarea = document.createElement("textarea");
    textarea.className = "ai-input-field";
    textarea.rows = 4;
    textarea.placeholder = "Type or paste the text here...";

    // Stop clicks inside the textarea from bubbling up
    textarea.addEventListener("click", (e) => e.stopPropagation());

    inputGroup.appendChild(label);
    inputGroup.appendChild(textarea);

    const ttsControls = document.createElement("div");
    ttsControls.className = "tts-controls";
    ttsControls.style.display = "none";

    const ttsPreview = document.createElement("div");
    ttsPreview.className = "tts-preview";

    let utterance = null;

    const playBtn = document.createElement("button");
    playBtn.className = "tts-play-btn";

    // Keep the image constant - this is the key fix
    playBtn.innerHTML = `<img src='images/mic.png' style='height:20px; width:20px'/>`;

    playBtn.addEventListener("click", function() {
        const text = textarea.value.trim();
        if (text) {
            // Set text to preview
            ttsPreview.textContent = text;
            ttsControls.style.display = "flex";

            // Stop any existing speech
            speechSynthesis.cancel();

            // Create a new utterance
            utterance = new SpeechSynthesisUtterance(text);

            // Speak the text
            speechSynthesis.speak(utterance);
            
            // We don't change the button content anymore
            // Just keep the mic image as is
        }
    });

    ttsControls.appendChild(ttsPreview);
    ttsControls.appendChild(playBtn);

    body.appendChild(inputGroup);
    body.appendChild(ttsControls);

    // Footer
    const footer = document.createElement("div");
    footer.className = "ai-popup-footer";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "ai-btn ai-btn-cancel";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
        speechSynthesis.cancel(); // Stop any ongoing speech immediately
        document.body.removeChild(popup);
    });

    const speakBtn = document.createElement("button");
    speakBtn.className = "ai-btn ai-btn-primary";
    speakBtn.innerHTML = '<span>Speak</span>';

    speakBtn.addEventListener("click", function() {
        const text = textarea.value.trim();
        if (!text) return;

        // Show preview
        ttsPreview.textContent = text;
        ttsControls.style.display = "flex";

        // Stop any existing speech
        speechSynthesis.cancel();

        // Speak the text
        utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    });

    footer.appendChild(cancelBtn);
    footer.appendChild(speakBtn);

    // Assemble popup
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);
    popup.appendChild(content);

    // Add to document
    document.body.appendChild(popup);
    console.log("Enhanced TTS popup added to document");

    // Fix: Close popup ONLY if clicking outside the popup content
    popup.addEventListener("click", function(e) {
        speechSynthesis.cancel();
        document.body.removeChild(popup);
    });

    // Focus the textarea
    setTimeout(() => textarea.focus(), 100);
}


// Function for Dictionary Lookup
async function dictionaryLookup() {
    console.log("Dictionary lookup function called");
    
    // Create enhanced popup
    const popup = document.createElement("div");
    popup.id = "aiWidgetPopup";

    const content = document.createElement("div");
    content.className = "ai-popup-content";

    // Header
    const header = document.createElement("div");
    header.className = "ai-popup-header";
    
    const title = document.createElement("h2");
    title.className = "ai-popup-title";
    title.innerHTML = '<i class="fas fa-book"></i> Dictionary Lookup';
    
    header.appendChild(title);

    // Body
    const body = document.createElement("div");
    body.className = "ai-popup-body";
    
    const inputGroup = document.createElement("div");
    inputGroup.className = "ai-input-group";
    
    const label = document.createElement("label");
    label.className = "ai-input-label";
    label.textContent = "Enter a word to look up:";
    
    const input = document.createElement("input");
    input.type = "text";
    input.className = "ai-input-field";
    input.placeholder = "Type a word...";
    
    inputGroup.appendChild(label);
    inputGroup.appendChild(input);
    
    const resultDiv = document.createElement("div");
    resultDiv.className = "dictionary-result";
    resultDiv.style.display = "none";
    
    body.appendChild(inputGroup);
    body.appendChild(resultDiv);

    // Footer
    const footer = document.createElement("div");
    footer.className = "ai-popup-footer";
    
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "ai-btn ai-btn-cancel";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => document.body.removeChild(popup));
    
    const lookupBtn = document.createElement("button");
    lookupBtn.className = "ai-btn ai-btn-primary";
    lookupBtn.textContent = "Look Up";
    lookupBtn.addEventListener("click", async function() {
        const word = input.value.trim();
        if (!word) return;
        
        // Show loading state
        this.innerHTML = '<span class="loading-spinner"></span>';
        this.disabled = true;
        
        try {
            console.log("Looking up word:", word);
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            
            if (!response.ok) {
                throw new Error(`Dictionary API responded with status ${response.status}`);
            }
            
            const result = await response.json();
            
            // Reset button state
            this.innerHTML = 'Look Up';
            this.disabled = false;
            
            if (Array.isArray(result) && result.length > 0 && result[0].meanings) {
                console.log("Definition found");
                
                // Clear previous results
                resultDiv.innerHTML = '';
                
                // Add word header
                const wordHeader = document.createElement("div");
                wordHeader.className = "word-header";
                
                const wordTitle = document.createElement("div");
                wordTitle.className = "word-title";
                wordTitle.textContent = word;
                
                const phonetic = document.createElement("div");
                phonetic.className = "phonetic";
                phonetic.textContent = result[0].phonetic || "";
                
                wordHeader.appendChild(wordTitle);
                wordHeader.appendChild(phonetic);
                resultDiv.appendChild(wordHeader);
                
                // Add meanings
                result[0].meanings.forEach(meaning => {
                    const meaningSection = document.createElement("div");
                    meaningSection.className = "meaning-section";
                    
                    const partOfSpeech = document.createElement("div");
                    partOfSpeech.className = "part-of-speech";
                    partOfSpeech.textContent = meaning.partOfSpeech;
                    meaningSection.appendChild(partOfSpeech);
                    
                    // Add definitions (limit to first 2 for cleanliness)
                    const definitions = meaning.definitions.slice(0, 2);
                    definitions.forEach(def => {
                        const definition = document.createElement("div");
                        definition.className = "definition";
                        definition.textContent = def.definition;
                        meaningSection.appendChild(definition);
                        
                        if (def.example) {
                            const example = document.createElement("div");
                            example.className = "example";
                            example.textContent = `"${def.example}"`;
                            meaningSection.appendChild(example);
                        }
                    });
                    
                    resultDiv.appendChild(meaningSection);
                });
                
                resultDiv.style.display = "block";
            } else {
                console.log("No definition found");
                resultDiv.innerHTML = '<div class="definition">No definition found for this word.</div>';
                resultDiv.style.display = "block";
            }
        } catch (error) {
            console.error("Error in dictionary lookup:", error);
            
            // Reset button state
            this.innerHTML = 'Look Up';
            this.disabled = false;
            
            resultDiv.innerHTML = `<div class="definition">Error fetching definition: ${error.message}</div>`;
            resultDiv.style.display = "block";
        }
    });
    
    // Add Enter key support
    input.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            lookupBtn.click();
        }
    });
    
    footer.appendChild(cancelBtn);
    footer.appendChild(lookupBtn);

    // Assemble popup
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);
    popup.appendChild(content);

    // Add to document
    document.body.appendChild(popup);
    console.log("Enhanced dictionary popup added to document");

    // Close on clicking outside
    popup.addEventListener("click", function(e) {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
    
    // Focus the input
    setTimeout(() => input.focus(), 100);
}

// Keeping the original showPopup function for backward compatibility
function showPopup(title, content) {
    console.log("Showing popup:", title);
    try {
        // Create popup container
        const popup = document.createElement("div");
        popup.id = "aiWidgetPopup";

        // Create popup content
        const popupContent = document.createElement("div");
        popupContent.className = "ai-popup-content";
        
        // Create header
        const header = document.createElement("div");
        header.className = "ai-popup-header";
        
        const titleElement = document.createElement("h2");
        titleElement.className = "ai-popup-title";
        titleElement.textContent = title;
        
        header.appendChild(titleElement);
        
        // Create body
        const body = document.createElement("div");
        body.className = "ai-popup-body";
        
        const contentElement = document.createElement("div");
        contentElement.innerHTML = content.replace(/\n/g, "<br>");
        
        body.appendChild(contentElement);
        
        // Create footer
        const footer = document.createElement("div");
        footer.className = "ai-popup-footer";
        
        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.className = "ai-btn ai-btn-primary";
        closeButton.addEventListener("click", function() {
            document.body.removeChild(popup);
        });
        
        footer.appendChild(closeButton);

        // Assemble popup
        popupContent.appendChild(header);
        popupContent.appendChild(body);
        popupContent.appendChild(footer);
        popup.appendChild(popupContent);

        // Add to document
        document.body.appendChild(popup);
        console.log("Popup added to document");

        // Also close on clicking outside
        popup.addEventListener("click", function(e) {
            if (e.target === popup) {
                document.body.removeChild(popup);
            }
        });
    } catch (error) {
        console.error("Error showing popup:", error);
        // Fallback to alert if popup fails
        alert(`${title}\n\n${content}`);
    }
}
