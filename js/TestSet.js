let testData = {};

function setTestData(data) {
    testData = data;
}

function isTestData() {
    if (!testData.data) return false;
    return testData.data.length !== 0;
}

function runTestData() {
    if (!testData.data)
        throw new Error('No TestData Defined');

    console.log(testData.data);

    let outcomes = globalModel.targetOutcomes;
    let matrix = {};
    let values = {};
    outcomes.forEach((e, i) => {
        matrix[e] = {symbol: String.fromCharCode(i + 97)};
        values[e] = 0;
    });
    outcomes.forEach(e => {
        matrix[e].values = $.extend(true, {}, values);
    });

    let numCorrect = 0;
    let numIncorrect = 0;

    testData.data.forEach(function(data) {
        let actual = data[testData.target];
        let predicted = globalModel.classify(data);

        matrix[actual].values[predicted]++;

        if (predicted === actual)
            numCorrect++;
        else
            numIncorrect++;
    });

    let correctPer = (numCorrect / testData.data.length * 100).toFixed(2);
    let incorrectPer = (numIncorrect / testData.data.length * 100).toFixed(2);

    displayResultTest('=== Accuracy ===');
    displayResultTest('Correctly Classified Instances: ' + numCorrect + ' (' + correctPer + '%)');
    displayResultTest('Incorrectly Classified Instances: ' + numIncorrect  + ' (' + incorrectPer + '%)');

    displayResultTest();

    displayResultTest('=== Confusion Matrix ===');
    displayConfusionMatrix(matrix, outcomes);
}

function splitTestData(data, perc) {
    let testData = {data: []};
    testData.fields = data.fields;
    testData.target = data.target;

    let splitNum = data.data.length * (100 - perc) / 100;

    for (let i = 0; i < splitNum; i++) {
        let rand = Math.floor(Math.random() * data.data.length);
        testData.data.push(data.data.splice(rand, 1)[0]);
    }
    setTestData(testData);

    console.log(testData);
    console.log(data);

    return data;
}
