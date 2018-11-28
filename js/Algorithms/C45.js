function c45_instance(data) {
    return new C45(data);
}

class C45 extends AbstractModel {
    constructor(data) {
        super();

        this.title = 'C4.5 Algorithm';
        this.data = data;

        this.targetOutcomes = this.uniqueValues(data.data.map(e => e[data.target]));
        this.targetEntropy = entropy(data.target, this.targetOutcomes, data.data);

        this.data.fields = this.removeField(data.headers, data.target);

        this.tree = {
            chart: {
                container: '#c45-tree'
            }
        };
    }

    run() {
        let time = new Date();

        this.tree.nodeStructure = this.build(this.data.target, this.data.fields, this.data.data);

        time = (new Date - time) / 1000;
        displayResult('Time taken to build model: ' + time);

        console.log(this.tree);

        this.displayTree(this.tree);
    }

    build(target, fields, values, parentCondition) {
        if (this.isLeaf(values)) {
            let rValues = this.remainingTargetOutcomes(values);
            let node = {
                text: {
                    name: rValues[0] + ' (' + values.length + ')'
                },
                data: {
                    attr: rValues[0]
                }
            };
            return {
                text: {
                    name: {
                        val: parentCondition,
                        href: '#'
                    },

                },
                children: [node],
                parentCondition: parentCondition,
                isCondition: true
            }
        }

        let node = {
            data: {},
            children: []
        };

        if (parentCondition)
            node.parentCondition = parentCondition;

        node.data = this.bestGainRatio(target, fields, values);
        let subsets;
        if (node.data.type === 'continuous')
            subsets = this.splitValuesContinuous(node.data.attr, node.data.condition, values);
        else
            subsets = this.splitValues(node.data.attr, values);

        subsets.forEach(function (subset) {
            node.children.push(this.build(target, fields, subset.values, subset.condition));
        }, this);

        node.text = {
            name: node.data.attr
        };

        if (parentCondition)
            return {
                text: {
                    name: {
                        val: node.parentCondition,
                        href: '#'
                    }
                },
                children: [node],
                parentCondition,
                isCondition: true
            };
        return node;
    }

    uniqueValues(values) {
        let unique = new Set();

        //loop through all data entries to find unique values
        for (let i = 0; i < values.length; i++) {
            unique.add(values[i]);
        }
        return Array.from(unique.values());
    }

    // Entropy(target) – ∑ ( p(target|field) . Entropy(target|field) )
    gainRatio(target, fieldattr, values) {
        let uniques = this.uniqueValues(values.map(e => e[fieldattr]));

        let gain = this.targetEntropy;
        let splits = [];

        uniques.forEach(function (unique) {
            let subset = values.filter(e => e[fieldattr] === unique);

            let ent = entropy(target, this.targetOutcomes, subset);

            let prob = subset.length / values.length;
            splits.push(prob);

            gain += -prob * ent;
        }, this);

        let gainRatio = gain / this.splitInfo(splits);
        if (isNaN(gainRatio) || gainRatio === Infinity)
            gainRatio = 0;

        console.debug('gain: ' + gain + ' | gainRatio: ' + gainRatio + ' | splitInfo: ' + this.splitInfo(splits));

        return {
            attr: fieldattr,
            type: 'nominal',
            gain: gainRatio
        };
    }

    gainRatioContinuous(target, fieldattr, values) {
        const conditions = this.continuousValues(fieldattr, values);

        let bestCond = -Infinity;
        let bestGain = -1;
        let bestGainRatio = -1;

        conditions.forEach(function (cond) {
            let subsetLess = values.filter(e => parseFloat(e[fieldattr]) <= cond);
            let subsetGreater = values.filter(e => parseFloat(e[fieldattr]) > cond);

            let pLess = subsetLess.length / values.length;
            let pGreater = subsetGreater.length / values.length;

            let entropyLess = entropy(target, this.targetOutcomes, subsetLess);
            let entropyGreater = entropy(target, this.targetOutcomes, subsetGreater);

            let gain = this.targetEntropy - pLess * entropyLess - pGreater * entropyGreater;
            let gainRatio = gain / this.splitInfo([pLess, pGreater]);
            if (isNaN(gainRatio) || gainRatio === Infinity)
                gainRatio = 0;

            if (gain > bestGain) {
                bestCond = cond;
                bestGain = gain;
                bestGainRatio = gain;
            }

            console.debug('cond: ' + cond + ' | gain: ' + gain + ' | gainRatio: ' + gainRatio);
            console.debug('sLess: ' + subsetLess.length + ' | sGreater: ' + subsetGreater.length + ' | eLess: ' + entropyLess + ' | eGreater: ' + entropyGreater);
            console.debug('splitInfo [' + pLess + ', ' + pGreater + ']: ' + this.splitInfo([pLess, pGreater]));
        }, this);

        return {
            attr: fieldattr,
            type: 'continuous',
            gain: bestGainRatio,
            condition: bestCond
        };
    }

    // ∑ -|Dj|/|D| x log2|Dj|/|D|
    splitInfo(probs) {
        return probs.reduce((acc, e) => acc + -e * log2(e), 0);
    }

    bestGainRatio(target, fields, values) {
        let bestField = {gain: -1};

        let result;
        fields.forEach(function (field) {
            if (field.type === 'continuous')
                result = this.gainRatioContinuous(target, field.attr, values);
            else
                result = this.gainRatio(target, field.attr, values);

            console.log(result);

            if (result.gain >= bestField.gain)
                bestField = result;
        }, this);

        console.log("---BEST---");
        console.log(bestField);
        console.log("---BEST---");

        return bestField;
    }

    continuousValues(field, values) {
        values = values.map(e => parseFloat(e[field]));
        values = values.sort(compare);
        return this.uniqueValues(values);
    }

    removeField(fields, toRemove) {
        return fields.filter(e => e.attr !== toRemove);
    }

    splitValues(fieldattr, values) {
        let result = [];
        let attrs = {};
        let attrsCount = 0;

        values.forEach(function (value) {
            let d = value[fieldattr];
            if (!attrs.hasOwnProperty(d)) {
                attrs[d] = attrsCount;
                result[attrs[d]] = {
                    condition: d,
                    values: []
                };
                attrsCount++;
            }
            result[attrs[d]].values.push(value);
        });
        return result;
    }

    splitValuesContinuous(fieldattr, condition, values) {
        let lessValues = {
            condition: '<= ' + condition,
            values: []
        };
        let greaterValues = {
            condition: '> ' + condition,
            values: []
        };

        values.forEach(function (value) {
            if (value[fieldattr] <= condition)
                lessValues.values.push(value);
            else
                greaterValues.values.push(value);
        });

        return [
            lessValues,
            greaterValues
        ];
    }

    isLeaf(values) {
        return this.remainingTargetOutcomes(values).length === 1;
    }

    remainingTargetOutcomes(values) {
        return this.uniqueValues(values.map(e => e[this.data.target]))
    }

    classify(value) {
        if (this.tree === {})
            throw new Error('C4.4 Model tree has not been trained yet.');

        let node = this.tree.nodeStructure;

        while (true) {
            if (node.isCondition) {
                node = node.children[0];
                continue;
            }

            if (!node.children || node.children.length === 0)
                return node.data.attr;

            let attrVal = value[node.data.attr];

            if (node.data.type === 'continuous') {
                // Continuous data always has 2 children (<=, >)
                if (attrVal <= node.data.condition)
                    node = node.children[0];
                else
                    node = node.children[1];
            } else {
                // loop through children looking for matching nominal value
                for (let i = 0; i < node.children.length; i++) {
                    if (attrVal === node.children[i].parentCondition) {
                        node = node.children[i];
                        break;
                    }
                }
            }
        }
    }

    displayTree() {
        appendResultElement('<div id="c45-tree"></div>');

        new Treant(this.tree);
    }
}

// ∑ – p(I) . log2p(I)
function entropy(target, conditions, values) {
    let a = conditions.map(function (c) {
        let p = probs(target, c, values);
        return p === 0 ? 0 : -p * log2(p); //log2 errors on 0
    });

    return a.reduce((acc, el) => acc + el, 0);
}

function probs(target, condition, values) {
    if (values.length === 0) return 0;
    return values.filter(e => e[target] === condition).length / values.length;
}

function log2(x) {
    if (x === 0) return x;
    return Math.log2(x);
}

function compare(a, b) {
    return a - b;
}
