// Gemini API configuration
let API_KEY = "AIzaSyAWdbzn-4YYsxo2kfPLxKt-LZRYuBAO8QE";
window.GEMINI_API_KEY = API_KEY;

function initializeAPIKey() {
    console.log("Initializing API key...");
    
    return new Promise((resolve, reject) => {
        // Already have the API key directly in the code
        console.log("Using configured API key");
        resolve(true);
    });
}

// Call this function when your page loads
document.addEventListener("DOMContentLoaded", async function() {
    try {
        await initializeAPIKey();
        console.log("API key initialization complete");
    } catch (error) {
        console.error("Failed to initialize API key:", error);
        showPopup("API Key Error", "The application couldn't find a valid API key. Some features may not work. Please check your configuration.");
    }
});

// Helper function to show error popup
function showPopup(title, message) {
    // Check if we have a custom showPopup function in widget.js
    if (typeof window.showPopup === 'function') {
        window.showPopup(title, message);
        return;
    }
    
    // Create popup if doesn't exist
    let popup = document.createElement('div');
    popup.className = 'popup-message';
    popup.innerHTML = `
        <div class="popup-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <button onclick="this.parentNode.parentNode.remove()">OK</button>
        </div>
    `;
    document.body.appendChild(popup);
    
    // Add style if not already defined
    if (!document.getElementById('popup-style')) {
        let style = document.createElement('style');
        style.id = 'popup-style';
        style.innerHTML = `
            .popup-message {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            .popup-content {
                background: white;
                padding: 20px;
                border-radius: 5px;
                max-width: 400px;
                box-shadow: 0 0 15px rgba(0,0,0,0.2);
            }
            .popup-content h3 {
                margin-top: 0;
            }
            .popup-content button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                float: right;
            }
        `;
        document.head.appendChild(style);
    }
}