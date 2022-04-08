import {
    createGetRequest,
    createGenericGetRequest,
    createPostRequest,
    createPutRequest,
    createDeleteRequest,
    createParamString,
} from '../util';

// import * as SockJS from 'sockjs-client';
// import * as Stomp from 'stomp-websocket';

const devServerAddress = 'http://localhost:';
const prodServerAddress = window.location.protocol + '//' + window.location.hostname + ':';

const exampleServiceUrl = devServerAddress + '9900/example';
// const exampleServiceSocketAddress = devServerAddress + '9900/socket';

const getExampleService = createGetRequest(exampleServiceUrl);
const postExampleService = createPostRequest(exampleServiceUrl);
const putExampleService = createPutRequest(exampleServiceUrl);
const deleteExampleService = createDeleteRequest(exampleServiceUrl);
const genericGetExampleService = createGenericGetRequest(exampleServiceUrl, 'cors', 'text/plain');

interface ExampleObj {
    id: number;
    description: string;
}

export function getExampleObj(): Promise<ExampleObj> {
    return getExampleService('/obj');
}

export function postExampleObj(obj: ExampleObj) {
    return postExampleService('/obj', obj);
}

export function putExampleObj(obj: ExampleObj) {
    return putExampleService(`/obj/${obj.id}`, obj); // example of id as path variable
}

export function deleteExampleObj(obj: ExampleObj) {
    const params = createParamString({ id: obj.id });
    return deleteExampleService('/obj' + params); // example of id as request param
}

// For get request that returns a string
export function genericGetExampleObj(obj: ExampleObj): Promise<string> {
    return genericGetExampleService(`/getDescription/${obj.id}`).then((response) => {
        const text = response.text();
        return text.catch((e) => {
            throw Error(response.statusText);
        });
    });
}

// HOW TO SET UP SOCKJS WEBSOCKET LISTENER

// let exampleServiceSocket;
// let exampleStompClient;

// export function connectExampleSocket(objCallBack: (obj: ExampleObj) => void) {
//     exampleServiceSocket = new SockJS(exampleServiceSocketAddress);
//     exampleStompClient = Stomp.over(exampleServiceSocket);
//     exampleStompClient.debug = () = {}; // turns off debug comments
//     exampleStompClient.connect(
//         {},
//         (frame) => {
//             exampleStompClient.subscribe('/topic/obj', (object) => {
//                 objCallBack(JSON.parse(object.body));
//             })

//             exampleStompClient.send('/app/triggerObjects');
//         },
//         // Fires on socket failure to attempt reconnect
//         () => {
//             setTimeout(() => {
//                 connectExampleSocket(objCallBack);
//             }, 1000);
//         }
//     )
// }
