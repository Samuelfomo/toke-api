export default class W {
    /**
     * Asynchronous function to check if a given condition has occurred and throw an error with a specified message if true.
     *
     * @function
     * @param {any} occurred - The condition to evaluate. If truthy, an error will be thrown.
     * @param {string} message - The error message to be used in the thrown error if the condition is truthy.
     * @throws {Error} Throws an error with the provided message if the condition is truthy.
     */
    static isOccur = async function (occurred: any, message: string) {
        if (occurred) throw new Error(message);
    };
}
