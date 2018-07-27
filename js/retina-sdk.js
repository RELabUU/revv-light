/**
 * Main Cortical.io Retina SDK Client module.
 */
var retinaSDK = {};

/**
 * Cortical.io Full Retina SDK client.
 */
retinaSDK.FullClient = (function (apiKey, apiServer, retina) {

    if (typeof apiKey == 'undefined') {
        throw new Error('Required apiKey argument was missing.');
    }

    if (typeof apiServer == 'undefined') {
        apiServer = "http://api.cortical.io/rest/";
    }

    if (typeof retina == 'undefined') {
        retina = "en_associative";
    }

    /**
     * Sends an HTTP request.
     *
     * @param url the URL to send the request to.
     * @param type the type of URL request to perform.
     * @param params request parameters.
     * @param callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    function sendRequest(url, type, params, callbacks) {

        // Prepend API server to request URL
        url = apiServer + url;

        if (params == null || typeof params == 'undefined') {
            params = {};
        }

        // Create request
        var httpRequest = new XMLHttpRequest();
        var isAsync = (typeof callbacks != 'undefined' && typeof callbacks.success == 'function');
        httpRequest.open(type, url, isAsync);

        // Set request header depending on endpoint being called
        if (url.indexOf("/image") >= 0 && url.indexOf("bulk") == -1) {
            httpRequest.setRequestHeader("Accept", "image/png");
        } else {
            httpRequest.setRequestHeader("Accept", "application/json");
        }
        httpRequest.setRequestHeader("Content-type", "application/json");
        httpRequest.setRequestHeader("api-key", apiKey);
        httpRequest.setRequestHeader("api-client", "js_1.0");

        if (isAsync) {
            // Send asynchronous request and call configured callback functions on success/error
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                    if (httpRequest.responseURL.indexOf("/rest/image") == -1 || httpRequest.responseURL.indexOf("/rest/image/bulk") >= 0) {
                        callbacks.success(JSON.parse(httpRequest.responseText));
                    } else {
                        callbacks.success((httpRequest.responseText));
                    }
                } else if (httpRequest.readyState == 4 && httpRequest.status != 200 && typeof callbacks.error == 'function') {
                    callbacks.error(httpRequest.responseText);
                }
            };
            httpRequest.send(params);
        } else {
            // Send synchronous request and return response
            httpRequest.send(params);
            if (httpRequest.responseURL.indexOf("/rest/image") == -1 || httpRequest.responseURL.indexOf("/rest/image/bulk") >= 0) {
                return JSON.parse(httpRequest.responseText);
            } else {
                return httpRequest.responseText;
            }
        }
    }

    /**
     * Sends an HTTP GET request.
     *
     * @param url the URL to send the request to.
     * @param params request parameters.
     * @param callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    function get(url, params, callbacks) {
        // Add default retina_name parameter if needed
        if (params && typeof params.retina_name == 'undefined' && url.indexOf("retinas") == -1) {
            params.retina_name = retina;
        }
        url = constructUrl(url, params);
        return sendRequest(url, "GET", null, callbacks);
    }

    /**
     * Sends an HTTP POST request.
     *
     * @param url the URL to send the request to.
     * @param params request parameters.
     * @param callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    function post(url, params, callbacks) {
        // Add default retina_name parameter if needed
        if (params && typeof params.retina_name == 'undefined') {
            params.retina_name = retina;
        }
        url = constructUrl(url, params);
        return sendRequest(url, "POST", JSON.stringify(params.body), callbacks);
    }

    /**
     * Appends parameters to URL string.
     *
     * @param url the URL string for the HTTP request.
     * @param params map containing properties and their values to be appended to the URL.
     * @returns {*}
     */
    function constructUrl(url, params) {
        // Append params to URL
        var first = true;
        for (var key in params) {
            if (key == 'body') {
                continue;
            }
            if (first) {
                url = url + "?";
                first = false;
            } else {
                url = url + "&";
            }
            if (params.hasOwnProperty(key)) {
                var name = key;
                var value = params[key];
                url = url + name + "=" + value
            }
        }
        return url;
    }

    /**
     * Checks a given object for specified required parameters.
     *
     * @param params the object to inspect.
     * @param required array of required parameter names.
     */
    function checkForRequiredParameters(params, required) {
        for (var i = 0; i < required.length; i++) {
            var key = required[i];
            if (typeof params[key] == 'undefined') {
                throw new Error("Required request parameter '" + key + "' was not set.");
            }
        }
    }

    /**
     * Extracts the positions array from an array containing a single Fingerprint object.
     *
     * @param data the array to extract the positions array from.
     * @returns {Array}
     */
    function extractPositionsFromFingerprintArray(data) {
        if (typeof data != 'undefined') {
            return data[0].positions;
        }
    }

    /**
     * Extracts the positions array from a Fingerprint object.
     *
     * @param fingerprint
     * @returns {Array}
     */
    function extractPositionsFromFingerprint(fingerprint) {
        if (typeof fingerprint != 'undefined') {
            return fingerprint.positions;
        }
    }

    /**
     * Wraps a callback function with a pre-processing function that transforms data before passing it to the callback.
     *
     * @param callback the callback function to wrap.
     * @param wrapper the wrapping function.
     * @returns {*}
     */
    function wrapCallback(callback, wrapper) {
        if (typeof callback != 'undefined') {
            var originalCallback = callback;
            callback = function (data) {
                var response = wrapper(data);
                originalCallback(response);
            }
        }
        return callback;
    }

    /**
     * Converts a single callback function to a callbacks object with the passed callback defined as the success
     * function.
     *
     * @param callback the callback function to wrap.
     * @returns {{success: *}}
     */
    function wrapAsSuccessCallback(callback) {
        return {success: callback};
    }

    /**
     * Creates an array of expressions from an array of strings.
     *
     * @param strings
     * @returns {Array}
     */
    function createExpressionsArray(strings) {
        var expressions = [];
        var length = strings.length;
        for (var i = 0; i < length; i++) {
            expressions.push({text: strings[i]});
        }
        return expressions;
    }

    // Public methods
    var api = {};

    /**
     * Returns information about Retinas as an array of Retina objects.
     *
     * Required parameters: none
     *
     * Optional parameters: retina_name (string)
     *
     * If no value is specified for the retina_name parameter, this method returns an overview of all available
     * Retinas.
     *
     * If a specific Retina is chosen, then only information about that Retina is returned.
     *
     * Response format: [object {description: string, numberOfColumns: number, numberOfRows: number,
     * numberOfTermsInRetina: number, retinaName: string}]
     *
     * @param params
     * @param callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getRetinas = function (params, callbacks) {
        if (typeof params == 'function') {
            callbacks = wrapAsSuccessCallback(params);
            params = undefined;
        } else if (params && typeof params.success == 'function') {
            callbacks = params;
            params = undefined;
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        return get("retinas", params, callbacks);
    };

    /**
     * Returns information about terms as an array of term objects.
     *
     * Required parameters: none
     *
     * Optional parameters: term (string), start_index (number), max_results (number), get_fingerprint (boolean)
     *
     * When the term parameter is not specified, a listing of all terms in the Retina will be returned. Otherwise
     * this method returns a term object with meta-data for an exact match, or a list of potential Retina terms if
     * the string contains one or more of the wildcard characters, '*' and '?'. The wildcard characters must be
     * initially preceded by at least 3 characters.
     *
     * The asterisk wildcard, '*', represents zero or more characters.
     *
     * The question mark wildcard, '?', represents exactly one character.
     *
     * If the start_index parameter for this method is not specified, the default of 0 will be assumed.
     *
     * If the max_results parameter for this method is not specified, the default of 10 will be assumed.
     *
     * For this method the maximum number of results per page is limited to 1000.
     *
     * If the get_fingerprint parameter is set to true, fingerprints will be returned as part of the response object.
     *
     * Response format: [object {df: number, fingerprint: object {positions: [number]}, pos_types: [string],
     * score: number, term: string}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getTerms = function (params, callbacks) {
        if (typeof params == 'function') {
            callbacks = wrapAsSuccessCallback(params);
            params = undefined;
        } else if (params && typeof params.success == 'function') {
            callbacks = params;
            params = undefined;
        } else if (typeof params == 'string') {
            params = {term: params}
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        return get("terms", params, callbacks);
    };

    /**
     * Returns an array of all the contexts for a given term.
     *
     * Required parameters: term (string)
     *
     * Optional parameters: start_index (number), max_results (number), get_fingerprint (boolean)
     *
     * If the start_index parameter for this method is not specified, the default of 0 will be assumed.
     *
     * If the max_results parameter for this method is not specified, then the default value of 5 will be assumed.
     * Each term can have as many different contexts as semantic meanings.
     *
     * If the get_fingerprint parameter is set to true, fingerprints will be returned as part of the response object.
     *
     * Response format: [object {context_id: number, context_label: string, fingerprint: object {positions:
     * [number]}}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getContextsForTerm = function (params, callbacks) {
        if (typeof params == 'string') {
            params = {term: params}
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ["term"]);
        return get("terms/contexts", params, callbacks);
    };

    /**
     * Returns an array of similar terms for the specified input term.
     *
     * Required parameters: term (string)
     *
     * Optional parameters: context_id (number), start_index (number), max_results (number), pos_type (string),
     * get_fingerprint (boolean)
     *
     * If any valid context_id is specified the method returns similar terms for the term in this specific context.
     * If the context_id parameter is not specified, this method returns a list of similar terms over all contexts.
     *
     * If the start_index parameter for this method is not specified, the default of 0 will be assumed.
     *
     * If the max_results parameter for this method is not specified, then the default value of 10 will be assumed.
     * For this method the maximum number of results per page is limited to 1000.
     *
     * The pos_type parameter enables filtering of the results by parts of speech (one of: NOUN, VERB, ADJECTIVE).
     * If this parameter is unspecified, (null), no filtering will occur.
     *
     * If the get_fingerprint parameter is set to true, fingerprints will be returned as part of the response object.
     *
     * Response format: [object {df: number, fingerprint: object {positions: [number]}, pos_types: [string],
     * score: number, term: string}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getSimilarTermsForTerm = function (params, callbacks) {
        if (typeof params == 'string') {
            params = {term: params}
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ["term"]);
        return get("terms/similar_terms", params, callbacks);
    };

    /**
     * Returns a Retina representation (a Fingerprint) of the input text.
     *
     * Required parameters: an input text (string) to encode into a Fingerprint.
     *
     * Optional parameters: none
     *
     * Response format: [number]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getFingerprintForText = function (params, callbacks) {
        if (typeof params == 'string') {
            params = {body: params}
        } else if (typeof params.text != 'undefined') {
            params.body = params.text;
            delete params.text;
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        if (callbacks && typeof callbacks.success == 'function') {
            callbacks.success = wrapCallback(callbacks.success, extractPositionsFromFingerprintArray);
        }
        return extractPositionsFromFingerprintArray(post("text", params, callbacks))
    };

    /**
     * Returns an array of keywords from the input text.
     *
     * Required parameters: An input text (string) to retrieve keywords for.
     *
     * Optional parameters: none
     *
     * Response format: [string]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getKeywordsForText = function (params, callbacks) {
        if (typeof params == 'string') {
            params = {body: params}
        } else if (typeof params.text != 'undefined') {
            params.body = params.text;
            delete params.text;
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        return post("text/keywords", params, callbacks);
    };

    /**
     * Given an input text, this method returns an array of sentences (each of which is a comma-separated list of
     * tokens).
     *
     * Required parameters: an object with a body field containing an input text (string) to retrieve tokens for.
     *
     * Optional parameters: pos_tags (string)
     *
     * Part of speech tags (POStags) can be passed in a comma-separated list. If the POStags parameter is
     * left blank, terms of all types are retrieved, otherwise this method will return only the terms corresponding
     * to the requested parts of speech. The tags are described in more detail in the cortical.io Documentation
     * website (http://documentation.cortical.io/working_with_text.html#pos-tags).
     *
     * Response format: [string]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getTokensForText = function (params, callbacks) {
        if (typeof params == 'string') {
            params = {body: params}
        } else if (typeof params.text != 'undefined') {
            params.body = params.text;
            delete params.text;
        }
        if (params['pos_tags']) {
            params['POStags'] = params['pos_tags'];
            delete params['pos_tags'];
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['body']);
        return post('text/tokenize', params, callbacks);
    };

    /**
     * Returns an array of text objects corresponding to the input text, divided according to topic changes.
     *
     * Required parameters: an object with a body field containing an input text (string) to slice.
     *
     * Optional parameters: start_index (number), max_results (number), get_fingerprint (boolean)
     *
     * If the start_index parameter for this method is not specified, the default of 0 will be assumed.
     *
     * If the max_results parameter for this method is not specified, the default of 10 will be assumed. The maximum
     * number of results per page is limited to 100.
     *
     * The returned list of texts is ordered according to where the text slice appears in the input text. A Text
     * object consists of a text slice (defined as a slice by the Retina) and a Fingerprint object
     * corresponding to the text slice.
     *
     * If the get_fingerprint parameter is set to true, fingerprints will be returned as part of the response object.
     *
     * Response format: [object {fingerprint: object {positions: [number]}, text: string}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getSlicesForText = function (params, callbacks) {
        if (typeof params == 'string') {
            params = {body: params}
        } else if (typeof params.text != 'undefined') {
            params.body = params.text;
            delete params.text;
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['body']);
        return post('text/slices', params, callbacks);
    };

    /**
     * Returns an array of Retina representations (Fingerprints) of each input text.
     *
     * Required parameters: texts (array of texts to encode)
     *
     * Optional parameters: sparsity (number)
     *
     * If the sparsity parameter is specified, the resulting Fingerprints will be sparsified to this percentage.
     *
     * Response format: [object {positions: [number]}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getFingerprintsForTexts = function (params, callbacks) {
        var length = 0;
        var i = 0;
        if (Array.isArray(params)) {
            length = params.length;
            for (i = 0; i < length; i++) {
                params[i] = {"text": params[i]};
            }
            params = {body: params};
        } else if (typeof params['texts'] != 'undefined') {
            length = params['texts'].length;
            for (i = 0; i < length; i++) {
                params['texts'][i] = {"text": params['texts'][i]};
            }
            params.body = params['texts'];
            delete params['texts'];
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['body']);
        return post('text/bulk', params, callbacks);
    };

    /**
     * Returns an object containing information about the language of the specified text.
     *
     * Required parameters: a string to return the language for.
     *
     * Optional parameters: none
     *
     * This method is capable of identifying more than 50 languages. For best results it is recommended that input
     * texts consist of a minimum of 10 words (approximately 40 to 50 characters).
     *
     * Response format: object {language: string, iso_tag: string, wiki_url: string}
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getLanguageForText = function (params, callbacks) {
        if (typeof params == 'string') {
            params = {body: params};
        } else if (typeof params.text != 'undefined') {
            params.body = params.text;
            delete params.text;
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['body']);
        return post('text/detect_language', params, callbacks);
    };

    /**
     * Returns a Retina representation (a Fingerprint) of the input expression.
     *
     * Required parameters: expression (JSON object encapsulating a Semantic Expression).
     *
     * Optional parameters: sparsity (number)
     *
     * If the sparsity parameter is specified, the resulting Fingerprints will be sparsified to this percentage.
     * This parameter is only interpreted when in the range (0,1), and only applied, if the fingerprint is more
     * dense than the desired sparsity level.
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: [number]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getFingerprintForExpression = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        if (callbacks && typeof callbacks.success == 'function') {
            callbacks.success = wrapCallback(callbacks.success, extractPositionsFromFingerprint);
        }
        if (typeof params == 'string') {
            params = {body: {text: params}}
        } else {
            checkForRequiredParameters(params, ['expression']);
            params['body'] = params['expression'];
            delete params['expression'];
        }
        return extractPositionsFromFingerprint(post('expressions', params, callbacks));
    };

    /**
     * Returns an array of contexts for the input expression.
     *
     * Required parameters: expression (JSON object encapsulating a Semantic Expression).
     *
     * Optional parameters: start_index (number), max_results (number), get_fingerprint (boolean), sparsity (number)
     *
     * If the start_index parameter for this method is not specified, the default of 0 will be assumed.
     *
     * If the max_results parameter for this method is not specified, then the default value of 5 will be assumed.
     * Each term can have as many different contexts as semantic meanings.
     *
     * If the get_fingerprint parameter is set to true, fingerprints will be returned as part of the response object.
     *
     * If the sparsity parameter is specified, the resulting Fingerprints will be sparsified to this percentage.
     * This parameter is only interpreted when in the range (0,1), and only applied, if the fingerprint is more
     * dense than the desired sparsity level.
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: [object {context_id: number, context_label: string, fingerprint: object {positions:
     * [number]}}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getContextsForExpression = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        if (typeof params == 'string') {
            params = {body: {text: params}}
        } else {
            checkForRequiredParameters(params, ['expression']);
            params['body'] = params['expression'];
            delete params['expression'];
        }
        return post('expressions/contexts', params, callbacks);
    };

    /**
     * Returns an array of similar terms for the input expression.
     *
     * Required parameters: expression (JSON object encapsulating a Semantic Expression).
     *
     * Optional parameters: context_id (number), start_index (number), max_results (number), pos_type (string),
     * sparsity (number), get_fingerprint (boolean)
     *
     * If any valid context_id is specified the method returns similar terms for the term in this specific context.
     * If the context_id parameter is not specified, this method returns a list of similar terms over all contexts.
     *
     * If the start_index parameter for this method is not specified, the default of 0 will be assumed.
     *
     * If the max_results parameter for this method is not specified, then the default value of 5 will be assumed.
     * Each term can have as many different contexts as semantic meanings.
     *
     * The pos_type parameter enables filtering of the results by parts of speech (one of: NOUN, VERB, ADJECTIVE).
     * If this parameter is unspecified, no filtering will occur.
     *
     * If the sparsity parameter is specified, the resulting Fingerprints will be sparsified to this percentage.
     * This parameter is only interpreted when in the range (0,1), and only applied, if the fingerprint is more
     * dense than the desired sparsity level.
     *
     * If the get_fingerprint parameter is set to true, fingerprints will be returned as part of the response object.
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: [object {df: number, fingerprint: object {positions: [number]}, pos_types: [string],
     * score: number, term: string}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getSimilarTermsForExpression = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        if (typeof params == 'string') {
            params = {body: {text: params}}
        } else {
            checkForRequiredParameters(params, ['expression']);
            params['body'] = params['expression'];
            delete params['expression'];
        }
        return post('expressions/similar_terms', params, callbacks);
    };

    /**
     * Returns an array of Retina representations (Fingerprints) for an array of input expressions.
     *
     * Required parameters: expressions (array of JSON objects encapsulating Semantic Expressions).
     *
     * Optional parameters: sparsity (number)
     *
     * If the sparsity parameter is specified, the resulting Fingerprints will be sparsified to this percentage.
     * This parameter is only interpreted when in the range (0,1), and only applied, if the fingerprint is more
     * dense than the desired sparsity level.
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: [object {positions: [number]}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getFingerprintsForExpressions = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['expressions']);
        params['body'] = params['expressions'];
        delete params['expressions'];
        return post('expressions/bulk', params, callbacks);
    };

    /**
     * Returns an array of context arrays for the input expressions.
     *
     * Required parameters: expressions (array of JSON objects encapsulating Semantic Expressions).
     *
     * Optional parameters: start_index (number), max_results (number), sparsity (number), get_fingerprint (boolean)
     *
     * If the start_index parameter for this method is not specified, the default of 0 will be assumed.
     *
     * If the max_results parameter for this method is not specified, then the default value of 5 will be assumed.
     * Each term can have as many different contexts as semantic meanings.
     *
     * If the sparsity parameter is specified, the resulting Fingerprints will be sparsified to this percentage.
     * This parameter is only interpreted when in the range (0,1), and only applied, if the fingerprint is more
     * dense than the desired sparsity level.
     *
     * If the get_fingerprint parameter is set to true, fingerprints will be returned as part of the response object.
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: [[object {context_id: number, context_label: string, fingerprint: object {positions:
     * [number]}}]]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getContextsForExpressions = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['expressions']);
        params['body'] = params['expressions'];
        delete params['expressions'];
        return post('expressions/contexts/bulk', params, callbacks);
    };

    /**
     * Returns an array of Term object arrays containing similar terms corresponding to the input array of
     * expressions.
     *
     * Required parameters: expressions (array of JSON objects encapsulating Semantic Expressions).
     *
     * Optional parameters: context_id (number), start_index (number), max_results (number), pos_type
     * (string), sparsity (number), get_fingerprint (boolean)
     *
     * If any valid context_id is specified the method returns similar terms for the term in this specific context.
     * If the context_id parameter is not specified, this method returns a list of similar terms over all contexts.
     *
     * If the start_index parameter for this method is not specified, the default of 0 will be assumed.
     *
     * If the max_results parameter for this method is not specified, then the default value of 5 will be assumed.
     * Each term can have as many different contexts as semantic meanings.
     *
     * The pos_type parameter enables filtering of the results by parts of speech (one of: NOUN, VERB, ADJECTIVE).
     * If this parameter is unspecified, no filtering will occur.
     *
     * If the sparsity parameter is specified, the resulting Fingerprints will be sparsified to this percentage.
     * This parameter is only interpreted when in the range (0,1), and only applied, if the fingerprint is more
     * dense than the desired sparsity level.
     *
     * If the get_fingerprint parameter is set to true, fingerprints will be returned as part of the response object.
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: [[object {df: number, fingerprint: object {positions: [number]}, pos_types: [string],
     * score: number, term: string}]]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getSimilarTermsForExpressions = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['expressions']);
        params['body'] = params['expressions'];
        delete params['expressions'];
        return post('expressions/similar_terms/bulk', params, callbacks);
    };

    /**
     * Returns an object containing distance and similarity measures of the two input expression.
     *
     * Required parameters: comparison (array of JSON object pair encapsulating Semantic Expressions to compare).
     *
     * Optional parameters: none
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: object {cosineSimilarity: number, euclideanDistance: number, jaccardDistance: number,
     * overlappingAll: number, overlappingLeftRight: number, overlappingRightLeft: number, sizeLeft: number,
     * sizeRight: number, weightedScoring: number}
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.compare = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['comparison']);
        params = {body: params['comparison']};
        delete params['comparison'];
        return post('compare', params, callbacks);
    };

    /**
     * Returns an array of objects containing distance and similarity measures of the input array of expressions to
     * compare.
     *
     * Required parameters: comparisons (array of JSON object pairs encapsulating Semantic Expressions to compare).
     *
     * Optional parameters: none
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: [object {cosineSimilarity: number, euclideanDistance: number, jaccardDistance: number,
     * overlappingAll: number, overlappingLeftRight: number, overlappingRightLeft: number, sizeLeft: number,
     * sizeRight: number, weightedScoring: number}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.compareBulk = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['comparisons']);
        params = {body: params['comparisons']};
        delete params['comparisons'];
        return post('compare/bulk', params, callbacks);
    };

    /**
     * Returns a visualization as an encoded string of the input expression.
     *
     * Required parameters: expression (JSON object encapsulating a Semantic Expression).
     *
     * Optional parameters: image_scalar (number), plot_shape (string), image_encoding (string), sparsity (number)
     *
     * The image_scalar parameter defines the scale of the output image, by default it is base64 encoded.
     *
     * The plot_shape parameter defines the shape of the output image. If this parameter is unspecified then the
     * default circle will be used.
     *
     * The image_encoding parameter specifies the type of image encoding used.
     *
     * If the sparsity parameter is specified, the resulting Fingerprints will be sparsified to this percentage.
     * This parameter is only interpreted when in the range (0,1), and only applied, if the fingerprint is more
     * dense than the desired sparsity level.
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: string
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getImage = function (params, callbacks) {
        if (typeof params == 'string') {
            params = {body: {text: params}}
        } else {
            checkForRequiredParameters(params, ['expression']);
            params['body'] = params['expression'];
            delete params['expression'];
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        params['image_scalar'] = params['image_scalar'] || '2';
        params['plot_shape'] = params['plot_shape'] || 'circle';
        params['image_encoding'] = params['image_encoding'] || 'base64/png';
        params['sparsity'] = params['sparsity'] || '1.0';
        return post('image', params, callbacks);
    };

    /**
     * Returns an array of visualizations as encoded string of the input expressions.
     *
     * Required parameters: expressions (array of JSON objects encapsulating Semantic Expressions).
     *
     * Optional parameters: image_scalar (number), plot_shape (string), image_encoding (string), sparsity (number),
     * get_fingerprint (boolean)
     *
     * The image_scalar parameter defines the scale of the output image, by default it is base64 encoded.
     *
     * The plot_shape parameter defines the shape of the output image. If this parameter is unspecified then the
     * default circle will be used.
     *
     * The image_encoding parameter specifies the type of image encoding used.
     *
     * If the sparsity parameter is specified, the resulting Fingerprints will be sparsified to this percentage.
     * This parameter is only interpreted when in the range (0,1), and only applied, if the fingerprint is more
     * dense than the desired sparsity level.
     *
     * If the get_fingerprint parameter is set to true, fingerprints will be returned as part of the response object.
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: [object {fingerprint: object {positions: [number]}, image_data: string}]
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.getImages = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['expressions']);
        params['body'] = params['expressions'];
        delete params['expressions'];
        params['image_scalar'] = params['image_scalar'] || '2';
        params['plot_shape'] = params['plot_shape'] || 'circle';
        params['sparsity'] = params['sparsity'] || '1.0';
        params['get_fingerprint'] = params['get_fingerprint'] || 'false';
        return post('image/bulk', params, callbacks);
    };

    /**
     * Returns an overlay image for the two input elements specified by a JSON array containing two expressions.
     *
     * Required parameters: expressions (array of two JSON objects encapsulating two Semantic Expressions)
     *
     * Optional parameters: image_scalar (number), plot_shape (string), image_encoding (string)
     *
     * The image_scalar parameter defines the scale of the output image, by default it is base64 encoded.
     *
     * The plot_shape parameter defines the shape of the output image. If this parameter is unspecified then the
     * default circle will be used.
     *
     * The image_encoding parameter specifies the type of image encoding used.
     *
     * Expressions are built in JSON syntax by combining Retina objects together with the optional operators "and", "or"
     * and "sub". An expression can contain Terms ({"term": "term"}), Fingerprints ({"positions": [1,2,...]}), Texts
     * ({"text": "this is a text"}) and even nested expressions. A detailed explanation of the syntax for
     * expressions, along with examples, can be found here:
     * http://documentation.cortical.io/the_power_of_expressions.html
     *
     * Response format: string
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.compareImage = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['expressions']);
        params['body'] = params['expressions'];
        delete params['expressions'];
        params['image_scalar'] = params['image_scalar'] || '2';
        params['plot_shape'] = params['plot_shape'] || 'circle';
        params['image_encoding'] = params['image_encoding'] || 'base64/png';
        return post('image/compare', params, callbacks);
    };

    /**
     * Returns a Semantic Fingerprint used to filter texts by intelligently piecing together positive and negative
     * examples of texts that should be positively and negatively classified by the filter.
     *
     * Required parameters: filter_name (string) and positive_examples (array of strings representing positive examples
     * for the filter).
     *
     * Optional parameters: negative_examples (array of strings representing negative examples for the filter).
     *
     * Response format: object {categoryName: string, positions: [number]}
     *
     * @param params
     * @param callbacks callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    api.createCategoryFilter = function (params, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        checkForRequiredParameters(params, ['filter_name']);
        checkForRequiredParameters(params, ['positive_examples']);
        if (!Array.isArray(params['positive_examples'])) {
            throw new Error('Input to createCategoryFilter was not an array');
        }

        // Reconstruct params object
        params.body = {};
        params.body['positiveExamples'] = createExpressionsArray(params['positive_examples']);
        delete params['positive_examples'];
        if (typeof params['negative_examples'] != 'undefined') {
            if (!Array.isArray(params['negative_examples'])) {
                throw new Error('Input to createCategoryFilter was not an array');
            }
            params.body['negativeExamples'] = createExpressionsArray(params['negative_examples']);
            delete params['negative_examples'];
        }
        return post('classify/create_category_filter', params, callbacks);
    };

    return api;

});

/**
 * Cortical.io Lightweight Retina SDK client.
 */
retinaSDK.LiteClient = (function (apiKey, apiServer, retina) {

    var full = new retinaSDK.FullClient(apiKey, apiServer, retina);

    // Lightweight SDK module.
    var lite = {};

    /**
     * Returns an array of similar terms for a given term.
     *
     * @param input the input to retrieve similar terms for (String or Fingerprint).
     * @param callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    lite.getSimilarTerms = function (input, callbacks) {
        if (typeof input == 'string') {
            input = {text: input};
        } else if (Array.isArray(input) && input.length > 0 && typeof input[0] == 'number') {
            input = {positions: input};
        } else {
            throw new Error('Invalid input for getSimilarTerms call: ' + input);
        }
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        if (callbacks && typeof callbacks.success == 'function') {
            callbacks.success = wrapCallback(callbacks.success, extractSimilarTerms);
        }
        var response = full.getSimilarTermsForExpression({expression: input, max_results: 20}, callbacks);
        return extractSimilarTerms(response);
    };

    /**
     * Returns an array of keywords for a given text.
     *
     * @param text the text to retrieve keywords from.
     * @param callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    lite.getKeywords = function (text, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        return full.getKeywordsForText(text, callbacks);
    };

    /**
     * Returns a Fingerprint representation for a given text.
     *
     * @param text the text to compute a Fingerprint for.
     * @param callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    lite.getFingerprint = function (text, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        return full.getFingerprintForText(text, callbacks);
    };

    /**
     * Returns the cosine similarity of two comparable objects (either Strings or Fingerprint positions).
     *
     * @param object1 a comparable object (String or Fingerprint).
     * @param object2 a comparable object (String or Fingerprint).
     * @param callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    lite.compare = function (object1, object2, callbacks) {

        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        if (callbacks && typeof callbacks.success == 'function') {
            callbacks.success = wrapCallback(callbacks.success, extractCosineSimilarity);
        }
        var response;

        if (typeof object1 == 'string' && typeof object2 == 'string') {
            response = full.compare({comparison: [{text: object1}, {text: object2}]}, callbacks);
        } else if (Array.isArray(object1) && Array.isArray(object2)) {
            response = full.compare({comparison: [{positions: object1}, {positions: object2}]}, callbacks);
        } else if (typeof object1 == 'string' && Array.isArray(object2)) {
            response = full.compare({comparison: [{text: object1}, {positions: object2}]}, callbacks);
        } else if (Array.isArray(object1) && typeof object2 == 'string') {
            response = full.compare({comparison: [{positions: object1}, {text: object2}]}, callbacks);
        } else {
            throw new Error("Unable to compute cosine similarity between '" + object1 + "' and '" + object2 + "'");
        }

        return extractCosineSimilarity(response);
    };

    /**
     * Creates a category filter Fingerprint from an array of positive example texts.
     *
     * @param positive_examples
     * @param callbacks optional object containing functions to process the response and handle errors.
     * @returns {*}
     */
    lite.createCategoryFilter = function (positive_examples, callbacks) {
        if (typeof callbacks == 'function') {
            callbacks = wrapAsSuccessCallback(callbacks);
        }
        if (callbacks && typeof callbacks.success == 'function') {
            callbacks.success = wrapCallback(callbacks.success, extractPositions);
        }

        return extractPositions(full.createCategoryFilter({
            filter_name: 'anonymous', positive_examples: positive_examples
        }, callbacks));
    };

    /**
     * Extracts the cosine similarity from a response containing distance and similarity measures.
     *
     * @param response the response to extract the cosine similarity field from.
     * @returns {*}
     */
    function extractCosineSimilarity(response) {
        if (typeof response != 'undefined') {
            return response.cosineSimilarity;
        }
    }

    /**
     * Extracts the string representations from a response object containing a collecting of terms.
     *
     * @param response the response object to extract terms from.
     * @returns {Array}
     */
    function extractSimilarTerms(response) {
        if (typeof response != 'undefined') {
            var terms = [];
            for (var i = 0; i < response.length; i++) {
                terms.push(response[i].term);
            }
            return terms;
        }
    }

    /**
     * Extracts the positions array from an object, if it exists.
     *
     * @param object
     * @returns {Array}
     */
    function extractPositions(object) {
        if (typeof object != 'undefined') {
            return object.positions;
        }
    }

    /**
     * Wraps a callback function with a pre-processing function that transforms data before passing it to the callback.
     *
     * @param callback the callback function to wrap.
     * @param wrapper the wrapping function.
     * @returns {*}
     */
    function wrapCallback(callback, wrapper) {
        if (typeof callback != 'undefined') {
            var originalCallback = callback;
            callback = function (data) {
                var response = wrapper(data);
                originalCallback(response);
            }
        }
        return callback;
    }

    /**
     * Converts a single callback function to a callbacks object with the passed callback defined as the success
     * function.
     *
     * @param callback the callback function to wrap.
     * @returns {{success: *}}
     */
    function wrapAsSuccessCallback(callback) {
        return {success: callback};
    }

    return lite;
});