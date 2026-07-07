const fileInput = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');
const generateBtn = document.getElementById('generate-btn');

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        fileNameDisplay.innerHTML = "📄 " + file.name;
        generateBtn.style.display = 'inline-block';
    }
});


