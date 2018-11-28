/*
    Standard function for displaying results of model training.
    These function are available to all algorithm scripts.
 */

function beginResults(data, algorithm) {
    enableResults();

    displayResult('=== Run Information ===');
    displayResult('Instances: ' + data.data.length);
    displayResult('Attributes: ' + data.headers.length);
    let attributes = '[' + data.headers.map(e => e.attr).join(', ') + ']';
    displayResult(attributes);
    displayResult(algorithm.title);

    algorithm.run();
}

function enableResults() {
    let resultsBtn = $("#results_btn");
    resultsBtn.prop('disabled', false);
    $("#collapseResults").collapse('show');
}

function displayResult(text) {
    display(text, $("#results_figures"));
}

function displayResultTest(text) {
    display(text, $("#results_tests"));
}

function display(text, element) {
    if (text)
        element.append("<span>" + text);
    element.append("<br>");
}

function displayConfusionMatrix(matrix, outcomes) {
    let table = "<table id='confusion_matrix'>";
    let header = "<tr>";
    let rows = "";

    outcomes.forEach(actual => {
        header += "<td>" + matrix[actual].symbol + "</td>";
        let row = "<tr>";
        outcomes.forEach(predicted => {
            row += "<td>" + matrix[actual].values[predicted] + "</td>";
        });
        row += "<td> | </td>";
        row += "<td>" + matrix[actual].symbol + " = " + actual + "</td>";
        row += "</tr>";
        rows += row;
    });

    header += "<td></td><td><-- classified as</td></tr>";
    table += header;
    table += rows;
    table += "</table>";

    displayResultTest(table);
}

function appendResultElement(html) {
    // Need to sanitize against injection
    $("#results_extras").append(html);
}

function clearResults() {
    $("#results_extras").empty();
    $("#results_figures").empty();
    $("#results_tests").empty();
}

function displayError(text) {
    display(text, $("#error_display"))
}

function displayErrorClear() {
    $("#error_display").empty();
}
