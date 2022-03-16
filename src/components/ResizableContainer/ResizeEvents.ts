export type ResizeCallback = (width: any, height: any) => void;

interface Subscriber {
    id: string;
    callback: ResizeCallback;
    context?: any;
}

const registeredPanes: Partial<Subscriber>[] = [];
const subscribers: Subscriber[] = [];

export default class ResizeListeners {
    /**
     * Register a resizable pane to fire resize events
     * @param id Id of the pane
     * @param context Pane context
     * @returns A function used to fire resize events which takes the new width and new height of the pane
     */
    public static register(id: string, context?: any) {
        registeredPanes.push({ id, context });
        return (w, h) =>
            subscribers.filter((sub) => sub.id === id).forEach((sub) => sub.callback.call(sub.context, w, h));
    }

    /**
     * @param id Id of the pane that is being subscribed to (the pane that will fire the resize event)
     * @param callback Callback to execute when the pane is resized
     * @param context Callback context
     */
    public static subscribe(id: string, callback: ResizeCallback, context?: any) {
        subscribers.push({ id, callback, context });
    }
}
