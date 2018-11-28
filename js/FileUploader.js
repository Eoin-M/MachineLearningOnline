const trainingFileUploadInput = document.getElementById("file_upload");
const testFileUploadInput = document.getElementById("test_file_upload");

function handleFile() {
    const file = this.files[0]; //Only accept the first file
    $('#upload-file-info').html(file.name);
    console.log(file);

    readFile(file, setData);
}
trainingFileUploadInput.addEventListener("change", handleFile, false);

function handleTestFile() {
    const file = this.files[0]; //Only accept the first file
    $('#test_file_upload').html(file.name);
    console.log(file);

    readFile(file, setTestData);
}
testFileUploadInput.addEventListener("change", handleTestFile, false);

function readFile(file, callback) {
    if (!file || !file.name.includes('.')) {
        displayError('File must have a supported extension.');
        return;
    }

    //Read file contents into variable
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = function(e) {
        let contents = e.target.result;
        const fileType = file.name.split('.').pop();

        for (let i = 0; i < FILE_READERS.length; i++) {
            let reader = FILE_READERS[i];
            if (reader.ext === fileType) {
                let data = reader.read(contents);
                displayErrorClear();
                //TODO: Replace this with user choice
                data.target = data.headers[data.headers.length - 1].attr;
                return callback(data);
            }
        }

        displayError('"' + fileType + '" filetype is not supported.\n');
        let msg = FILE_READERS.map(e => e.ext).join(', ');
        msg += ' are supported filetypes.';
        displayError(msg);
    };

    reader.onerror = function(e) {
        displayError("Error reading file.");
        console.error(e);
    };
}
