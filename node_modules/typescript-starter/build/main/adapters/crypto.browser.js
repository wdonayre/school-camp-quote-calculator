"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Must first be built by browserify.
// https://github.com/rollup/rollup-plugin-commonjs/issues/105#issuecomment-281917166
const hash_js_1 = require("hash.js");
/**
 * Simulate the Node.js crypto.createHash function using hash.js' implementation.
 * @internal
 * @hidden (TypeDoc currently doesn't understand @internal)
 */
function createHash(algorithm) {
    return hash_js_1.default.sha256();
}
exports.createHash = createHash;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLmJyb3dzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYWRhcHRlcnMvY3J5cHRvLmJyb3dzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBcUM7QUFDckMscUZBQXFGO0FBQ3JGLHFDQUEwQjtBQUUxQjs7OztHQUlHO0FBQ0gsb0JBQTRCLFNBQW1CO0lBQzdDLE1BQU0sQ0FBQyxpQkFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ3RCLENBQUM7QUFGRCxnQ0FFQyJ9