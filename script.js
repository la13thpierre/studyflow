const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");

fileInput.addEventListener("change", function () {

    if (this.files.length > 0) {
        fileName.textContent = "📄 " + this.files[0].name;
    }

});