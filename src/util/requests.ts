export const createGenericGetRequest = (apiUrl: string, mode: RequestMode, contentType?: string) => {
    const getRequest = (endpointUrl: string) => {
        const fullUrl = apiUrl + endpointUrl;

        return fetch(fullUrl, {
            // credentials: 'include',
            method: 'GET',
            mode,
            headers: { 'Content-Type': contentType ? contentType : 'application/json' },
        });
    };

    return getRequest;
};

export const createGetRequest = (apiUrl: string, init?: RequestInit) => {
    const getRequest = <T = any>(endpointUrl: string) => {
        const fullUrl = apiUrl + endpointUrl;

        return fetch(fullUrl, {
            // credentials: 'include',
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            ...init,
        }).then((response) => {
            if (!response.ok) {
                const json = response.json();
                return json
                    .catch((e) => {
                        throw Error(response.statusText);
                    })
                    .then((e) => {
                        throw Error(e.errorMessage);
                    });
            } else {
                return response.json() as Promise<T>;
            }
        });
    };

    return getRequest;
};

export const createGenericPostRequest = (apiUrl: string, mode: RequestMode, contentType) => {
    const postRequest = (endpointUrl: string, args) => {
        const fullUrl = apiUrl + endpointUrl;

        return fetch(fullUrl, {
            // credentials: 'include',
            method: 'POST',
            mode,
            headers: { 'Content-Type': contentType },
            body: args,
        });
    };
    return postRequest;
};

export const createPostRequest = (apiUrl: string, init?: RequestInit) => {
    const postRequest = <T = any>(endpointUrl: string, args) => {
        const fullUrl = apiUrl + endpointUrl;

        return fetch(fullUrl, {
            // credentials: 'include',
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            ...init,
            body: JSON.stringify(args),
        }).then((response) => {
            if (!response.ok) {
                const json = response.json();
                return json
                    .catch((e) => {
                        throw Error(response.statusText);
                    })
                    .then((e) => {
                        throw Error(e.errorMessage);
                    });
            } else {
                return response.json() as Promise<T>;
            }
        });
    };

    return postRequest;
};

export const createGenericDeleteRequest = (apiUrl: string, contentType?: string) => {
    const deleteRequest = (endpointUrl: string) => {
        const fullUrl = apiUrl + endpointUrl;

        return fetch(fullUrl, {
            credentials: 'include',
            method: 'DELETE',
            mode: 'cors',
            headers: { 'Content-Type': contentType ? contentType : 'application/json' },
        });
    };

    return deleteRequest;
};

export const createDeleteRequest = (apiUrl: string, init?: RequestInit) => {
    const deleteRequest = <T = any>(endpointUrl: string) => {
        const fullUrl = apiUrl + endpointUrl;

        return fetch(fullUrl, {
            // credentials: 'include',
            method: 'DELETE',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            ...init,
        }).then((response) => {
            if (!response.ok) {
                throw Error(response.statusText);
            } else {
                return response.json() as Promise<T>;
            }
        });
    };

    return deleteRequest;
};

export const createGenericPutRequest = (apiUrl: string, contentType?: string) => {
    const putRequest = (endpointUrl: string, args) => {
        const fullUrl = apiUrl + endpointUrl;

        return fetch(fullUrl, {
            credentials: 'include',
            method: 'PUT',
            mode: 'cors',
            headers: { 'Content-Type': contentType ? contentType : 'application/json' },
            body: JSON.stringify(args),
        });
    };

    return putRequest;
};

export const createPutRequest = (apiUrl: string, init?: RequestInit) => {
    const putRequest = <T = any>(endpointUrl: string, args) => {
        const fullUrl = apiUrl + endpointUrl;

        return fetch(fullUrl, {
            // credentials: 'include',
            method: 'PUT',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            ...init,
            body: JSON.stringify(args),
        }).then((response) => {
            if (!response.ok) {
                throw Error(response.statusText);
            } else {
                return response.json() as Promise<T>;
            }
        });
    };

    return putRequest;
};

export const createParamString = (params: {}, toUpperCase?: boolean) => {
    let str = '?';
    Object.keys(params).forEach((key, index) => {
        const param = params[key];

        if (param === undefined || param === null || param === '') {
            return;
        }

        if (toUpperCase) {
            key = key.toUpperCase();
        }

        str += key + '=' + param + '&';
    });

    return encodeURI(str.slice(0, str.length - 1));
};
