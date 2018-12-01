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

        let data = {};
        try {
            data = parseData(contents, fileType);
            displayErrorClear();
        } catch (err) {
            displayError(err.message);
            return;
        }

        return callback(data);
    };

    reader.onerror = function(e) {
        displayError("Error reading file.");
        console.error(e);
    };
}

function parseData(str, fileType) {
  for (let i = 0; i < FILE_READERS.length; i++) {
    let reader = FILE_READERS[i];
    if (reader.ext === fileType) {
      let data = reader.read(str);
      //TODO: Replace this with user choice
      data.target = data.headers[data.headers.length - 1].attr;
      return data;
    }
  }

  let msg = '"' + fileType + '" filetype is not supported.\n';
  msg += FILE_READERS.map(e => e.ext).join(', ');
  msg += ' are supported filetypes.';

  //TODO: Create ParseError
  throw new Error(msg);
}

function loadSampleFile() {
    let filePath = $("#sample_select").val();

    if (!filePath || filePath === 'default')
        return;

    $('#upload-file-info').html(filePath);

    const fileType = filePath.split('.').pop();
    filePath = './samples/' + filePath;

    let result = null;
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();

    if (xmlhttp.status === 200) {
        result = xmlhttp.responseText;
    }
    try {
        result = parseData(result, fileType);
        displayErrorClear()
    } catch (err) {
        displayError(err.message);
        return;
    }

    setData(result);
}

$("#sample_select").change(loadSampleFile);
