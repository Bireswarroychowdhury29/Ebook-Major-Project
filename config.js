// Add this at the beginning of your main script
// Check and set API key from multiple possible sources
let API_KEY = null;

function initializeAPIKey() {
    console.log("Initializing API key...");
    
    // Try to get the API key from window.GEMINI_API_KEY
    if (window.GEMINI_API_KEY) {
        console.log("Found API key from window.GEMINI_API_KEY");
        API_KEY = window.GEMINI_API_KEY;
        return true;
    }
    
    // Hard-coded API key as fallback (replace with your actual key)
    // This is not recommended for production, but useful for debugging
    const hardcodedKey = "AIzaSyAWdbzn-4YYsxo2kfPLxKt-LZRYuBAO8QE";
    console.log("Using hardcoded API key as fallback");
    API_KEY = hardcodedKey;
    
    return API_KEY !== null;
}

// Call this function when your page loads
document.addEventListener("DOMContentLoaded", function() {
    if (!initializeAPIKey()) {
        console.error("Failed to initialize API key. Features requiring the API will not work.");
        showPopup("API Key Error", "The application couldn't find a valid API key. Book summarization may not work. Please check your configuration.");
    }
});