module.exports = {calculate, validate};

function calculate(params) {
    /** Sample async calculation code */
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const sum = Object.values(params).reduce((a, b) => a + b);
            resolve({sum});
        }, 200);
    });
}

/**
 * Validate parameters to ensure malicious objects are not processed
 * @param {object} params 
 */
function validate(params) {
    /** Implement validation logic */
    return true;
}