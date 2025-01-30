// Importing required modules
const { ValidationError } = require("@hapi/joi");

/**
 * Returns a custom error object with descriptive messages.
 *
 * @param {Map<string, ValidationError>} errors - Map of Joi validation errors.
 * @returns {Object} - Record of error messages.
 */
function joiErrorFormatter(errors) {
  return Array.from(errors.keys()).reduce(function (acc, path) {
    const details =
      errors.get(path)?.details || (errors.get(path) instanceof Error && errors.get(path).details);

    if (details) {
      for (let index = 0; index < details.length; index++) {
        const error = details[index];
        const key = error.path[0] || "error";
        acc[key] = error.message.replace(/"/g, "");
      }
    }

    return acc;
  }, {});
}

module.exports = joiErrorFormatter;
