module.exports = function calculate(params) {
    /** Sample async calculation code */
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const sum = Object.values(params).reduce((a, b) => a + b);
            resolve({sum});
        }, 200);
    });
}