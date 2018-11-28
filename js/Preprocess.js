let globalData = {};
let globalModel = {};

function setData(data) {
    globalData = data;
    displayPreData();
}

function displayPreData() {
    $("#collapseData").collapse('show');
    $("#pre_data_msg").hide();

    $("#pre_data_headers").empty();
    $("#pre_data_values").empty();

    globalData.headers.forEach(function (header) {
        $("#pre_data_headers").append("<td>" + header.attr + "</td>");
    });

    globalData.data.forEach(function (value) {
        let newRow = "<tr>";
        globalData.headers.forEach(function (header) {
            newRow += "<td>" + value[header.attr] + "</td>";
        });
        newRow += "</tr>";
        $("#pre_data_values").append(newRow);
    });
    $('#pre_data_table').DataTable();

    $("#train_btn").prop('disabled', false);
}

$(function() {
    const trainBtn = document.getElementById("train_btn");

    function train() {
        // Remove previous result data
        clearResults();

        let trainingData = $.extend(true, {}, globalData);

        let testOption = $("input[name=optradio]:checked").val();
        let testPer = parseFloat($("#testPer").val());

        if (testOption === 'same') {
            setTestData(globalData);
        }
        else if (testOption === 'split' && !isNaN(testPer)) {
            if (testPer < 0 || testPer > 100) {
                alert('Test Percentage: ' + testPer + ' is not in valid range [0, 100]');
                return;
            }
            trainingData = splitTestData(trainingData, testPer);
        }

        // pass data to selected algorithm
        let algo = $("#algo_select").val();

        globalModel = new ALGORITHMS[algo](trainingData);

        beginResults(trainingData, globalModel);

        if (isTestData())
            runTestData();
    }

    trainBtn.addEventListener('click', train);

    $("#test_split_radio").change(function() {
        $('#testPer').prop('disabled', false);
    });

    $("#test_file_radio").click(function() {
        $("#test_file_upload").click();
    });
});
