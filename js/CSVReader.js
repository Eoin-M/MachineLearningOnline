function csv_read(str) {
    let data = Papa.parse(str, {header: true});

    data.headers = [];

    for (let i = 0; i < data.meta.fields.length; i++) {
        let field = data.meta.fields[i];

        //check if all values for a header are numeric
        let values = data.data.map(e => e[field]);
        if (!values.some(isNaN)) {
            data.headers.push({attr: field, type: 'continuous'});
        } else {
            data.headers.push({attr: field, type: 'nominal'});
        }
    }

    return data;
}
