/**
 * Has Dependencies
 *
 * @author Alin Eugen Deac <aedart@gmail.com>
 */
export default class HasDependencies {

    /**
     * Returns a list of abstracts, aliases or objects
     *
     * @returns {Array<string|Object>}
     *
     * @throws {TypeError}
     */
    static dependencies(){
        throw new TypeError('Method must be implemented in sub-class');
    }
}