const path = require('path');

module.exports = (request, options) => {
  // Redirect .native.ts files to .ts files
  if (request.includes('.native.ts')) {
    const newRequest = request.replace('.native.ts', '.ts');
    try {
      return options.defaultResolver(newRequest, options);
    } catch (e) {
      // fallback to original
    }
  }
  return options.defaultResolver(request, options);
};
