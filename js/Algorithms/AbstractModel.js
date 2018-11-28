class AbstractModel {
    constructor() {
        this.title = 'Algorithm Title Not Set.';
        if (this.constructor === AbstractModel) {
            throw new TypeError('Abstract class "AbstractModel" cannot be instantiated directly.');
        }
    }

    run() {
    }

    classify() {
    }
}
