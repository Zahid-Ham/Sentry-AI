// extension/setup.js
document.getElementById('grantBtn').addEventListener('click', async () => {
    try {
        console.log("Requesting microphone access...");
        
        // This triggers the "Allow Microphone" popup
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // If we get here, you clicked Allow!
        console.log("✅ Permission Granted!");
        
        // Stop the stream (we just needed the permission)
        stream.getTracks().forEach(track => track.stop());

        // Update UI
        document.getElementById('grantBtn').style.display = 'none';
        document.getElementById('success').style.display = 'block';
        
        // Close tab automatically
        setTimeout(() => { window.close(); }, 2000);

    } catch (err) {
        console.error("Permission Denied:", err);
        alert("Error: You must click 'Allow' in the top-left popup!");
    }
});