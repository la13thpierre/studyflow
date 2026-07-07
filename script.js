const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");

fileInput.addEventListener("change", function () {

    if (fileInput.files.length > 0) {
        fileName.textContent = "📄 " + fileInput.files[0].name;
    }

});

