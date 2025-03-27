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

    // Add event listeners to menu items
    const speechBtn = document.getElementById("speechBtn");
    const dictionaryBtn = document.getElementById("dictionaryBtn");

    if (speechBtn) {
        speechBtn.addEventListener("click", textToSpeech);
    } else {
        console.error("Speech button not found! Make sure you have a button with id 'speechBtn'");
    }

    if (dictionaryBtn) {
        dictionaryBtn.addEventListener("click", dictionaryLookup);
    } else {
        console.error("Dictionary button not found! Make sure you have a button with id 'dictionaryBtn'");
    }
});

// Function for Text-to-Speech
function textToSpeech() {
    console.log("Text-to-speech function called");
    const text = prompt("Enter text for speech:");
    if (!text) return;

    console.log("Speaking text:", text);
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}

// Function for Dictionary Lookup
async function dictionaryLookup() {
    console.log("Dictionary lookup function called");
    const word = prompt("Enter a word to define:");
    if (!word) return;

    try {
        console.log("Looking up word:", word);
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        
        if (!response.ok) {
            throw new Error(`Dictionary API responded with status ${response.status}`);
        }
        
        const result = await response.json();

        if (Array.isArray(result) && result.length > 0 && result[0].meanings) {
            console.log("Definition found");
            showPopup(`Definition of "${word}"`, result[0].meanings[0].definitions[0].definition);
        } else {
            console.log("No definition found");
            showPopup("Not Found", "No definition found for this word.");
        }
    } catch (error) {
        console.error("Error in dictionary lookup:", error);
        showPopup("Error", "Error fetching definition: " + error.message);
    }
}

// Function to show a styled popup instead of alert
function showPopup(title, content) {
    console.log("Showing popup:", title);
    try {
        // Create popup container
        const popup = document.createElement("div");
        popup.id = "aiWidgetPopup";
        popup.style.position = "fixed";
        popup.style.top = "0";
        popup.style.left = "0";
        popup.style.width = "100%";
        popup.style.height = "100%";
        popup.style.backgroundColor = "rgba(0,0,0,0.5)";
        popup.style.display = "flex";
        popup.style.justifyContent = "center";
        popup.style.alignItems = "center";
        popup.style.zIndex = "1000";

        // Create popup content
        const popupContent = document.createElement("div");
        popupContent.style.backgroundColor = "white";
        popupContent.style.padding = "20px";
        popupContent.style.borderRadius = "5px";
        popupContent.style.maxWidth = "80%";
        popupContent.style.maxHeight = "80%";
        popupContent.style.overflow = "auto";
        popupContent.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";

        // Create title
        const titleElement = document.createElement("h2");
        titleElement.textContent = title;
        titleElement.style.marginTop = "0";
        titleElement.style.borderBottom = "1px solid #eee";
        titleElement.style.paddingBottom = "10px";

        // Create content
        const contentElement = document.createElement("div");
        contentElement.innerHTML = content.replace(/\n/g, "<br>");
        contentElement.style.margin = "15px 0";

        // Create close button
        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.style.padding = "8px 16px";
        closeButton.style.backgroundColor = "#3498db";
        closeButton.style.color = "white";
        closeButton.style.border = "none";
        closeButton.style.borderRadius = "4px";
        closeButton.style.cursor = "pointer";
        closeButton.addEventListener("click", function() {
            document.body.removeChild(popup);
        });

        // Assemble popup
        popupContent.appendChild(titleElement);
        popupContent.appendChild(contentElement);
        popupContent.appendChild(closeButton);
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