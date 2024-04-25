import http from "../../shared/services/http-common.js";

/**
 * TutorialsApiService class
 * @description Service class for making HTTP requests to the API
 */

export class TutorialsApiService {
    /**
     * Get all tutorials
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    getAll() {
        return http.get('/tutorials');
    }

    /**
     * Get tutorial by id
     * @param id
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    getById(id) {
        return http.get(`/tutorials/${id}`);
    }

    /**
     * Create a new tutorial
     * @param tutorialResource - tutorial object to create
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    create(tutorialResource) {
        return http.post('/tutorials', tutorialResource);
    }

    /**
     * Update a tutorial
     * @param id - tutorial id to update
     * @param tutorialResource - tutorial object with data
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    update(id, tutorialResource) {
        return http.put(`/tutorials/${id}`, tutorialResource);
    }

    /**
     * Delete a tutorial
     * @param id - tutorial id to delete
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    delete(id) {
        return http.delete(`/tutorials/${id}`);
    }

    /**
     * Delete all tutorials that match the given title
     * @param title - tutorial title to apply as criteria
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    findByTitle(title) {
        return http.get(`/tutorials?title=${title}`);
    }
}