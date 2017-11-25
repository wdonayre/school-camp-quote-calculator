// Must first be built by browserify.
// https://github.com/rollup/rollup-plugin-commonjs/issues/105#issuecomment-281917166
import hash from 'hash.js';
/**
 * Simulate the Node.js crypto.createHash function using hash.js' implementation.
 * @internal
 * @hidden (TypeDoc currently doesn't understand @internal)
 */
export function createHash(algorithm) {
    return hash.sha256();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLmJyb3dzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYWRhcHRlcnMvY3J5cHRvLmJyb3dzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscUNBQXFDO0FBQ3JDLHFGQUFxRjtBQUNyRixPQUFPLElBQUksTUFBTSxTQUFTLENBQUE7QUFFMUI7Ozs7R0FJRztBQUNILE1BQU0scUJBQXNCLFNBQW1CO0lBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDdEIsQ0FBQyJ9